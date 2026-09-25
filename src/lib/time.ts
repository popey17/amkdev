const thailandTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Bangkok",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// Thailand has a fixed UTC+7 offset with no daylight saving time.
const thailandOffsetMs = 7 * 60 * 60 * 1000;

export function formatThailandTime(date: Date): string {
  return `${thailandTimeFormatter.format(date)} GMT+7`;
}

export function formatThailandDateTime(date: Date): string {
  const local = new Date(date.getTime() + thailandOffsetMs).toISOString();
  return `${local.slice(0, 16)}+07:00`;
}

export function msUntilNextMinute(date: Date): number {
  return 60_000 - (date.getTime() % 60_000);
}
