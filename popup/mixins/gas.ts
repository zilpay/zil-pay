import type { IFTokenState } from 'background/storage';
import { GasSpeed } from 'config/gas';
import type { RequiredTxParams } from 'types/gas';
import { format as dnumFormat, multiply as dnumMultiply, type Dnum } from 'dnum';
import { abbreviateNumber } from './numbers';

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
): GasOptionDetails[] {
    const isEIP1559 = gasEstimate.feeHistory.priorityFee > 0n;

    const gasLevels = {
        [GasSpeed.Low]: {
            priorityFee: gasEstimate.maxPriorityFee > 0n ? gasEstimate.maxPriorityFee - gasEstimate.maxPriorityFee / 4n : 0n,
            gasPrice: gasEstimate.gasPrice > 0n ? gasEstimate.gasPrice - gasEstimate.gasPrice / 4n : 0n,
            label: 'confirm.gas.low',
            time: '~45s'
        },
        [GasSpeed.Market]: {
            priorityFee: gasEstimate.maxPriorityFee,
            gasPrice: gasEstimate.gasPrice,
            label: 'confirm.gas.market',
            time: '~30s'
        },
        [GasSpeed.Aggressive]: {
            priorityFee: gasEstimate.maxPriorityFee + gasEstimate.maxPriorityFee / 4n,
            gasPrice: gasEstimate.gasPrice + gasEstimate.gasPrice / 4n,
            label: 'confirm.gas.aggressive',
            time: '~15s'
        }
    };

    return (Object.values(GasSpeed).filter(v => typeof v === 'number') as GasSpeed[]).map(speed => {
        const level = gasLevels[speed];
        const details: { label: string, value: string }[] = [];
        let totalFee: bigint;

        if (isEIP1559) {
            const maxFee = gasEstimate.feeHistory.baseFee * 2n + level.priorityFee;
            totalFee = (gasEstimate.feeHistory.baseFee + level.priorityFee) * gasEstimate.txEstimateGas;
            
            details.push(
                { label: 'confirm.gas.estimated', value: gasEstimate.txEstimateGas.toString() },
                { label: 'confirm.gas.baseFee', value: formatGwei(gasEstimate.feeHistory.baseFee) },
                { label: 'confirm.gas.priorityFee', value: formatGwei(level.priorityFee) },
                { label: 'confirm.gas.maxFee', value: formatGwei(maxFee) }
            );
        } else {
            totalFee = level.gasPrice * gasEstimate.txEstimateGas;
            details.push(
                { label: 'confirm.gas.estimated', value: gasEstimate.txEstimateGas.toString() },
                { label: 'confirm.gas.gasPrice', value: formatGwei(level.gasPrice) }
            );
        }

        const feeDnum: Dnum = [totalFee, nativeToken.decimals];
        const fiatValue = dnumMultiply(feeDnum, nativeToken.rate);

        return {
            speed,
            label: level.label,
            time: level.time,
            fee: `${abbreviateNumber(totalFee.toString(), nativeToken.decimals)} ${nativeToken.symbol}`,
            fiatFee: dnumFormat(fiatValue),
            details
        };
    });
}
