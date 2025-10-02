import { ZERO_EVM, ZERO_ZIL } from 'config/common';

export function generateCryptoUrl({
    address,
    chain,
    token,
    amount,
}: {
    address: string;
    chain: string;
    token?: string;
    amount?: string;
}): string {
    let url = `${chain}:${address}`;
    const params = new URLSearchParams();

    if (token && token !== ZERO_ZIL && token !== ZERO_EVM) {
        params.append('token', token);
    }

    if (amount && amount !== "0" && amount.length > 0) {
        params.append('amount', amount);
    }

    const queryString = params.toString();
    if (queryString) {
        url += `?${queryString}`;
    }

    return url;
}


export function generateQRSecretData({
    chain,
    seedPhrase,
    privateKey,
}: {
    chain: string;
    seedPhrase?: string;
    privateKey?: string;
}): string {
    const params: string[] = [];

    if (seedPhrase) {
        params.push(`seed=${seedPhrase}`);
    }

    if (privateKey) {
        params.push(`key=${privateKey}`);
    }

    return `${chain}:?${params.join('&')}`;
}

export function parseQRSecretData(qrData: string): {
    chain?: string;
    seed?: string;
    key?: string;
} {
    const result: { chain?: string; seed?: string; key?: string } = {};
    const parts = qrData.split(':?');

    if (parts.length !== 2) {
        return result;
    }

    result.chain = parts[0];

    const params = new URLSearchParams(parts[1]);

    if (params.has('seed')) {
        result.seed = params.get('seed')!;
    }
    if (params.has('key')) {
        result.key = params.get('key')!;
    }

    return result;
}
