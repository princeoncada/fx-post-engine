// app/api/post-facebook/route.ts

import { NextResponse } from "next/server";
import {
    FacebookPostError,
    postToFacebook,
} from "@/lib/facebook/post-to-facebook";

export async function POST(req: Request) {

    if (process.env.VERCEL === "1") {
        return Response.json(
            { error: "This route is disabled in production. Run locally only." },
            { status: 403 }
        );
    }

    try {
        const body = await req.json();

        const imagePaths = body.imagePaths;
        const caption = body.caption;

        if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
            return NextResponse.json(
                { error: "Missing generated image paths." },
                { status: 400 }
            );
        }

        if (!caption || typeof caption !== "string") {
            return NextResponse.json(
                { error: "Missing caption." },
                { status: 400 }
            );
        }

        const result = await postToFacebook({ imagePaths, caption });

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        if (error instanceof FacebookPostError) {
            return NextResponse.json(
                {
                    error: error.message,
                    details: error.details,
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Failed to post to Facebook.",
            },
            { status: 500 }
        );
    }
}
