// src/components/FxMoverCard.tsx

import type { FxMover } from "@/lib/fx/calculate-movers";

type Props = {
  mover: FxMover;
  rank: number;
  dateLabel: string;
};

const rankLabels: Record<number, string> = {
  1: "Top mover",
  2: "Second mover",
  3: "Third mover",
};

export function FxMoverCard({ mover, rank, dateLabel }: Props) {
  const normalizedChange =
    Math.abs(mover.changePercent) < 1
      ? Math.abs(mover.changePercent) * 100
      : Math.abs(mover.changePercent);

  const change = normalizedChange.toFixed(2);

  return (
    <main className="relative h-[1080px] w-[1080px] overflow-hidden bg-[#F4E8D3] font-sans text-[#0B3A2F]">
      <img
        src="/assets/fx-card-bg.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      <section className="relative z-10 flex h-full flex-col px-[92px] pb-[72px] pt-[360px]">
        <div className="flex flex-1 flex-col">
          {/* Badge */}
          <div className="inline-flex w-fit items-center rounded-full border border-[#C79A3E]/35 bg-[#FFF8EA]/80 px-8 py-3 shadow-[0_10px_28px_rgba(75,54,19,0.06)] backdrop-blur-sm">
            <span className="text-[21px] font-bold uppercase tracking-[0.18em] text-[#9B762C]">
              {rankLabels[rank] ?? `Top ${rank}`}
            </span>
          </div>

          {/* Heading */}
          <div className="mt-[54px]">
            <p className="text-[24px] font-semibold uppercase tracking-[0.16em] text-[#9B762C]">
              Currency Movement
            </p>

            <h1 className="mt-5 text-[158px] font-black leading-[0.82] tracking-[-0.08em] text-[#073D31]">
              {mover.code}
            </h1>

            <p className="mt-7 text-[42px] font-bold tracking-[-0.035em] text-[#9B762C]">
              vs Philippine Peso
            </p>
          </div>

          {/* Main Card */}
          <div className="mt-[72px] rounded-[42px] border border-[#D8B86B]/40 bg-[#FFF8EA]/82 p-[44px] shadow-[0_24px_60px_rgba(65,48,18,0.10)] backdrop-blur-sm">
            <div className="flex items-start justify-between gap-10">
              <div>
                <p className="text-[21px] font-bold uppercase tracking-[0.18em] text-[#766A55]">
                  Daily Movement
                </p>

                <div className="mt-7 flex items-end gap-5">
                  <div className="flex h-[94px] w-[94px] items-center justify-center rounded-full bg-[#B88A2E]/12 text-[#B88A2E]">
                    <span className="text-[56px] font-black leading-none">
                      +
                    </span>
                  </div>

                  <p className="text-[108px] font-black leading-[0.82] tracking-[-0.065em] text-[#073D31]">
                    {change}
                    <span className="text-[70px] tracking-[-0.04em]">%</span>
                  </p>
                </div>
              </div>

              {/* Floating Metric */}
              <div className="rounded-[30px] bg-[#0B3A2F]/[0.05] px-8 py-7 text-right">
                <p className="text-[20px] font-semibold uppercase tracking-[0.14em] text-[#766A55]">
                  Ranked
                </p>

                <p className="mt-3 text-[54px] font-black leading-none tracking-[-0.05em] text-[#073D31]">
                  #{rank}
                </p>
              </div>
            </div>

            {/* Bottom Divider */}
            <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-[#D8B86B]/50 to-transparent" />

            {/* Bottom Metrics */}
            <div className="mt-8 flex items-center justify-between">
              <div>
                <p className="text-[18px] font-semibold uppercase tracking-[0.14em] text-[#766A55]">
                  Market Trend
                </p>

                <p className="mt-2 text-[30px] font-black tracking-[-0.03em] text-[#073D31]">
                  Strong Daily Momentum
                </p>
              </div>

              <div className="text-right">
                <p className="text-[18px] font-semibold uppercase tracking-[0.14em] text-[#766A55]">
                  Currency
                </p>

                <p className="mt-2 text-[30px] font-black tracking-[-0.03em] text-[#073D31]">
                  {mover.code} / PHP
                </p>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />
        </div>

        {/* Footer */}
        <footer className="mt-10">
          <div className="flex items-end justify-between gap-10 border-t border-[#CDAA63]/35 pt-8">
            <div className="max-w-[660px]">
              <p className="text-[24px] font-black tracking-[-0.02em] text-[#073D31]">
                {dateLabel}
              </p>

              <p className="mt-3 text-[21px] font-medium leading-[1.45] text-[#6B5F4D]">
                Market reference only. Message ALSHIZAMIN for today&apos;s
                actual store rate.
              </p>
            </div>

            {/* CTA */}
            <button className="group relative inline-flex items-center gap-3 rounded-full border border-[#C79A3E]/40 bg-[#FFF8EA]/80 px-7 py-4 shadow-[0_10px_30px_rgba(75,54,19,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#9B762C]">
              <span className="text-[20px] font-bold text-[#9B762C]">
                View Live Rate
              </span>

              <span className="text-[24px] text-[#9B762C] transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}