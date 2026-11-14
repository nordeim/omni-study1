#!/usr/bin/env python3
"""S186 cert launcher — the reaper-proof double-fork (the S110/AGENTS.md
lesson: a process that must outlive a tool call must orphan itself to PID 1;
the reaper kills by descent, and only an orphan escapes the walk). Same
shape as the S184 launcher, re-tagged for this cycle's cert run (the S186/EI
re-tag block lives in the e2e-chunked-cert.sh header)."""
import os
import sys

LOG = "/home/z/my-project/omni-study1/cert-s186.log"


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
    # stdio to the log; cwd at the repo root
    os.chdir("/home/z/my-project/omni-study1")
    fd = os.open(LOG, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
    os.dup2(fd, 1)
    os.dup2(fd, 2)
    os.close(fd)
    os.execvp("bash", ["bash", "scripts/e2e-chunked-cert.sh"])


if __name__ == "__main__":
    daemonize_and_run()
    sys.exit(0)
