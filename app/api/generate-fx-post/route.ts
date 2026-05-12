import dayjs from "dayjs";
import { NextResponse } from "next/server";
import { fetchRates } from "@/lib/fx/fetch-rates";
import { calculateMovers } from "@/lib/fx/calculate-movers";
import { generateCaption } from "@/lib/fx/caption";
import { screenshotFxCards } from "@/lib/fx/screenshot";

export async function GET(req: Request) {
    const auth = req.headers.get("authorization");
    const secret = process.env.CRON_SECRET;
    const isDev = process.env.NODE_ENV === "development";

    if (!isDev && secret && auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const today = dayjs().format("YYYY-MM-DD");
    const yesterday = dayjs().subtract(2, "day").format("YYYY-MM-DD");

    console.log(today, yesterday);

    const [todayData, yesterdayData] = await Promise.all([
        fetchRates(today),
        fetchRates(yesterday),
    ]);

    const movers = calculateMovers(todayData.rates, yesterdayData.rates, 3);
    const caption = generateCaption(dayjs(today).format("MM/DD/YYYY"));
    const imagePaths = await screenshotFxCards(today);

    console.log(movers[0].changePercent)
    console.log(movers[1].changePercent)
    console.log(movers[2].changePercent)

    return NextResponse.json({
        date: today,
        imagePaths,
        caption,
        movers,
    });
}