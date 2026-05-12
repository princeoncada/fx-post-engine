// src/lib/fx/screenshot.ts

import { chromium } from "playwright";
import path from "path";

export async function screenshotFxCards(date: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const browser = await chromium.launch();

    const page = await browser.newPage({
        viewport: { width: 1080, height: 1080 },
        deviceScaleFactor: 1,
    });

    const paths: string[] = [];

    for (const rank of [1, 2, 3]) {
        const outputPath = path.join(
            process.cwd(),
            "public",
            "generated",
            `fx-mover-${rank}-${date}.png`
        );

        await page.goto(`${baseUrl}/fx-card?rank=${rank}`, {
            waitUntil: "networkidle",
        });

        await page.screenshot({
            path: outputPath,
            fullPage: false,
        });

        paths.push(`/generated/fx-mover-${rank}-${date}.png`);
    }

    await browser.close();

    return paths;
}