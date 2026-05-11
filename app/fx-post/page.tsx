// src/app/fx-post/page.tsx

import dayjs from "dayjs";
import { FxPostTemplate } from "@/components/FxPostTemplate";
import { fetchRates } from "@/lib/fx/fetch-rates";
import { calculateMovers } from "@/lib/fx/calculate-movers";

export default async function FxPostPage() {
  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  const [todayData, yesterdayData] = await Promise.all([
    fetchRates(today),
    fetchRates(yesterday),
  ]);

  const movers = calculateMovers(todayData.rates, yesterdayData.rates);

  return (
    <FxPostTemplate
      dateLabel={dayjs(today).format("MMMM D, YYYY")}
      movers={movers}
    />
  );
}