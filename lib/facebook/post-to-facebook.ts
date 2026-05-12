// lib/facebook/post-to-facebook.ts

import fs from "fs";
import path from "path";
import FormData from "form-data";

type PostToFacebookInput = {
    imagePaths: string[];
    caption: string;
};

type FacebookPhotoUploadResponse = {
    id: string;
    post_id?: string;
};

export async function postToFacebook({
    imagePaths,
    caption,
}: PostToFacebookInput) {
    const pageId = process.env.META_PAGE_ID;
    const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
    const graphVersion = process.env.META_GRAPH_VERSION ?? "v25.0";

    if (!pageId || !pageAccessToken) {
        throw new Error("Missing META_PAGE_ID or META_PAGE_ACCESS_TOKEN.");
    }

    const uploadedPhotoIds: string[] = [];

    for (const imagePath of imagePaths) {
        const absolutePath = path.join(process.cwd(), "public", imagePath);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Image not found: ${absolutePath}`);
        }

        const form = new FormData();

        form.append("source", fs.createReadStream(absolutePath));
        form.append("published", "false");
        form.append("access_token", pageAccessToken);

        const uploadRes = await fetch(
            `https://graph.facebook.com/${graphVersion}/${pageId}/photos`,
            {
                method: "POST",
                body: form as unknown as BodyInit,
                headers: form.getHeaders() as HeadersInit,
            }
        );

        const uploadJson =
            (await uploadRes.json()) as FacebookPhotoUploadResponse & {
                error?: { message: string };
            };

        if (!uploadRes.ok) {
            throw new Error(uploadJson.error?.message ?? "Photo upload failed.");
        }

        uploadedPhotoIds.push(uploadJson.id);
    }

    const feedParams = new URLSearchParams();

    feedParams.append("message", caption);
    feedParams.append("access_token", pageAccessToken);

    uploadedPhotoIds.forEach((photoId, index) => {
        feedParams.append(
            `attached_media[${index}]`,
            JSON.stringify({ media_fbid: photoId })
        );
    });

    const postRes = await fetch(
        `https://graph.facebook.com/${graphVersion}/${pageId}/feed`,
        {
            method: "POST",
            body: feedParams,
        }
    );

    const postJson = (await postRes.json()) as {
        id?: string;
        error?: { message: string };
    };

    if (!postRes.ok) {
        throw new Error(postJson.error?.message ?? "Facebook post failed.");
    }

    return {
        postId: postJson.id,
        uploadedPhotoIds,
    };
}