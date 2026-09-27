import { describe, expect, it } from "vitest";

import {
  isValidEmail,
  isVerifiedHttpsUrl,
  isVerifiedMailtoUrl,
  isVerifiedSocialUrl,
} from "./social-url";

describe("social-url", () => {
  it("accepts https social profiles", () => {
    expect(isVerifiedHttpsUrl("https://github.com/popey17")).toBe(true);
    expect(isVerifiedSocialUrl("https://github.com/popey17")).toBe(true);
  });

  it("rejects non-https web URLs", () => {
    expect(isVerifiedHttpsUrl("http://example.com")).toBe(false);
    expect(isVerifiedHttpsUrl("javascript:alert(1)")).toBe(false);
    expect(isVerifiedSocialUrl("http://example.com")).toBe(false);
  });

  it("accepts mailto with a valid address", () => {
    expect(isVerifiedMailtoUrl("mailto:contact@amkdev.com")).toBe(true);
    expect(isVerifiedSocialUrl("mailto:contact@amkdev.com")).toBe(true);
  });

  it("rejects empty or invalid mailto", () => {
    expect(isVerifiedMailtoUrl("mailto:")).toBe(false);
    expect(isVerifiedMailtoUrl("mailto:not-an-email")).toBe(false);
    expect(isVerifiedSocialUrl("mailto:owner@example")).toBe(false);
  });

  it("validates bare email addresses", () => {
    expect(isValidEmail("contact@amkdev.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
  });
});
