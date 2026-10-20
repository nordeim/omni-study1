Starting the new cycle (pointer: `docs/session_20.md`). First, checking workspace state:
Workspace reset again. Re-provisioning from scratch:
Clone at `ef0ed0a` (one new session-log commit on top of my `f701a53`). Provisioning: paramiko, ssh-infra, env/db, browsers:
Auth verified. Now env/db/seed + browsers download + build:
Provisioning in flight. Now reading `docs/session_20.md` — this cycle's directive:
session_20.md = my Session 74 transcript — the standing rhythm cycle. The open decision: Batch R (deferred RSC perf) vs gate+sweep. Let me re-read Batch R's definition to decide with evidence:
Batch R context confirmed: the a11y findings were fixed (both surfaces 100); the standing debt is only the **RSC structural conversion**, still justified by the clone's better LCP. This cycle: gate+sweep rhythm + two new evidence layers — (A) a cwv/Lighthouse-class re-audit re-validating the Batch R deferral post-AB, (B) a populated S6-family re-measure on the reference (the layer that found Batch AB). Checking the s72 probe drivers for reuse:
Driver patterns fully reusable. Checking build status, then starting the audit + gate chain:
Lint ✓ tsc ✓ unit **844/844** ✓. Checking browser install, then census + cold chunks:
Chunk 1a: **113/113** ✓. Chunks 1b + 1c:
Chunk 1b: **109/109** ✓, 1c: **50/50** ✓. Chunks 2 + 3:
**Full cold re-cert: 389/389** — first pass, zero flakes. Now the s75 sweep + clone server:
**s75 sweep: ok:true**. Now the cwv re-audit (the Batch R decision input):
**CWV re-audit re-validates the Batch R deferral decisively** — clone GOOD everywhere (dashboard mobile-throttled LCP 2308ms ≤2500, CLS 0), reference now measurably WORSE (login mobile LCP 8032ms POOR; dashboard mobile LCP 4296ms + **CLS 0.254 POOR**). The RSC conversion stays deferred on stronger evidence. Now the populated S6-family probe — checking v1's proven API payloads:
v1's proven patterns recovered (My Day quick-add for tasks, delta-based cleanup, AP-115 dumps). Writing the s75 populated S6-family probe:
Probe aborted at the Assignments nav step (timeout — the ref's nav label may differ) and emergency cleanup deleted only 1 of the 2 created objects. **Residue risk — verifying immediately:**
**RESIDUE ZERO** — all probe-created objects are gone (Task deleted by emergency cleanup; the event never persisted — its submit must have failed validation). The 1 Flashcard is pre-existing user data, untouched. Now diagnosing the nav failure:
Root cause clear: the event dialog **never closed** (submit failed validation — my driver skipped the required date field), and its overlay blocked every subsequent nav click. The locator resolved fine. Writing probe v2 with dialog-closure verification + full-field fill:
v2: **RESIDUE ZERO** but every dialog submit failed — the ref uses custom popover date pickers ("Pick date") and Subject selects, not fillable inputs, and the ref account has **zero subjects** (dialogs requiring one can't submit). The v1-proven Settings→Subjects flow must chain first. Checking v2's delta to confirm what actually got created:
Confirmed: v2 created only the task (deleted, 200) — measures captured zero-states. Writing v3 with the full chain: probe subject first (prerequisite for Assignment/Exam subject selects), popover date-pickers, combobox selects:
Major progress: **subject OK, task created, event SUBMITTED** (the ref's Start/End are `datetime-local` inputs). Remaining blocker: the popover date-pickers ("Pick date" — the day-click didn't register). Checking what v3 actually created and the measured text:
v3 created Task+Subject+Event (all cleaned, 200s, RESIDUE ZERO) — but the dump filter (headings + bold ≥14px only) missed regular-weight rows. The screenshots carry the real evidence. Verifying:
**Evidence verified** — the ref's populated Tasks view: two-pane (All Tasks count 1 + Important 0 + MY LISTS), row with radio circle + title + **red "📅 Oct 20" date pill** + amber priority icon. Also: notes button is "New Note" with an editor flow. And a likely picker root cause: **day 15 is in the past** — the ref calendar probably disables past dates. Writing v4 (final structured attempt): future day, instrumented popover, wider row dump, dashboard/myday added:
`stillPlaceholder:false` — **the due-date pick worked** (popover showed enabled day buttons 27/28/29, clicked 28). But submit failed and P4/P5 timed out. Checking the raw log for the exact blocker:
Mystery solved: `DIALOG-STILL-OPEN` shows the **calendar popover** (role=dialog too!) — my submit verified the WRONG layer. The popover stayed open, blocked P4/P5, and the measure phase worked only because `page.goto(dashboard)` reloaded past it. v4's picks actually registered. Checking measured texts, then v5 with layer-scoped locators:
Rich evidence secured (dashboard greeting by username, populated progress cards, calendar day-detail showing the task). Now v5 — final attempt with form-vs-popover layer-scoped locators:
One unsafe fallback — `mouse.click(30, 500)` lands in the sidebar (nav links). Fixing to a neutral content-area coordinate:
**v5 BREAKTHROUGH** — assignment AND exam submits both TRUE, measures grew (assignments 5→7, exams 4→6 leaves), RESIDUE ZERO. Checking deletions + populated texts:
**⚠️ Residue alert**: the Exam was created (visible in measures: "1 upcoming · Probe s75") but DELETIONS has no Exam entry — my CANDIDATES list lacks the "Exam" entity name! The residue scan never checked it. Verifying and cleaning immediately:
/tmp can't resolve playwright — moving the script into the repo's scripts dir:
**Residue eliminated** — the ref stores exams under `Exam` (absent from v1–v5's candidate list); probe exam deleted (200), FINAL-RESIDUE: ZERO across all entities. Caught by cross-checking deletions against the measured UI. Now capturing clone equivalents for the anatomy comparison:
Clone anatomy matches broadly. One micro-copy candidate: ref's future-due pill reads **"7 days"** while clone reads **"Due in 2 days"**. Verifying via screenshots:
Ref row confirmed: violet "7 days" pill, subject chip + amber "Medium" priority + gray "Homework" type pills, progress track with violet 0%. Checking the clone's equivalent row:
**Major drift finding** — the probe's payoff. Ref assignment row: due pill **inline with title** ("7 days", violet tint), **subject chip** in meta row, **amber bell priority pill**. Clone: due pill on its own line ("Due tomorrow", blue), no subject chip, gray flag priority. Checking the clone's exams + tasks rows to complete the delta:
The exams comparison reveals the most important nuance: the ref exam card shows **location row (📍)** and **subject chip**, while the clone shows **topics row** instead. Critical question: are location/topics rows data-conditional? The S8 pin ("no location row") may encode a data artifact. Checking the clone's seed for exam locations:
Exam model has **no location field at all** — a genuine E1-class end-to-end gap (ref dialog + card both carry it). I now have the complete Batch AC evidence. Documenting it in the remediation plan (pending batch, per the established probe→implement rhythm):
Inserting the Batch AC section + cycle record after Batch AB:
Now adding AP-118 to the lessons table:
Now the worklog Session 75 entry:
**Cycle complete — pushed `ef0ed0a..5180797` to main.**

Run from the 15th workspace reset (full re-provision again), this cycle:

- **Re-certified everything cold** — lint/tsc ✓, unit **844/844**, e2e **389/389** first-pass (census byte-matched), s75 sweep **ok:true** (mobile drawers green)
- **Re-validated the Batch R deferral with stronger CWV evidence** — clone GOOD everywhere; the reference now measures login-mobile LCP 8032ms POOR + dashboard CLS 0.254 POOR
- **Ran a new evidence layer: the populated S6-family probe** — 5 iterations to drive the ref's own UI (subject→task→event→assignment→exam), cleaned to RESIDUE ZERO twice (AP-118: the inherited entity list lacked `Exam`; the survivor was caught by cross-checking deletions vs measured rows)
- **Measured Batch AC** (pending, documented): 8 populated-row drifts — assignment due-pill placement/copy/tint, missing subject chips, exam date format, missing `Exam.location` end-to-end — plus AP-119 (Radix popovers are modal dialogs too)

**Next cycle:** implement Batch AC TDD (the Batch AB rhythm — measured this cycle, pins + fixes next), starting with the `Exam.location` schema→dialog→card chain and the assignment row anatomy.
