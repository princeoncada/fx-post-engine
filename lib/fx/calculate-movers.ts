// src/lib/fx/calculate-movers.ts

export type FxMover = {
    code: string;
    currentRateToPhp: number;
    previousRateToPhp: number;
    changePercent: number;
    direction: "up" | "down";
};

export function calculateMovers(
    todayRates: Record<string, number>,
    yesterdayRates: Record<string, number>,
    limit = 3
): FxMover[] {
    return Object.keys(todayRates)
        .map((code): FxMover => {
            const todayPhp = 1 / todayRates[code];
            const yesterdayPhp = 1 / yesterdayRates[code];

            const changePercent =
                ((todayPhp - yesterdayPhp) / yesterdayPhp) * 100;

            return {
                code,
                currentRateToPhp: todayPhp,
                previousRateToPhp: yesterdayPhp,
                changePercent,
                direction: changePercent >= 0 ? "up" : "down",
            };
        })
        .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
        .slice(0, limit);
}