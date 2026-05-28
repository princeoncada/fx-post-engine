// src/app/fx-post/page.tsx

import { FxPostTemplate } from "@/components/FxPostTemplate";
import { loadFxMovers } from "@/lib/fx/load-fx-movers";
import { formatPhtDate } from "@/lib/fx/pht-date";

export default async function FxPostPage() {
  const { retrievedDate, latestData, movers } = await loadFxMovers();

  return (
    <FxPostTemplate
      marketDateLabel={formatPhtDate(latestData.date, "long")}
      retrievedDateLabel={formatPhtDate(retrievedDate, "long")}
      movers={movers}
    />
  );
}
