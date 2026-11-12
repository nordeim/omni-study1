#!/usr/bin/env python3
"""S178 spec runner — the reaper-proof double-fork (the S110/AGENTS.md
lesson: a process that must outlive a tool call must orphan itself to PID
1). Runs one playwright spec-file invocation (the arg) cold, logging to
s178-run.log. Same shape as launch-cert-s142.py, generalized to the
per-spec GREEN sweeps."""
import os
import sys

LOG = "/home/z/my-project/omni-study1/s178-run.log"


def daemonize_and_run():
    pid = os.fork()
    if pid > 0:
        print(f"launcher: parent exiting, child={pid}")
        return
    os.setsid()
    pid2 = os.fork()
    if pid2 > 0:
        os._exit(0)
    os.chdir("/home/z/my-project/omni-study1")
    fd = os.open(LOG, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
    os.dup2(fd, 1)
    os.dup2(fd, 2)
    os.close(fd)
    spec = sys.argv[1] if len(sys.argv) > 1 else "tests/e2e/parity-session7.spec.ts"
    extra = sys.argv[2] if len(sys.argv) > 2 else ""
    if extra:
        os.execvp("bunx", ["bunx", "playwright", "test", spec, "-g", extra])
    else:
        os.execvp("bunx", ["bunx", "playwright", "test", spec])


if __name__ == "__main__":
    daemonize_and_run()
    sys.exit(0)
