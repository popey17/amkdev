import { describe, expect, it } from "vitest";

import rawTechStack from "./tech-stack.json";
import { resolveTechStack, techStack } from "./tech-stack";

describe("tech stack JSON", () => {
  it("resolves every configured entry, in order, with its icon", () => {
    expect(techStack.map((item) => item.name)).toEqual(rawTechStack.map((item) => item.name));
    for (const item of techStack) expect(item.icon).toBeDefined();
  });

  it("resolves brand slugs to SVG paths and lucide names to generic icons", () => {
    const [react, cloud, plain] = resolveTechStack([
      { name: "React", icon: "react" },
      { name: "Cloud", icon: "lucide:cloud" },
      { name: "No icon" },
    ]);

    expect(react!.icon).toMatchObject({ kind: "brand", title: "React" });
    expect(react!.icon?.kind === "brand" && react!.icon.path).toMatch(/^M/);
    expect(cloud!.icon).toEqual({ kind: "generic", name: "cloud" });
    expect(plain).toEqual({ name: "No icon" });
  });

  it.each([
    [{ name: "X", icon: "not-a-real-brand" }, /tech-stack\.json\[0\]: unknown brand icon "not-a-real-brand"/],
    [{ name: "X", icon: "lucide:unicorn" }, /unknown generic icon "lucide:unicorn"/],
    [{ name: "" }, /non-empty "name"/],
    [{ name: "X", icon: 3 }, /"icon" must be a string/],
  ])("rejects a bad entry with a pointed message (%o)", (entry, message) => {
    expect(() => resolveTechStack([entry])).toThrow(message);
  });

  it("rejects a non-array document", () => {
    expect(() => resolveTechStack({ name: "React" })).toThrow(/must be an array/);
  });
});
