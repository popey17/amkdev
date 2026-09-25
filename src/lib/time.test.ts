import { expect, it } from "vitest";

import * as time from "./time";
import { formatThailandTime } from "./time";

it("computes the delay until the next whole minute", () => {
  const msUntilNextMinute = (
    time as { msUntilNextMinute?: (date: Date) => number }
  ).msUntilNextMinute;

  expect(msUntilNextMinute).toBeTypeOf("function");
  expect(msUntilNextMinute!(new Date("2026-09-24T12:00:45.250Z"))).toBe(14_750);
  expect(msUntilNextMinute!(new Date("2026-09-24T12:00:00.000Z"))).toBe(60_000);
});

it("formats a deterministic instant in Thailand time", () => {
  expect(formatThailandTime(new Date("2026-09-24T12:00:00Z"))).toBe(
    "19:00 GMT+7",
  );
});
