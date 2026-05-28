// src/app/fx-card/page.tsx

import { FxMoverCard } from "@/components/FxMoverCard";
import { loadFxMovers } from "@/lib/fx/load-fx-movers";
import { formatPhtDate } from "@/lib/fx/pht-date";

type Props = {
  searchParams: Promise<{
    rank?: string;
  }>;
};

export default async function FxCardPage({ searchParams }: Props) {
  const params = await searchParams;
  const rank = Number(params.rank ?? 1);

  const { retrievedDate, latestData, movers } = await loadFxMovers(3);
  const mover = movers[rank - 1];

  if (!mover) {
    return null;
  }

  return (
    <FxMoverCard
      mover={mover}
      rank={rank}
      marketDateLabel={formatPhtDate(latestData.date, "short")}
      retrievedDateLabel={formatPhtDate(retrievedDate, "short")}
    />
  );
}
