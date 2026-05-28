import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { inspect } from "node:util";
import { afterEach, beforeEach, test } from "node:test";
import {
    FacebookPostError,
    postToFacebook,
} from "../../lib/facebook/post-to-facebook";

const RAW_PAGE_TOKEN = "EAASSyrrdVgwBRmZArRawPageTokenForTestsZD";

const originalFetch = globalThis.fetch;
const originalCwd = process.cwd();
const originalEnv = { ...process.env };
const originalConsoleLog = console.log;
const originalConsoleDir = console.dir;

let tempRoot = "";
let logs: string[] = [];

function jsonResponse(status: number, body: unknown) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
    });
}

async function createGeneratedImage(name: string) {
    const imagePath = path.join(tempRoot, "public", "generated", name);
    await writeFile(imagePath, Buffer.from([137, 80, 78, 71]));
    return `/generated/${name}`;
}

beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(tmpdir(), "facebook-upload-test-"));
    await mkdir(path.join(tempRoot, "public", "generated"), {
        recursive: true,
    });
    process.chdir(tempRoot);

    process.env = {
        ...originalEnv,
        META_PAGE_ID: "102816121536200",
        META_PAGE_ACCESS_TOKEN: "fallback-page-token",
        META_GRAPH_VERSION: "v25.0",
    };

    logs = [];
    console.log = (...args: unknown[]) => {
        logs.push(args.map((arg) => inspect(arg, { depth: null })).join(" "));
    };
    console.dir = (obj?: unknown) => {
        logs.push(inspect(obj, { depth: null }));
    };
});

afterEach(async () => {
    globalThis.fetch = originalFetch;
    console.log = originalConsoleLog;
    console.dir = originalConsoleDir;
    process.env = originalEnv;
    process.chdir(originalCwd);

    if (tempRoot) {
        await rm(tempRoot, { recursive: true, force: true });
    }
});

test("retries transient photo upload failures and posts attached media", async () => {
    const firstImage = await createGeneratedImage("first.png");
    const secondImage = await createGeneratedImage("second.png");
    const calls: string[] = [];

    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = String(input);
        calls.push(url);

        if (calls.length === 1) {
            return jsonResponse(200, {
                id: "102816121536200",
                name: "Test Page",
                access_token: RAW_PAGE_TOKEN,
            });
        }

        if (url.endsWith("/photos") && calls.length === 2) {
            return jsonResponse(200, { id: "photo-one" });
        }

        if (url.endsWith("/photos") && calls.length === 3) {
            return jsonResponse(500, {
                error: {
                    code: 1,
                    message:
                        "Please reduce the amount of data you're asking for, then retry your request",
                },
            });
        }

        if (url.endsWith("/photos") && calls.length === 4) {
            return jsonResponse(200, { id: "photo-two" });
        }

        if (url.endsWith("/feed")) {
            return jsonResponse(200, { id: "page_post_id" });
        }

        throw new Error(`Unexpected fetch call: ${url}`);
    }) as typeof fetch;

    const result = await postToFacebook({
        imagePaths: [firstImage, secondImage],
        caption: "Caption",
        retryDelaysMs: [0, 0, 0],
    });

    assert.deepEqual(result, {
        postId: "page_post_id",
        uploadedPhotoIds: ["photo-one", "photo-two"],
    });
    assert.equal(calls.filter((url) => url.endsWith("/photos")).length, 3);
    assert.equal(logs.join("\n").includes(RAW_PAGE_TOKEN), false);
});

test("fails with clear details after exhausting retryable upload attempts", async () => {
    const firstImage = await createGeneratedImage("first.png");
    let calls = 0;

    globalThis.fetch = (async (input: RequestInfo | URL) => {
        calls += 1;
        const url = String(input);

        if (calls === 1) {
            return jsonResponse(200, {
                id: "102816121536200",
                name: "Test Page",
                access_token: RAW_PAGE_TOKEN,
            });
        }

        if (url.endsWith("/photos")) {
            return jsonResponse(500, {
                error: {
                    code: 1,
                    error_subcode: 99,
                    fbtrace_id: "trace-id",
                    message:
                        "Please reduce the amount of data you're asking for, then retry your request",
                },
            });
        }

        throw new Error(`Unexpected fetch call: ${url}`);
    }) as typeof fetch;

    await assert.rejects(
        () =>
            postToFacebook({
                imagePaths: [firstImage],
                caption: "Caption",
                retryDelaysMs: [0, 0, 0],
            }),
        (error) => {
            assert.equal(error instanceof FacebookPostError, true);
            assert.equal((error as FacebookPostError).details.stage, "photo-upload");
            assert.equal((error as FacebookPostError).details.imageIndex, 0);
            assert.equal((error as FacebookPostError).details.attempts, 3);
            assert.equal((error as FacebookPostError).details.status, 500);
            assert.equal((error as FacebookPostError).details.graphCode, 1);
            assert.equal((error as FacebookPostError).details.fbtraceId, "trace-id");
            return true;
        }
    );
    assert.equal(calls, 4);
});

test("does not retry non-retryable photo upload failures", async () => {
    const firstImage = await createGeneratedImage("first.png");
    let calls = 0;

    globalThis.fetch = (async (input: RequestInfo | URL) => {
        calls += 1;
        const url = String(input);

        if (calls === 1) {
            return jsonResponse(200, {
                id: "102816121536200",
                name: "Test Page",
                access_token: RAW_PAGE_TOKEN,
            });
        }

        if (url.endsWith("/photos")) {
            return jsonResponse(400, {
                error: {
                    code: 100,
                    message: "Invalid parameter",
                },
            });
        }

        throw new Error(`Unexpected fetch call: ${url}`);
    }) as typeof fetch;

    await assert.rejects(
        () =>
            postToFacebook({
                imagePaths: [firstImage],
                caption: "Caption",
                retryDelaysMs: [0, 0, 0],
            }),
        (error) => {
            assert.equal(error instanceof FacebookPostError, true);
            assert.equal((error as FacebookPostError).details.stage, "photo-upload");
            assert.equal((error as FacebookPostError).details.attempts, 1);
            assert.equal((error as FacebookPostError).details.status, 400);
            assert.equal((error as FacebookPostError).details.graphCode, 100);
            return true;
        }
    );
    assert.equal(calls, 2);
});
