import type { IFTokenState } from 'background/storage';
import { GasSpeed } from 'config/gas';
import type { RequiredTxParams } from 'types/gas';
import { format as dnumFormat, multiply as dnumMultiply, type Dnum } from 'dnum';
import { abbreviateNumber } from './numbers';
import { getCurrencySymbol } from 'config/currencies';

export interface GasOptionDetails {
    speed: GasSpeed;
    label: string;
    time: string;
    fee: string;
    fiatFee: string;
    details: {
        label: string;
        value: string;
    }[];
}

const GWEI_DECIMALS = 9;

export function createDefaultGasOption(): GasOptionDetails {
    return {
        speed: GasSpeed.Market,
        label: '',
        time: '-',
        fee: '-',
        fiatFee: '-',
        details: []
    };
}

function formatGwei(value: bigint): string {
    if (value === 0n) return '0 Gwei';

    const dnumValue: Dnum = [value, GWEI_DECIMALS];
    return `${dnumFormat(dnumValue, { digits: 2, trailingZeros: false })} Gwei`;
}

export function calculateGasFee(
    gasEstimate: RequiredTxParams,
    nativeToken: IFTokenState,
    currencyConvert: string,
): GasOptionDetails[] {
    const isEIP1559 = gasEstimate.feeHistory.priorityFee > 0n;

    const gasLevels = {
        [GasSpeed.Low]: {
            multiplier: 10n,
            label: 'confirm.gas.low',
            time: '~45s'
        },
        [GasSpeed.Market]: {
            multiplier: 15n,
            label: 'confirm.gas.market',
            time: '~30s'
        },
        [GasSpeed.Aggressive]: {
            multiplier: 20n,
            label: 'confirm.gas.aggressive',
            time: '~15s'
        }
    };

    return (Object.values(GasSpeed).filter(v => typeof v === 'number') as GasSpeed[]).map(speed => {
        const level = gasLevels[speed];
        const details: { label: string, value: string }[] = [];
        let totalFee: bigint;

        if (isEIP1559) {
            const adjustedPriorityFee = (gasEstimate.maxPriorityFee * level.multiplier) / 10n;
            const maxFee = (gasEstimate.feeHistory.baseFee * 2n) + adjustedPriorityFee;
            totalFee = (gasEstimate.feeHistory.baseFee + adjustedPriorityFee) * gasEstimate.txEstimateGas;
            
            details.push(
                { label: 'confirm.gas.estimated', value: gasEstimate.txEstimateGas.toString() },
                { label: 'confirm.gas.baseFee', value: formatGwei(gasEstimate.feeHistory.baseFee) },
                { label: 'confirm.gas.priorityFee', value: formatGwei(adjustedPriorityFee) },
                { label: 'confirm.gas.maxFee', value: formatGwei(maxFee) }
            );
        } else {
            const adjustedGasPrice = (gasEstimate.gasPrice * level.multiplier) / 10n;
            totalFee = adjustedGasPrice * gasEstimate.txEstimateGas;
            details.push(
                { label: 'confirm.gas.estimated', value: gasEstimate.txEstimateGas.toString() },
                { label: 'confirm.gas.gasPrice', value: formatGwei(adjustedGasPrice) }
            );
        }

        const feeDnum: Dnum = [totalFee, nativeToken.decimals];
        let fiatFeeDisplay = '-';

        if (nativeToken.rate > 0) {
            const fiatValue = dnumMultiply(feeDnum, nativeToken.rate);
            const currencySymbol = getCurrencySymbol(currencyConvert);
            fiatFeeDisplay = `${currencySymbol}${abbreviateNumber(fiatValue[0].toString(), fiatValue[1])}`;
        }

        return {
            speed,
            label: level.label,
            time: level.time,
            fee: `${abbreviateNumber(totalFee.toString(), nativeToken.decimals)} ${nativeToken.symbol}`,
            fiatFee: fiatFeeDisplay,
            details
        };
    });
}
