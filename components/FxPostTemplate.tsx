// src/components/FxPostTemplate.tsx

import type { FxMover } from "@/lib/fx/calculate-movers";

type Props = {
  dateLabel: string;
  movers: FxMover[];
};

export function FxPostTemplate({ dateLabel, movers }: Props) {
  return (
    <main className="relative h-[1350px] w-[1080px] overflow-hidden bg-[#F4E8D3] text-[#123C2F]">
      <div className="absolute inset-0 p-20">
        <div className="text-4xl font-bold tracking-wide">ALSHIZAMIN</div>
        <div className="mt-2 text-2xl font-medium text-[#9B7A34]">
          Money Changer & Souvenir Shop
        </div>

        <section className="mt-28">
          <h1 className="text-[76px] font-bold leading-[0.98]">
            Top 5 Currency Movers vs PHP
          </h1>
          <p className="mt-8 text-3xl text-[#6F624D]">{dateLabel}</p>
        </section>

        <section className="mt-16 space-y-6">
          {movers.map((m, index) => (
            <div
              key={m.code}
              className="flex items-center justify-between rounded-[32px] bg-white/55 px-10 py-8"
            >
              <div className="text-[42px] font-bold">
                {index + 1}. {m.code}/PHP
              </div>
              <div className="text-[40px] font-bold text-[#9B7A34]">
                {m.direction === "up" ? "↑" : "↓"}{" "}
                {Math.abs(m.changePercent).toFixed(2)}%
              </div>
            </div>
          ))}
        </section>

        <footer className="absolute bottom-20 left-20 right-20 text-[26px] leading-snug text-[#5F5545]">
          Market reference only. Actual ALSHIZAMIN buying and selling rates may
          vary.
          <br />
          Message us for today’s store rate. Davao City.
        </footer>
      </div>
    </main>
  );
}