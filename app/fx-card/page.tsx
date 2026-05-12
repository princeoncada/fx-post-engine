// src/app/fx-card/page.tsx

import dayjs from "dayjs";
import { FxMoverCard } from "@/components/FxMoverCard";
import { fetchRates } from "@/lib/fx/fetch-rates";
import { calculateMovers } from "@/lib/fx/calculate-movers";

type Props = {
  searchParams: Promise<{
    rank?: string;
  }>;
};

export default async function FxCardPage({ searchParams }: Props) {
  const params = await searchParams;
  const rank = Number(params.rank ?? 1);

  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(2, "day").format("YYYY-MM-DD");

  const [todayData, yesterdayData] = await Promise.all([
    fetchRates(today),
    fetchRates(yesterday),
  ]);

  const movers = calculateMovers(todayData.rates, yesterdayData.rates, 3);
  const mover = movers[rank - 1];

  if (!mover) {
    return null;
  }

  return (
    <FxMoverCard
      mover={mover}
      rank={rank}
      dateLabel={dayjs(today).format("MM/DD/YYYY")}
    />
  );
}