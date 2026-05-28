export const PHT_TIME_ZONE = "Asia/Manila";

function getDateParts(date: Date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: PHT_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function getPhtTodayDate(now = new Date()) {
    const parts = getDateParts(now);
    return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatPhtDate(date: string, format: "short" | "long") {
    const phtDate = new Date(`${date}T00:00:00+08:00`);

    if (format === "short") {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: PHT_TIME_ZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(phtDate);
    }

    return new Intl.DateTimeFormat("en-US", {
        timeZone: PHT_TIME_ZONE,
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(phtDate);
}
