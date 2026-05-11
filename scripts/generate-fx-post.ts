
// src/scripts/generate-fx-post.ts

const secret = process.env.CRON_SECRET ?? "";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

async function main() {
    const res = await fetch(`${baseUrl}/api/generate-fx-post`, {
        headers: {
            authorization: `Bearer ${secret}`,
        },
    });

    const data = await res.json();
    console.log(data);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});