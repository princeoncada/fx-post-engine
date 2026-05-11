// src/lib/fx/screenshot.ts

import { chromium } from "playwright";
import path from "path";

export async function screenshotFxPost(date: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const outputPath = path.join(process.cwd(), "public", "generated", `fx-post-${date}.png`);

    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: { width: 1080, height: 1350 },
        deviceScaleFactor: 1,
    });

    await page.goto(`${baseUrl}/fx-post`, { waitUntil: "networkidle" });
    await page.screenshot({ path: outputPath, fullPage: true });

    await browser.close();

    return `/generated/fx-post-${date}.png`;
}