// app/api/post-facebook/route.ts

import { NextResponse } from "next/server";
import { postToFacebook } from "@/lib/facebook/post-to-facebook";

export async function POST(req: Request) {
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
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Failed to post to Facebook.",
            },
            { status: 500 }
        );
    }
}