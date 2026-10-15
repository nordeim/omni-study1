import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

// S22 pins — the AUTH_SECRET production boot guard (docs/remediation-plan-session22.md):
//
// (1) THE NEGATIVE SPAWN: the standalone production server REFUSES to boot
//     without AUTH_SECRET — the process exits non-zero with the actionable
//     message ("AUTH_SECRET is required in production … openssl rand -hex
//     32"). This pins the guard's presence in the BUILD (instrumentation
//     ships in .next/standalone) and its fail-fast mechanism — a plain
//     throw would be caught by Next and leave a degraded 500-server
//     (validated empirically; the guard uses console.error + process.exit).
//
// (2) THE POSITIVE CONTROL: the suite's own webServer boots WITH a proper
//     AUTH_SECRET (playwright.config.ts) and answers /api/health — the
//     guard never misfires on a correctly-configured boot. Every other
//     spec in the suite re-proves this implicitly; this pin makes it
//     explicit next to the negative case.
//
// Mechanism notes: register() runs once per server boot (standalone,
// next start, dev) and never during `next build` — the build step in the
// gate is unaffected. The spawn omits AUTH_SECRET from an EXPLICIT env
// object (spreading process.env would inherit the webServer's secret —
// the whole point is its absence).
test.use({ storageState: "tests/e2e/.auth/user.json" });

const GUARD_PORT = 3999;

test.describe("S22 the AUTH_SECRET production boot guard", () => {
  test("the standalone server exits non-zero without AUTH_SECRET (the actionable message)", async () => {
    const server = join(process.cwd(), ".next", "standalone", "server.js");
    // A missing build is a setup problem, not a guard problem — fail loudly.
    expect(existsSync(server), "run `bun run build` before this spec").toBe(true);

    const child = spawn("bun", [server], {
      cwd: process.cwd(),
      env: {
        PATH: process.env.PATH ?? "",
        HOME: process.env.HOME ?? "",
        PORT: String(GUARD_PORT),
        NODE_ENV: "production",
        // The e2e scratch database — the guard fires at boot, before any
        // request/db touch, but a resolvable URL keeps this spawn's ONLY
        // variable the missing secret.
        DATABASE_URL: "file:../db/e2e.db",
        // AUTH_SECRET deliberately ABSENT.
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";
    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });

    const exitCode = await new Promise<number | null>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`server did not exit within 20s; output so far:\n${output}`)),
        20_000,
      );
      child.once("exit", (code) => {
        clearTimeout(timer);
        resolve(code);
      });
      child.once("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    }).finally(() => {
      // Belt-and-braces: never leak the child if the wait above failed.
      child.kill("SIGKILL");
    });

    // Fail-fast: a non-zero exit (NOT a signal-kill, NOT a clean 0).
    expect(exitCode).not.toBe(0);
    expect(exitCode).not.toBe(null);

    // The actionable message — names the variable, the risk, and the fix.
    expect(output).toContain("AUTH_SECRET is required in production");
    expect(output).toContain("openssl rand -hex 32");

    // And the port is NOT serving after exit (connection refused).
    const probe = await fetch(`http://localhost:${GUARD_PORT}/api/health`).then(
      () => "serving",
      () => "refused",
    );
    expect(probe).toBe("refused");
  });

  test("the suite's own server (AUTH_SECRET set) is healthy — the positive control", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { status?: string; db?: string; app?: string };
    expect(body.status).toBe("ok");
    expect(body.db).toBe("up");
    expect(body.app).toBe("studyflow");
  });
});
