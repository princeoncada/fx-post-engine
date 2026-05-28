import { calculateMovers } from "./calculate-movers";
import { fetchPreviousDistinctRates, fetchRates } from "./fetch-rates";
import { getPhtTodayDate } from "./pht-date";

export async function loadFxMovers(limit = 3) {
    const retrievedDate = getPhtTodayDate();
    const latestData = await fetchRates(retrievedDate);
    const previousData = await fetchPreviousDistinctRates(latestData.date);
    const movers = calculateMovers(latestData.rates, previousData.rates, limit);

    return {
        retrievedDate,
        latestData,
        previousData,
        movers,
    };
}
