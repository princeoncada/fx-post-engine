// lib/facebook/post-to-facebook.ts

import fs from "fs";
import path from "path";

type PostToFacebookInput = {
    imagePaths: string[];
    caption: string;
    retryDelaysMs?: number[];
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

type FacebookPostResponse = {
    id?: string;
    error?: FacebookPhotoUploadResponse["error"];
};

type FacebookErrorDetails = {
    stage:
        | "config"
        | "page-check"
        | "photo-upload"
        | "feed-publish"
        | "photo-cleanup";
    status?: number;
    graphCode?: number;
    graphSubcode?: number;
    fbtraceId?: string;
    imageIndex?: number;
    attempts?: number;
    uploadedPhotoIds?: string[];
};

export class FacebookPostError extends Error {
    details: FacebookErrorDetails;

    constructor(message: string, details: FacebookErrorDetails) {
        super(message);
        this.name = "FacebookPostError";
        this.details = details;
    }
}

const DEFAULT_UPLOAD_RETRY_DELAYS_MS = [1000, 3000, 7000];
const RETRYABLE_HTTP_STATUSES = new Set([500, 502, 503, 504]);

function maskToken(token?: string) {
    if (!token) return "MISSING";
    return `${token.slice(0, 8)}...${token.slice(-6)}`;
}

function sanitizeFacebookResponse<T extends { access_token?: string }>(data: T) {
    return {
        ...data,
        access_token: data.access_token ? maskToken(data.access_token) : undefined,
    };
}

function logFacebookStep(label: string, data: unknown) {
    console.log(`\n[FACEBOOK DEBUG] ${label}`);
    console.dir(data, { depth: null });
}

function getFacebookErrorDetails(
    stage: FacebookErrorDetails["stage"],
    response: FacebookPhotoUploadResponse | FacebookPostResponse,
    options: Partial<FacebookErrorDetails> = {}
): FacebookErrorDetails {
    return {
        stage,
        graphCode: response.error?.code,
        graphSubcode: response.error?.error_subcode,
        fbtraceId: response.error?.fbtrace_id,
        ...options,
    };
}

function isRetryableUploadFailure(
    status: number,
    response?: FacebookPhotoUploadResponse
) {
    return RETRYABLE_HTTP_STATUSES.has(status) || response?.error?.code === 1;
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadUnpublishedPhoto({
    uploadUrl,
    absolutePath,
    effectivePageAccessToken,
    imageIndex,
    retryDelaysMs,
}: {
    uploadUrl: string;
    absolutePath: string;
    effectivePageAccessToken: string;
    imageIndex: number;
    retryDelaysMs: number[];
}) {
    const attempts = retryDelaysMs.length;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        const fileBuffer = await fs.promises.readFile(absolutePath);
        const fileBlob = new Blob([fileBuffer], { type: "image/png" });
        const form = new FormData();

        form.append("source", fileBlob, path.basename(absolutePath));
        form.append("published", "false");
        form.append("access_token", effectivePageAccessToken);

        try {
            const uploadRes = await fetch(uploadUrl, {
                method: "POST",
                body: form,
            });

            const uploadJson =
                (await uploadRes.json()) as FacebookPhotoUploadResponse;

            logFacebookStep(`UPLOAD ${imageIndex} RESPONSE`, {
                status: uploadRes.status,
                ok: uploadRes.ok,
                attempt,
                attempts,
                uploadJson,
            });

            if (uploadRes.ok && uploadJson.id) {
                return uploadJson.id;
            }

            const retryable = isRetryableUploadFailure(
                uploadRes.status,
                uploadJson
            );

            if (!retryable || attempt === attempts) {
                throw new FacebookPostError(
                    uploadJson.error?.message ?? "Photo upload failed.",
                    getFacebookErrorDetails("photo-upload", uploadJson, {
                        status: uploadRes.status,
                        imageIndex,
                        attempts: attempt,
                    })
                );
            }
        } catch (error) {
            if (error instanceof FacebookPostError) {
                throw error;
            }

            if (attempt === attempts) {
                throw new FacebookPostError(
                    error instanceof Error
                        ? error.message
                        : "Photo upload failed.",
                    {
                        stage: "photo-upload",
                        imageIndex,
                        attempts: attempt,
                    }
                );
            }
        }

        await sleep(retryDelaysMs[attempt - 1]);
    }

    throw new FacebookPostError("Photo upload failed.", {
        stage: "photo-upload",
        imageIndex,
        attempts,
    });
}

async function cleanupUploadedPhotos({
    graphVersion,
    uploadedPhotoIds,
    effectivePageAccessToken,
}: {
    graphVersion: string;
    uploadedPhotoIds: string[];
    effectivePageAccessToken: string;
}) {
    for (const photoId of uploadedPhotoIds) {
        try {
            const cleanupParams = new URLSearchParams();
            cleanupParams.append("access_token", effectivePageAccessToken);

            const cleanupRes = await fetch(
                `https://graph.facebook.com/${graphVersion}/${photoId}`,
                {
                    method: "DELETE",
                    body: cleanupParams,
                }
            );

            logFacebookStep("PHOTO CLEANUP RESPONSE", {
                photoId,
                status: cleanupRes.status,
                ok: cleanupRes.ok,
            });
        } catch (error) {
            logFacebookStep("PHOTO CLEANUP FAILED", {
                photoId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
}

export async function postToFacebook({
    imagePaths,
    caption,
    retryDelaysMs = DEFAULT_UPLOAD_RETRY_DELAYS_MS,
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
        throw new FacebookPostError(
            "Missing or invalid META_PAGE_ID or META_PAGE_ACCESS_TOKEN.",
            { stage: "config" }
        );
    }

    const pageCheckRes = await fetch(
        `https://graph.facebook.com/${graphVersion}/${pageId}?fields=id,name,access_token&access_token=${pageAccessToken}`
    );

    const pageCheckJson = await pageCheckRes.json();
    const effectivePageAccessToken = pageCheckJson.access_token ?? pageAccessToken;

    console.log("[FACEBOOK DEBUG] PAGE CHECK", {
        status: pageCheckRes.status,
        ok: pageCheckRes.ok,
        pageCheckJson: sanitizeFacebookResponse(pageCheckJson),
        effectivePageAccessTokenPreview: maskToken(effectivePageAccessToken),
    });

    if (!pageCheckRes.ok) {
        throw new FacebookPostError(
            pageCheckJson.error?.message ?? "Facebook page check failed.",
            getFacebookErrorDetails("page-check", pageCheckJson, {
                status: pageCheckRes.status,
            })
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
            throw new FacebookPostError(`Image not found: ${absolutePath}`, {
                stage: "photo-upload",
                imageIndex: index,
            });
        }

        const uploadUrl = `https://graph.facebook.com/${graphVersion}/${pageId}/photos`;

        logFacebookStep(`UPLOAD ${index} REQUEST`, {
            uploadUrl,
            fields: {
                source: absolutePath,
                published: "false",
                access_token: maskToken(effectivePageAccessToken),
            },
        });

        const photoId = await uploadUnpublishedPhoto({
            uploadUrl,
            absolutePath,
            effectivePageAccessToken,
            imageIndex: index,
            retryDelaysMs,
        });

        uploadedPhotoIds.push(photoId);
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
        accessTokenPreview: maskToken(effectivePageAccessToken),
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

    const postJson = (await postRes.json()) as FacebookPostResponse;

    logFacebookStep("FEED RESPONSE", {
        status: postRes.status,
        ok: postRes.ok,
        postJson,
    });

    if (!postRes.ok) {
        await cleanupUploadedPhotos({
            graphVersion,
            uploadedPhotoIds,
            effectivePageAccessToken,
        });

        throw new FacebookPostError(
            postJson.error?.message ?? "Facebook post failed.",
            getFacebookErrorDetails("feed-publish", postJson, {
                status: postRes.status,
                uploadedPhotoIds,
            })
        );
    }

    return {
        postId: postJson.id,
        uploadedPhotoIds,
    };
}
