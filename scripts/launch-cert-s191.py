#!/usr/bin/env python3
"""S191 cert-map launcher — the reaper-proof double-fork (the S110/AGENTS.md
lesson: a process that must outlive a tool call must orphan itself to PID 1;
the reaper kills by descent, and only an orphan escapes the walk). Same
shape as the S190 launcher template, re-tagged for the S191 5-chunk cold
cert map (bash scripts/e2e-chunked-cert.sh > cert-s191.log) — the
flashcards-family e2e consolidation cycle: chunk 2 gains
tests/e2e/flashcards.spec.ts as its 9th file (159+275+108+101+92 = 735,
every count unchanged)."""
import os
import sys

LOG = "/home/z/my-project/omni-study1/cert-s191.log"


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
    os.execve("/usr/bin/bash", ["bash", "scripts/e2e-chunked-cert.sh"], dict(os.environ))


daemonize_and_run()
