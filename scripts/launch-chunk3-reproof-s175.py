#!/usr/bin/env python3
"""S175 chunk-3 re-proof launcher — the reaper-proof double-fork (the
S110/AGENTS.md lesson), same shape as launch-cert-s175.py, logging to
chunk3-reproof-s175.log."""
import os
import sys

LOG = "/home/z/my-project/omni-study1/chunk3-reproof-s175.log"


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
    os.execvp("bash", ["bash", "scripts/rerun-chunk3-s175.sh"])


if __name__ == "__main__":
    daemonize_and_run()
    sys.exit(0)
