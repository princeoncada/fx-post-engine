import { NextResponse } from "next/server";
import { loadFxMovers } from "@/lib/fx/load-fx-movers";
import { generateCaption } from "@/lib/fx/caption";
import { screenshotFxCards } from "@/lib/fx/screenshot";

export async function GET() {

    if (process.env.VERCEL === "1") {
        return Response.json(
            { error: "This route is disabled in production. Run locally only." },
            { status: 403 }
        );
    }
    
    const { retrievedDate, latestData, previousData, movers } = await loadFxMovers(3);
    const caption = generateCaption(latestData.date, retrievedDate);
    const imagePaths = await screenshotFxCards(latestData.date);

    return NextResponse.json({
        date: latestData.date,
        retrievedDate,
        previousDate: previousData.date,
        imagePaths,
        caption,
        movers,
    });
}
