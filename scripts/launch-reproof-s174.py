#!/usr/bin/env python3
"""S174 cert re-proof launcher — the reaper-proof double-fork (the S110
doctrine). Runs scripts/cert-reproof-s174.sh (chunks 3+4 cold re-proof)."""
import os
import sys

LOG = "/home/z/my-project/omni-study1/reproof-s174.log"


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
    os.execvp("bash", ["bash", "scripts/cert-reproof-s174.sh"])


if __name__ == "__main__":
    daemonize_and_run()
    sys.exit(0)
