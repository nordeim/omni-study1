#!/usr/bin/env python3
"""S192 standalone launcher — the reaper-proof double-fork (the S110/AGENTS.md
lesson: a process that must outlive a tool call must orphan itself to PID 1;
the reaper kills by descent, and only an orphan escapes the walk). Boots the
PRODUCTION standalone build on :3200 for the standing reference sweeps
(ref-resweep / census probes ride a fresh-build standalone — the S191 lesson
1: NEVER rebuild over a live standalone daemon; kill by port first).
Same shape as the launch-dev-s* template, re-tagged for the S192 cycle.

The S192 lesson-1 pin: DATABASE_URL is SHELL-PROVIDED in the execve env —
bun auto-loads .env files walking UP the tree from the CWD, and a PARENT
WORKSPACE .env (/home/z/my-project/.env in this sandbox, an absolute
file:/home/z/my-project/db/custom.db pointing at a non-existent file)
SHADOWS the repo's own .env ("file:../db/custom.db"). A shell env var wins
over every .env file (verified: bun -e with an exported var). This is the
same mechanism tests/e2e/global-setup.ts uses to pin the scratch e2e db."""
import os
import sys

LOG = "/home/z/my-project/omni-study1/standalone-3200.log"
PORT = "3200"


def daemonize_and_run():
    # fork 1: child detaches from the tool-call shell
    pid = os.fork()
    if pid > 0:
        print(f"launcher: parent exiting, child={pid}")
        return
    os.setsid()
    # fork 2: the grandchild orphans to PID 1 (the reaper-proof signature)
    pid2 = os.fork()
    if pid2 > 0:
        os._exit(0)
    # stdio to the log; cwd at the repo root (the standalone server.js
    # chdir's itself into .next/standalone at boot)
    os.chdir("/home/z/my-project/omni-study1")
    fd = os.open(LOG, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
    os.dup2(fd, 1)
    os.dup2(fd, 2)
    os.close(fd)
    env = dict(os.environ)
    env["NODE_ENV"] = "production"
    env["PORT"] = PORT
    # The S192 lesson-1 pin (see module docstring): shell-provided
    # DATABASE_URL wins over every .env file bun walks up to — without
    # this, the parent workspace's .env points the standalone at a
    # non-existent db and every query dies with error 14.
    env["DATABASE_URL"] = "file:../db/custom.db"
    # The S112 lesson-1 recipe: the repo .env keeps AUTH_SECRET="" so the
    # BUNDLED .next/standalone/.env ships empty (the s22 negative-spawn
    # spec's contract); this :3200 verification host supplies the real
    # secret through the SHELL env instead (wins over the bundled file).
    env["AUTH_SECRET"] = os.environ.get("STANDALONE_AUTH_SECRET", "")
    os.execve(
        "/usr/local/bin/bun",
        ["bun", ".next/standalone/server.js"],
        env,
    )


if __name__ == "__main__":
    daemonize_and_run()
    sys.exit(0)
