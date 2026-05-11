// src/lib/fx/caption.ts

import type { FxMover } from "./calculate-movers";

export function generateCaption(dateLabel: string, movers: FxMover[]) {
    const list = movers
        .map((m, index) => {
            const arrow = m.direction === "up" ? "↑" : "↓";
            return `${index + 1}. ${m.code}/PHP ${arrow} ${Math.abs(m.changePercent).toFixed(2)}%`;
        })
        .join("\n");

    return `Today’s top currency movers against the Philippine Peso are in.

${list}

Rates move daily. Message ALSHIZAMIN for today’s actual buying and selling rates.

Market reference only. Actual buying and selling rates may vary.

📍Davao City

#ALSHIZAMIN #MoneyChangerDavao #CurrencyExchangeDavao #USDtoPHP #PHPExchangeRate #DavaoCity`;
}