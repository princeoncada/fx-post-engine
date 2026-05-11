// src/app/api/generate-fx-post/route.ts

import dayjs from "dayjs";
import { NextResponse } from "next/server";
import { fetchRates } from "@/lib/fx/fetch-rates";
import { calculateMovers } from "@/lib/fx/calculate-movers";
import { generateCaption } from "@/lib/fx/caption";
import { screenshotFxPost } from "@/lib/fx/screenshot";

export async function GET(req: Request) {
    const auth = req.headers.get("authorization");
    const secret = process.env.CRON_SECRET;

    if (secret && auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = dayjs().format("YYYY-MM-DD");
    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

    const [todayData, yesterdayData] = await Promise.all([
        fetchRates(today),
        fetchRates(yesterday),
    ]);

    const movers = calculateMovers(todayData.rates, yesterdayData.rates);
    const caption = generateCaption(dayjs(today).format("MMMM D, YYYY"), movers);
    const imagePath = await screenshotFxPost(today);

    return NextResponse.json({
        date: today,
        imagePath,
        caption,
        movers,
    });
}