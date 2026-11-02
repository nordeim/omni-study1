import { afterEach, describe, expect, it } from "vitest";

import { DEFAULT_SITE_URL, siteUrl } from "@/lib/site";

// The documented contract (README "Site", DEPLOYMENT.md §2, PAD env table):
// NEXT_PUBLIC_SITE_URL is the canonical public origin used for metadata,
// sitemap.xml and robots.txt — with an http://localhost:3000 dev default.

describe("siteUrl", () => {
  const ORIGINAL = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL;
  });

  it("defaults to http://localhost:3000 when the env var is unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(siteUrl()).toBe("http://localhost:3000");
    expect(DEFAULT_SITE_URL).toBe("http://localhost:3000");
  });

  it("reads NEXT_PUBLIC_SITE_URL and trims surrounding whitespace", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "  https://study.example.com  ";
    expect(siteUrl()).toBe("https://study.example.com");
  });

  it("strips trailing slashes so URL joins never double the separator", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://study.example.com///";
    expect(siteUrl()).toBe("https://study.example.com");
  });

  it("falls back to the default when the value is empty after trimming", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "   ";
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("lets an explicit override win over the environment (call-site control)", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://env.example.com";
    expect(siteUrl("https://override.example.com/")).toBe(
      "https://override.example.com",
    );
  });
});

// S131/CF10 — the siteUrl self-heal (docs/remediation-plan-session131.md).
//
// The s131 shell audit's I4: siteUrl() accepted any non-empty string, so a
// malformed NEXT_PUBLIC_SITE_URL ("studyflow", no scheme) reached
// `new URL(siteUrl())` at layout module scope and threw — every route 500s
// at evaluation. The guard: URL.canParse self-heals to the localhost
// default (the sitemap build-time consumption already catches most cases;
// this makes the runtime path degrade, not crash).
describe("siteUrl rejects malformed origins (S131/CF10)", () => {
  it("falls back to the default when the env var is not a parseable URL (no scheme)", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "studyflow";
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("falls back to the default on other malformed shapes", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://"; // scheme with no host
    expect(siteUrl()).toBe("http://localhost:3000");
    process.env.NEXT_PUBLIC_SITE_URL = "://missing-scheme.example.com";
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("keeps every valid origin (http, https, custom port, path)", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://study.example.com";
    expect(siteUrl()).toBe("https://study.example.com");
    process.env.NEXT_PUBLIC_SITE_URL = "http://192.168.1.10:8080/";
    expect(siteUrl()).toBe("http://192.168.1.10:8080");
  });
});
