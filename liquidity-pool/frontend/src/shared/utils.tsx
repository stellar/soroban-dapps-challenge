export function formatAmount(undivided: BigInt, decimals: number): string {
    let n;

    if (undivided.valueOf() < BigInt(Number.MAX_SAFE_INTEGER)) {
        n = Number(undivided) / (10 ** decimals);
    } else {
        n = parseFloat((undivided.valueOf() / (10n ** BigInt(decimals))).toString());
    }

    return n.toFixed(2); // This will format the number to have exactly 2 decimal places.
}

const Utils = {
    formatAmount,
}

export { Utils }
