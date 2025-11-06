export function abbreviateNumber(value: number | string, decimals: number, compact = true): string {
    const num = Number(value) / (10 ** decimals);

    if (isNaN(num)) {
        return '0';
    }

    if (Math.abs(num) >= 1000 && compact) {
        return new Intl.NumberFormat(undefined, {
            notation: 'compact',
            compactDisplay: 'short',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(num);
    }

    if (Math.abs(num) < 0.01 && num !== 0 && compact) {
        return new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 6,
            useGrouping: false
        }).format(num);
    }

    const formatted = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        useGrouping: true
    }).format(num);

    return formatted;
}
