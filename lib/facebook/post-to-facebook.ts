// lib/facebook/post-to-facebook.ts

import fs from "fs";
import path from "path";

type PostToFacebookInput = {
    imagePaths: string[];
    caption: string;
};

type FacebookPhotoUploadResponse = {
    id?: string;
    post_id?: string;
    error?: {
        message: string;
        type?: string;
        code?: number;
        error_subcode?: number;
        fbtrace_id?: string;
    };
};

function maskToken(token?: string) {
    if (!token) return "MISSING";
    return `${token.slice(0, 8)}...${token.slice(-6)}`;
}

function logFacebookStep(label: string, data: unknown) {
    console.log(`\n[FACEBOOK DEBUG] ${label}`);
    console.dir(data, { depth: null });
}

export async function postToFacebook({
    imagePaths,
    caption,
}: PostToFacebookInput) {
    const pageId = process.env.META_PAGE_ID;
    const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
    const graphVersion = process.env.META_GRAPH_VERSION ?? "v25.0";

    logFacebookStep("ENV", {
        pageId,
        pageIdType: typeof pageId,
        pageIdLength: pageId?.length,
        graphVersion,
        hasAccessToken: Boolean(pageAccessToken),
        accessTokenPreview: maskToken(pageAccessToken),
        cwd: process.cwd(),
    });

    if (!pageId || pageId === "0" || !pageAccessToken) {
        throw new Error("Missing or invalid META_PAGE_ID or META_PAGE_ACCESS_TOKEN.");
    }

    const pageCheckRes = await fetch(
        `https://graph.facebook.com/${graphVersion}/${pageId}?fields=id,name,access_token&access_token=${pageAccessToken}`
    );

    const pageCheckJson = await pageCheckRes.json();
    const effectivePageAccessToken = pageCheckJson.access_token ?? pageAccessToken;

    console.log("[FACEBOOK DEBUG] PAGE CHECK", {
        status: pageCheckRes.status,
        ok: pageCheckRes.ok,
        pageCheckJson,
        effectivePageAccessTokenPreview: maskToken(effectivePageAccessToken),
    });

    if (!pageCheckRes.ok) {
        throw new Error(
            effectivePageAccessToken.error?.message ?? "Facebook page check failed."
        );
    }

    const uploadedPhotoIds: string[] = [];

    for (const [index, imagePath] of imagePaths.entries()) {
        const cleanImagePath = imagePath.startsWith("/")
            ? imagePath.slice(1)
            : imagePath;

        const absolutePath = path.join(process.cwd(), "public", cleanImagePath);

        logFacebookStep(`IMAGE ${index}`, {
            originalImagePath: imagePath,
            cleanImagePath,
            absolutePath,
            exists: fs.existsSync(absolutePath),
        });

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Image not found: ${absolutePath}`);
        }

        const uploadUrl = `https://graph.facebook.com/${graphVersion}/${pageId}/photos`;

        console.log(uploadUrl)

        logFacebookStep(`UPLOAD ${index} REQUEST`, {
            uploadUrl,
            fields: {
                source: absolutePath,
                published: "false",
                access_token: maskToken(effectivePageAccessToken),
            },
        });

        const fileBuffer = await fs.promises.readFile(absolutePath);
        const fileBlob = new Blob([fileBuffer], { type: "image/png" });

        const form = new FormData();

        form.append("source", fileBlob, path.basename(absolutePath));
        form.append("published", "false");
        form.append("access_token", effectivePageAccessToken);

        const uploadRes = await fetch(uploadUrl, {
            method: "POST",
            body: form,
        });

        const uploadJson =
            (await uploadRes.json()) as FacebookPhotoUploadResponse;

        logFacebookStep(`UPLOAD ${index} RESPONSE`, {
            status: uploadRes.status,
            ok: uploadRes.ok,
            uploadJson,
        });

        if (!uploadRes.ok || !uploadJson.id) {
            throw new Error(uploadJson.error?.message ?? "Photo upload failed.");
        }

        uploadedPhotoIds.push(uploadJson.id);
    }

    logFacebookStep("ALL UPLOADED PHOTO IDS", {
        uploadedPhotoIds,
        count: uploadedPhotoIds.length,
    });

    const feedUrl = `https://graph.facebook.com/${graphVersion}/${pageId}/feed`;

    const attachedMediaDebug = uploadedPhotoIds.map((photoId, index) => ({
        key: `attached_media[${index}]`,
        value: JSON.stringify({ media_fbid: photoId }),
        rawPhotoId: photoId,
    }));

    logFacebookStep("FEED REQUEST", {
        feedUrl,
        messageLength: caption.length,
        messagePreview: caption.slice(0, 300),
        accessTokenPreview: maskToken(pageAccessToken),
        attachedMediaDebug,
    });

    const feedParams = new URLSearchParams();

    feedParams.append("message", caption);
    feedParams.append("access_token", effectivePageAccessToken);
    feedParams.append("published", "true");

    uploadedPhotoIds.forEach((photoId, index) => {
        feedParams.append(
            `attached_media[${index}]`,
            JSON.stringify({ media_fbid: photoId })
        );
    });

    const postRes = await fetch(feedUrl, {
        method: "POST",
        body: feedParams,
    });

    const postJson = (await postRes.json()) as {
        id?: string;
        error?: {
            message: string;
            type?: string;
            code?: number;
            error_subcode?: number;
            fbtrace_id?: string;
        };
    };

    logFacebookStep("FEED RESPONSE", {
        status: postRes.status,
        ok: postRes.ok,
        postJson,
    });

    if (!postRes.ok) {
        throw new Error(postJson.error?.message ?? "Facebook post failed.");
    }

    return {
        postId: postJson.id,
        uploadedPhotoIds,
    };
}