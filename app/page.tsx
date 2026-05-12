"use client";

import { useState } from "react";

type GenerateResult = {
  date: string;
  imagePaths: string[];
  caption: string;
  movers: {
    code: string;
    changePercent: number;
    currentRateToPhp: number;
    previousRateToPhp: number;
  }[];
};

export default function Home() {
  const [data, setData] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  async function generatePost() {
    setLoading(true);
    setUploadStatus(null);

    const res = await fetch("/api/generate-fx-post");
    const json = await res.json();

    setData(json);
    setLoading(false);
  }

  async function copyCaption() {
    if (!data?.caption) return;
    await navigator.clipboard.writeText(data.caption);
    alert("Caption copied.");
  }

  async function uploadToFacebook() {
    if (!data) return;

    setUploading(true);
    setUploadStatus(null);

    const res = await fetch("/api/post-facebook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imagePaths: data.imagePaths,
        caption: data.caption,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setUploadStatus(json.error ?? "Upload failed.");
    } else {
      setUploadStatus("Posted to Facebook successfully.");
    }

    setUploading(false);
  }

  return (
    <main className="min-h-screen bg-[#F4E8D3] px-6 py-10 text-[#0B3A2F]">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-[-0.04em]">
              ALSHIZAMIN FX Engine
            </h1>

            <p className="mt-3 text-lg text-[#6B5F4D]">
              Generate, review, and upload today’s Top 3 currency movers vs PHP.
            </p>
          </div>

          <button
            onClick={generatePost}
            disabled={loading || uploading}
            className="rounded-full bg-[#0B3A2F] px-8 py-5 text-lg font-black text-[#F4E8D3] transition-all hover:-translate-y-1 disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate Today’s FX Post"}
          </button>
        </div>

        {data && (
          <>
            <section className="mt-12">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black tracking-[-0.03em]">
                  Card Preview
                </h2>

                <p className="text-lg font-semibold text-[#6B5F4D]">
                  {data.date}
                </p>
              </div>

              <div className="mt-6 grid gap-8 lg:grid-cols-3">
                {data.imagePaths.map((path, index) => {
                  const mover = data.movers[index];

                  return (
                    <div key={path} className="bg-white/50 shadow-[0_24px_70px_rgba(60,42,18,0.08)]">
                      <img
                        src={`${path}?v=${Date.now()}`}
                        alt={`FX Card ${index + 1}`}
                        className="aspect-square w-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-14">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black tracking-[-0.03em]">
                  Caption
                </h2>

                <button
                  onClick={copyCaption}
                  className="rounded-full border border-[#CDAA63]/40 bg-[#FFF8EA]/80 px-6 py-3 font-bold text-[#9B762C]"
                >
                  Copy Caption
                </button>
              </div>

              <textarea
                value={data.caption}
                readOnly
                className="mt-5 h-64 w-full rounded-[30px] border border-[#CDAA63]/35 bg-white/70 p-6 text-lg leading-relaxed shadow-[0_24px_60px_rgba(60,42,18,0.05)] outline-none"
              />
            </section>

            <section className="mt-14 border-t border-[#CDAA63]/35 pt-10">
              <div className="flex items-center justify-between gap-8">
                <div>
                  <h2 className="text-3xl font-black tracking-[-0.03em]">
                    Ready to Upload
                  </h2>

                  <p className="mt-2 text-lg text-[#6B5F4D]">
                    This will use the generated 3-card output and caption for the Facebook Page post.
                  </p>

                  {uploadStatus && (
                    <p className="mt-4 text-lg font-bold text-[#9B762C]">
                      {uploadStatus}
                    </p>
                  )}
                </div>

                <button
                  onClick={uploadToFacebook}
                  disabled={uploading || loading}
                  className="rounded-full bg-[#9B762C] px-10 py-5 text-lg font-black text-[#FFF8EA] transition-all hover:-translate-y-1 disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : "Upload to Facebook Page"}
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}