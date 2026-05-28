// src/components/FxMoverCard.tsx

import type { FxMover } from "@/lib/fx/calculate-movers";

type Props = {
  mover: FxMover;
  rank: number;
  marketDateLabel: string;
  retrievedDateLabel: string;
};

const rankLabels: Record<number, string> = {
  1: "Top mover",
  2: "Second mover",
  3: "Third mover",
};

export function FxMoverCard({
  mover,
  rank,
  marketDateLabel,
  retrievedDateLabel,
}: Props) {
  const change = Math.abs(mover.changePercent).toFixed(2);

  return (
    <main className="relative h-[1080px] w-[1080px] bg-[#F4E8D3] font-sans text-[#0B3A2F]">
      <img
        src="/assets/fx-card-bg.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      <section className="relative z-10 flex h-full flex-col px-[92px] pb-[72px] pt-[360px]">
        <div className="flex flex-col">
          {/* Badge */}
          <div className="inline-flex w-fit items-center rounded-full border border-[#C79A3E]/35 bg-[#FFF8EA]/80 px-8 py-3 shadow-[0_10px_28px_rgba(75,54,19,0.06)] backdrop-blur-sm">
            <span className="text-[21px] font-bold uppercase tracking-[0.18em] text-[#9B762C]">
              {rankLabels[rank] ?? `Top ${rank}`}
            </span>
          </div>

          {/* Heading */}
          <div className="flex justify-between">

            <div className="mt-[12px]">
              <h1 className="mt-5 text-[158px] font-black leading-[0.82] tracking-[-0.08em] text-[#073D31]">
                {mover.code}
              </h1>

              <p className="mt-2 text-[42px] font-bold tracking-[-0.035em] text-[#9B762C]">
                vs Philippine Peso
              </p>
            </div>

            {/* Main Card */}
            <div className="mt-4 rounded-[42px] border border-[#D8B86B]/40 bg-[#FFF8EA]/82 p-10 shadow-[0_24px_60px_rgba(65,48,18,0.10)] backdrop-blur-sm">
              <div className="flex items-start justify-between gap-10">
                <div>
                  <p className="text-[21px] font-bold uppercase tracking-[0.18em] text-[#766A55]">
                    Daily Movement
                  </p>

                  <div className="mt-7 flex items-end gap-5">
                    <p className="text-[108px] font-black leading-[0.82] text-[#073D31]">
                      + {change}
                      <span className="text-[70px] ml-2">%</span>
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-10">
          <div>
            <p className="text-[18px] font-semibold uppercase tracking-[0.14em] text-[#766A55]">
              Current
            </p>

            <p className="mt-2 text-[42px] font-black tracking-[-0.04em] text-[#073D31]">
              ₱ {mover.currentRateToPhp.toFixed(2)}
            </p>
          </div>

          <div className="h-16 w-px bg-[#D8B86B]/40" />

          <div>
            <p className="text-[18px] font-semibold uppercase tracking-[0.14em] text-[#766A55]">
              Previous
            </p>

            <p className="mt-2 text-[42px] font-black tracking-[-0.04em] text-[#9B762C]">
              ₱ {mover.previousRateToPhp.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-4">
          <div className="flex items-end justify-between gap-10 border-t border-[#CDAA63]/35 pt-8">
            <div className="max-w-[660px]">
              <p className="text-[24px] font-black tracking-[-0.02em] text-[#073D31]">
                Latest market data: {marketDateLabel}
              </p>

              <p className="mt-3 text-[21px] font-bold leading-[1.45] text-[#9B762C]">
                Retrieved: {retrievedDateLabel} PHT
              </p>

              <p className="mt-2 text-[21px] font-medium leading-[1.45] text-[#6B5F4D]">
                Market reference only. Message us for today&apos;s actual store rate.
              </p>
            </div>

          </div>
        </footer>
      </section>
    </main>
  );
}
