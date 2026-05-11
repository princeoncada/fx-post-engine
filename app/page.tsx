// src/app/page.tsx

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">ALSHIZAMIN FX Engine</h1>
      <p className="mt-3 text-gray-600">
        Daily Top 5 Currency Movers vs PHP content generator.
      </p>

      <div className="mt-8 space-y-3">
        <a className="block underline" href="/fx-post">
          Preview today’s post template
        </a>
        <a className="block underline" href="/api/generate-fx-post">
          Generate today’s PNG and caption
        </a>
      </div>
    </main>
  );
}