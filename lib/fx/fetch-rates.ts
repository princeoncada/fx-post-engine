// src/lib/fx/fetch-rates.ts

import { CURRENCIES } from "./currencies";

export async function fetchRates(date: string) {
    const symbols = CURRENCIES.join(",");
    const url = `https://api.frankfurter.dev/v1/${date}?base=PHP&symbols=${symbols}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
        throw new Error(`Failed to fetch FX rates: ${res.status}`);
    }

    return res.json() as Promise<{
        date: string;
        base: "PHP";
        rates: Record<string, number>;
    }>;
}