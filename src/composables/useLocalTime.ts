// composable/useLocalTime.ts
export function useLocalTime(defaultTimezone = "Europe/Moscow") {

    const pad = (num: number) => String(num).padStart(2, '0');

    const nowIso = (timezone?: string): string => {
        const tz = timezone || defaultTimezone;
        const now = new Date();

        // Берём компоненты времени в указанной таймзоне
        const formatter = new Intl.DateTimeFormat("sv-SE", {
            timeZone: tz,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        const parts = formatter.formatToParts(now);
        const y = parts.find(p => p.type === "year")?.value ?? "0000";
        const m = parts.find(p => p.type === "month")?.value ?? "00";
        const d = parts.find(p => p.type === "day")?.value ?? "00";
        const h = parts.find(p => p.type === "hour")?.value ?? "00";
        const min = parts.find(p => p.type === "minute")?.value ?? "00";
        const s = parts.find(p => p.type === "second")?.value ?? "00";

        return `${y}-${m}-${d}T${h}:${min}:${s}`;
    };

    return { nowIso };
}
