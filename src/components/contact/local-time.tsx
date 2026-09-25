"use client";

import { useEffect, useState } from "react";

import {
  formatThailandDateTime,
  formatThailandTime,
  msUntilNextMinute,
} from "@/lib/time";

export function LocalTime() {
  const [now, setNow] = useState<Date>();

  useEffect(() => {
    let interval: number | undefined;
    const tick = () => setNow(new Date());

    tick();
    const timeout = window.setTimeout(() => {
      tick();
      interval = window.setInterval(tick, 60_000);
    }, msUntilNextMinute(new Date()));

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <time
      className="font-mono text-(length:--text-small) uppercase tracking-[0.16em] text-ink-muted"
      dateTime={now ? formatThailandDateTime(now) : undefined}
    >
      {now ? formatThailandTime(now) : "Thailand time"}
    </time>
  );
}
