export function abbreviateNumber(value: number | string, decimals: number = 0): string {
    const num = Number(value) / (10 ** decimals);

    if (isNaN(num)) {
        return '0';
    }

    if (num < 1000 && num > -1000) {
        return new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
            useGrouping: false
        }).format(num);
    }

    return new Intl.NumberFormat(undefined, {
        notation: 'compact',
        compactDisplay: 'short',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(num);
}
