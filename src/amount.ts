export const MAX_MONEY = 10000000;

export function moneyRange(value: number) {
    return (value >= 0 && value <= MAX_MONEY);
}
