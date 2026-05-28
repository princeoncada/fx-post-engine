// src/lib/fx/fetch-rates.ts

import { CURRENCIES } from "./currencies";

export type FxRatesResponse = {
    date: string;
    base: "PHP";
    rates: Record<string, number>;
};

function ratesUrl(path: string) {
    const url = new URL(`https://api.frankfurter.dev/v1/${path}`);
    url.searchParams.set("base", "PHP");
    url.searchParams.set("symbols", CURRENCIES.join(","));
    return url;
}

async function fetchRatesUrl(url: URL) {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
        throw new Error(`Failed to fetch FX rates: ${res.status}`);
    }

    return res.json() as Promise<FxRatesResponse>;
}

export async function fetchRates(date: string) {
    return fetchRatesUrl(ratesUrl(date));
}

export async function fetchPreviousDistinctRates(date: string) {
    let cursor = date;

    for (let attempt = 0; attempt < 10; attempt += 1) {
        const previousDate = new Date(`${cursor}T00:00:00.000Z`);
        previousDate.setUTCDate(previousDate.getUTCDate() - 1);
        cursor = previousDate.toISOString().slice(0, 10);

        const data = await fetchRates(cursor);
        if (data.date !== date) {
            return data;
        }
    }

    throw new Error(`Could not find a previous FX market date before ${date}`);
}
