import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("fluid design tokens", () => {
  const css = readFileSync(resolve("src/app/globals.css"), "utf8");

  it.each([
    "--text-display",
    "--text-h1",
    "--text-h2",
    "--text-body",
    "--space-section",
    "--page-gutter",
  ])("defines %s with clamp()", (token) => {
    expect(css).toMatch(new RegExp(`${token}:\\s*clamp\\(`));
  });

  it.each([
    ["--color-ink-muted", "--ink-muted"],
    ["--color-surface-raised", "--surface-raised"],
    ["--color-line", "--line"],
  ])("maps %s to the semantic %s variable in @theme inline", (utility, token) => {
    const theme = css.match(/@theme inline\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(theme).toMatch(new RegExp(`${utility}:\\s*var\\(${token}\\)`));
  });

  it("gates reveal hiding behind prefers-reduced-motion: no-preference", () => {
    const pendingRules = [...css.matchAll(/\[data-reveal="pending"\]/g)];
    expect(pendingRules.length).toBeGreaterThan(0);
    const noPreference = css.match(
      /@media \(prefers-reduced-motion: no-preference\)\s*\{([\s\S]*?)\n\}/,
    )?.[1];
    expect(noPreference).toContain('[data-reveal="pending"]');
    expect(css.replace(noPreference ?? "", "")).not.toContain(
      '[data-reveal="pending"]',
    );
  });

  it("defines a light parchment theme that overrides the semantic surfaces", () => {
    const light = css.match(/:root\[data-theme="light"\]\s*\{([^}]*)\}/)?.[1] ?? "";
    for (const token of ["--surface", "--surface-raised", "--ink", "--ink-muted", "--line"]) {
      expect(light).toMatch(new RegExp(`${token}:`));
    }
    expect(light).toMatch(/color-scheme:\s*light/);
  });
});
