export function formatMoney(num) {
    if (num < 1000) return Math.floor(num).toLocaleString();
    
    const suffixes = [
        { v: 1e3, s: 'k' },
        { v: 1e6, s: 'M' },
        { v: 1e9, s: 'B' },
        { v: 1e12, s: 'T' },
        { v: 1e15, s: 'P' },
        { v: 1e18, s: 'E' },
        { v: 1e21, s: 'Z' },
        { v: 1e24, s: 'Y' }
    ];

    for (let i = suffixes.length - 1; i >= 0; i--) {
        if (num >= suffixes[i].v) {
            return parseFloat((num / suffixes[i].v).toFixed(2)) + suffixes[i].s;
        }
    }
    return num.toExponential(2);
}
