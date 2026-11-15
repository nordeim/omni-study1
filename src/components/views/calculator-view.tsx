"use client";

// ---------------------------------------------------------------------------
// CalculatorView — the four-tab calculator over the pure engine seam
// (src/lib/calculator.ts: evaluate / computeGpa / convert / mapPhysicalKey /
// formatCalcResult). The physical keyboard maps through the SAME pipeline
// (S15) and is guarded against form fields. History persists through
// mutations.createCalculatorEntry; clear-all is a direct DELETE (no
// collection-wide helper exists in mutations).
// Batch AB (s72, populated-ref measurement): the header History button
// toggles a right slide-in "Calculation History" panel — at zero the panel
// does not exist in the DOM (the ref renders NO history chrome at zero,
// probe #6), and entries render the expression spaced ("2 + 3") above the
// bold result ("= 5"). The zero-era bottom "History" SectionCard was a
// clone invention and is gone.
// ---------------------------------------------------------------------------

import * as React from "react";
import { Delete, History, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import {
  computeGpa,
  convert,
  evaluate,
  formatCalcResult,
  mapPhysicalKey,
  type GpaRow,
  type UnitCategory,
} from "@/lib/calculator";
import { mutations, useDataStore } from "@/lib/data";
import { apiSend } from "@/lib/api";
import { Spinner } from "@/components/views/shared";
import { cn } from "@/lib/utils";

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/** The ref's history entries render the expression spaced ("2 + 3") — the
 *  engine stores the compact token stream ("2+3"). Operators get spaces;
 *  a leading minus (negation) and decimals stay intact. */
function spacedExpression(expr: string): string {
  return expr
    .replace(/([+×÷^])/g, " $1 ")
    .replace(/(\d)-(\d)/g, "$1 - $2")
    .replace(/\s+/g, " ")
    .trim();
}

// ---- keypad plumbing ------------------------------------------------------------------

type CalcKey = { label: string; token: string; kind: "digit" | "op" | "eq" | "clear" | "fn"; span?: boolean };

const BASIC_KEYS: CalcKey[] = [
  // S190/EN: the measured Basic grid — 7 8 9 ÷ / 4 5 6 × / 1 2 3 - /
  // 0 . = + (the reference's 4×4 digit grid; the Clear + icon-only
  // backspace ride row 1 as span-2 keys, rendered by the tabpanel —
  // see the S190/EN1/EN2 pair below). No ±/^/(/) on Basic: those live
  // on Scientific (xʸ, (, ), % — the measured split).
  { label: "7", token: "7", kind: "digit" },
  { label: "8", token: "8", kind: "digit" },
  { label: "9", token: "9", kind: "digit" },
  { label: "÷", token: "÷", kind: "op" },
  { label: "4", token: "4", kind: "digit" },
  { label: "5", token: "5", kind: "digit" },
  { label: "6", token: "6", kind: "digit" },
  { label: "×", token: "×", kind: "op" },
  { label: "1", token: "1", kind: "digit" },
  { label: "2", token: "2", kind: "digit" },
  { label: "3", token: "3", kind: "digit" },
  { label: "-", token: "-", kind: "op" },
  { label: "0", token: "0", kind: "digit" },
  { label: ".", token: ".", kind: "digit" },
  { label: "=", token: "=", kind: "eq" },
  { label: "+", token: "+", kind: "op" },
];

const SCIENTIFIC_EXTRA: CalcKey[] = [
  // S190/EN: the reference's measured fn set in its measured order
  // (sin cos tan π √ x² xʸ log ( ) % e) + the clone's documented
  // supersets ln and ! appended (docs/remediation-plan-session190.md §6.2).
  { label: "sin", token: "sin(", kind: "fn" },
  { label: "cos", token: "cos(", kind: "fn" },
  { label: "tan", token: "tan(", kind: "fn" },
  { label: "π", token: "pi", kind: "fn" },
  { label: "√", token: "sqrt(", kind: "fn" },
  { label: "x²", token: "^2", kind: "fn" },
  { label: "xʸ", token: "^", kind: "fn" },
  { label: "log", token: "log(", kind: "fn" },
  { label: "(", token: "(", kind: "fn" },
  { label: ")", token: ")", kind: "fn" },
  { label: "%", token: "%", kind: "fn" },
  { label: "e", token: "e", kind: "fn" },
  { label: "ln", token: "ln(", kind: "fn" },
  { label: "!", token: "!", kind: "fn" },
];

// ---- the view ----------------------------------------------------------------------

export function CalculatorView() {
  const { toast } = useToast();
  const history = useDataStore((s) => s.calculatorHistory);
  // S134/CI5 (audit B-M2): the CE3 loading gate — the calculator's pre-warm
  // entry is [] ("the three no-data views gate on auth alone"), so the
  // history slice fills only via the background loadAll; the panel
  // previously rendered its empty copy on IN-FLIGHT data (the S130/CE3
  // class the CG6 sweep closed for eleven sibling surfaces — the one view
  // it missed). The tasks-view idiom: the spinner owns the zero branch
  // while the collection loads.
  const loading = useDataStore((s) => s.loading);

  const [tab, setTab] = React.useState("basic");
  const [expression, setExpression] = React.useState("");
  const [clearing, setClearing] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  // S119/BT7 — the history panel's non-modal focus lifecycle (the BS4
  // pattern at disclosure weight): the panel is a labelled region, not a
  // modal (no aria-modal, no scroll lock, no Tab containment — the keypad
  // stays operable beside it); Escape closes, focus lands in the panel on
  // open, and the toggle gets focus back on close.
  const historyPanelRef = React.useRef<HTMLElement>(null);
  const historyToggleRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (!historyOpen) return;
    historyPanelRef.current?.focus();
    // S129/CD3: copy the ref BEFORE the cleanup captures it — the cleanup
    // runs after the panel unmounts, by which time historyToggleRef.current
    // may have changed (the exhaustive-deps ref-in-cleanup class).
    const toggle = historyToggleRef.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHistoryOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [historyOpen]);
  const [lastGood, setLastGood] = React.useState("");
  const justEvaluated = React.useRef(false);

  // Live preview derived at render through the engine; an incomplete or
  // invalid expression falls back to the last committed value. No refs
  // during render, no effects (the react-hooks lint contracts).
  const preview = React.useMemo(() => {
    if (expression.trim() === "") return "";
    try {
      return formatCalcResult(evaluate(expression));
    } catch {
      return null;
    }
  }, [expression]);
  const result = preview ?? lastGood;

  const press = React.useCallback(
    async (token: string) => {
      if (token === "C") {
        setExpression("");
        setLastGood("");
        return;
      }
      if (token === "⌫") {
        setExpression((prev) => prev.slice(0, -1));
        return;
      }
      if (token === "NEG") {
        setExpression((prev) => (prev.startsWith("-") ? prev.slice(1) : `-${prev}`));
        return;
      }
      if (token === "=") {
        if (expression.trim() === "") return;
        // S149/CX4 (audit B-L2): a re-press right after an evaluation is a
        // NO-OP — the display already holds the result, and re-evaluating
        // the committed value only appended a derived noise row ("5 = 5")
        // to the history. The ref write is synchronous before the history
        // await below, so even a same-tick double-press is guarded.
        if (justEvaluated.current) return;
        // S119/BT12: the evaluation and the history save have SEPARATE
        // failure modes — a successful evaluation whose history POST failed
        // (offline) used to toast "could not be evaluated" while the display
        // correctly showed the result. Split the try blocks so each failure
        // says what actually failed.
        let formatted: string;
        try {
          const value = evaluate(expression);
          formatted = formatCalcResult(value);
        } catch (err: unknown) {
          toast.error(errorMessage(err, "That expression could not be evaluated."));
          return;
        }
        // The result becomes the new expression (calculator chaining), and
        // the next DIGIT starts a fresh entry.
        setExpression(formatted);
        setLastGood(formatted);
        justEvaluated.current = true;
        try {
          await mutations.createCalculatorEntry({
            expression,
            result: formatted,
            mode: (tab === "scientific" ? "scientific" : "basic") as "basic" | "scientific",
          });
        } catch (err: unknown) {
          // The display already shows the correct result — only the history
          // copy failed. Surface it as its OWN failure (the S78/AE2
          // never-swallow doctrine), never the evaluation message.
          toast.error(errorMessage(err, "The result is shown, but history could not record it."));
        }
        return;
      }
      if (justEvaluated.current && /[0-9.]/.test(token)) {
        setExpression(token);
        justEvaluated.current = false;
        return;
      }
      justEvaluated.current = false;
      setExpression((prev) => prev + token);
    },
    [expression, tab, toast],
  );

  // S15 physical-keyboard superset — window-level, guarded against form fields.
  // S119/BT7: while the history panel is open, Escape belongs to the PANEL
  // (it closes the panel — the BT7 lifecycle); the display-clear mapping
  // stays dormant so one press never does both.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) {
        return;
      }
      if (historyOpen && event.key === "Escape") return;
      const token = mapPhysicalKey(event.key);
      if (token === null) return;
      event.preventDefault();
      void press(token);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [press, historyOpen]);

  const clearHistory = async () => {
    setClearing(true);
    try {
      await apiDeleteHistory();
      toast.success("History cleared");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not clear the history."));
    } finally {
      setClearing(false);
    }
  };

  const keyButton = (key: CalcKey) => (
    <button
      key={`${key.label}-${key.token}`}
      type="button"
      aria-label={
        key.kind === "eq"
          ? "Equals"
          : `Insert ${key.label}`
      }
      onClick={() => void press(key.token)}
      className={cn(
        // S190/EN: the measured key family — 6px radius (rounded-md),
        // 56px height, gap-2 grid. The radius family moved 12px → 6px.
        "h-14 rounded-md text-lg font-semibold transition-colors",
        key.span && "col-span-2",
        key.kind === "digit" &&
          "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
        // S190/EN: the operators are the measured DARK slate-800 family
        // (rgb(30,41,59), white text, borderless — was violet-soft).
        key.kind === "op" &&
          "bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600",
        key.kind === "eq" &&
          // the measured single-cell gradient key (violet-500 → indigo-600)
          "sf-gradient sf-gradient-shadow text-white hover:brightness-105",
        key.kind === "fn" &&
          "border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
      )}
    >
      {key.label}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ---- custom header (no ViewHeader — the calculator's own model) ---- */}
      {/* ONE Tabs tree: the triggers and the contents previously lived in two
          separate <Tabs> roots, so every trigger's aria-controls pointed at a
          panel id that never rendered (axe aria-valid-attr-value, critical).
          Radix Tabs.Root renders no DOM of its own, so this is DOM-identical. */}
      <Tabs value={tab} onValueChange={setTab}>
      {/* Batch AB header: subtitle under the h1; the History toggle lives
          top-right (the ref's black pill) — aria-controls only while the
          panel exists, so aria-valid-attr-value stays clean at zero. */}
      {/* S186/EJ-C: the measured ROW family — Calculator never stacks
          (`flex items-center justify-between`, probed 2026-11-15: row at
          mobile AND desktop, items-center, no wrap). */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Calculator Suite</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            All your calculation needs in one place
          </p>
        </div>
        <Button
          ref={historyToggleRef}
          variant="outline"
          aria-expanded={historyOpen}
          aria-controls={historyOpen ? "calc-history-panel" : undefined}
          onClick={() => setHistoryOpen((open) => !open)}
          // S80/AG2 (re-measured s80 on the live ref in dark): the ref's
          // History toggle stays the near-black pill (rgb(10,10,10) +
          // light text) in dark mode — it does NOT invert. The s72-era
          // dark:bg-slate-100 inversion was drift and a standing
          // dark-sweep flashbulb.
          className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-[#0a0a0a] dark:text-[#fafafa] dark:hover:bg-[#262626] sf-print-exact"
        >
          <History className="size-4" strokeWidth={2} aria-hidden />
          History
        </Button>
      </div>
      <div>
        {/* max-w-full + overflow-x-auto (S78/AE11): the 4-mode bar measures
            413px — the ref itself overflows to 429 at 390 (its own bug
            family); the clone keeps the no-overflow contract by scrolling
            the bar. At ≥sm it fits — identical rendering. */}
        {/* S190/EN: the measured tab family — the white bordered container
            (bg-white border-slate-200, probed live) + the NEAR-BLACK active
            face (rgb(10,10,10)/rgb(250,250,250), the AG2/History family).
            The inactive text stays the slate-600 a11y stand-in: the
            reference's own neutral-400 measures ~2.2:1 on white (a WCAG AA
            fail the clone does not replicate — the axe-clean contract,
            docs/remediation-plan-session190.md §6.8). */}
        <TabsList
          aria-label="Calculator mode"
          className="max-w-full overflow-x-auto border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
        >
          <TabsTrigger
            value="basic"
            className="data-[state=inactive]:text-slate-600 data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-[#fafafa] data-[state=active]:shadow dark:data-[state=inactive]:text-slate-400 dark:data-[state=active]:bg-[#0a0a0a] dark:data-[state=active]:text-[#fafafa]"
          >
            Basic
          </TabsTrigger>
          <TabsTrigger
            value="scientific"
            className="data-[state=inactive]:text-slate-600 data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-[#fafafa] data-[state=active]:shadow dark:data-[state=inactive]:text-slate-400 dark:data-[state=active]:bg-[#0a0a0a] dark:data-[state=active]:text-[#fafafa]"
          >
            Scientific
          </TabsTrigger>
          <TabsTrigger
            value="gpa"
            className="data-[state=inactive]:text-slate-600 data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-[#fafafa] data-[state=active]:shadow dark:data-[state=inactive]:text-slate-400 dark:data-[state=active]:bg-[#0a0a0a] dark:data-[state=active]:text-[#fafafa]"
          >
            GPA Calculator
          </TabsTrigger>
          <TabsTrigger
            value="unit"
            className="data-[state=inactive]:text-slate-600 data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-[#fafafa] data-[state=active]:shadow dark:data-[state=inactive]:text-slate-400 dark:data-[state=active]:bg-[#0a0a0a] dark:data-[state=active]:text-[#fafafa]"
          >
            Unit Converter
          </TabsTrigger>
        </TabsList>
      </div>

      {/* ---- BASIC + SCIENTIFIC: the measured calculator card
          (S190/EN) — each keypad tabpanel renders the max-w-md centered
          column (448px) holding the white rounded-2xl card: the sf-calc-
          display gradient display (the h-6 expression line EMPTY at rest
          + the LEFT-aligned break-all 36px result) above the slate-50
          keypad area. Radix unmounts the inactive pane, so the display
          locator stays unique. The GPA/Unit panels render full-width
          (the ref's own GPA tab measures 1116px — probed live). ---- */}
        <TabsContent value="basic" aria-label="Basic" className="mt-2">
          {/* S190/EN: the measured 18-key Basic pad — ONE grid: row 1 is
              the near-black Clear(span-2) + icon-only backspace(span-2)
              pair; rows 2-5 the 4×4 digit/op grid with the single-cell
              gradient Equals (violet-500 → indigo-600 via the sf-gradient
              utility, 6px radius). Measured live 2026-11-15 —
              docs/remediation-plan-session190.md §3.1. */}
          <div className="mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <div role="group" className="sf-calc-display p-6" aria-label="Calculator display" aria-live="polite">
                <p className="h-6 text-sm text-slate-500 dark:text-slate-400" data-testid="calc-expression">
                  {expression}
                </p>
                <p className="mt-2 break-all text-4xl font-bold text-slate-800 dark:text-slate-100" data-testid="calc-result">
                  {result || "0"}
                </p>
              </div>
              <div className="bg-slate-50 p-4 dark:bg-slate-800/60">
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    aria-label="Clear"
                    onClick={() => void press("C")}
                    className="col-span-2 flex h-14 items-center justify-center gap-2 rounded-md border border-[#262626] bg-[#0a0a0a] text-sm font-medium text-red-500 transition-colors hover:bg-[#262626] dark:border-[#404040] dark:text-red-400 dark:hover:bg-[#171717]"
                  >
                    <RotateCcw className="size-4" strokeWidth={2} aria-hidden />
                    Clear
                  </button>
                  <button
                    type="button"
                    aria-label="Backspace"
                    onClick={() => void press("⌫")}
                    className="col-span-2 flex h-14 items-center justify-center rounded-md border border-[#262626] bg-[#0a0a0a] text-[#fafafa] transition-colors hover:bg-[#262626] dark:border-[#404040] dark:hover:bg-[#171717]"
                  >
                    <Delete className="size-4" strokeWidth={2} aria-hidden />
                  </button>
                  {BASIC_KEYS.map(keyButton)}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scientific" aria-label="Scientific" className="mt-2">
          {/* S190/EN: the reference's scientific layout — the fn set on its
              measured 4-column grid, the Basic digit grid below, and the
              backspace as the trailing icon key (the reference's own
              scientific carries NO clear/backspace — a defect the clone
              does not replicate; §6.3's documented superset). */}
          <div className="mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <div role="group" className="sf-calc-display p-6" aria-label="Calculator display" aria-live="polite">
                <p className="h-6 text-sm text-slate-500 dark:text-slate-400" data-testid="calc-expression">
                  {expression}
                </p>
                <p className="mt-2 break-all text-4xl font-bold text-slate-800 dark:text-slate-100" data-testid="calc-result">
                  {result || "0"}
                </p>
              </div>
              <div className="bg-slate-50 p-4 dark:bg-slate-800/60">
                <div className="grid grid-cols-4 gap-2">
                  {SCIENTIFIC_EXTRA.map(keyButton)}
                  {BASIC_KEYS.map(keyButton)}
                  <button
                    type="button"
                    aria-label="Backspace"
                    onClick={() => void press("⌫")}
                    className="flex h-14 items-center justify-center rounded-md border border-[#262626] bg-[#0a0a0a] text-[#fafafa] transition-colors hover:bg-[#262626] dark:border-[#404040] dark:hover:bg-[#171717]"
                  >
                    <Delete className="size-4" strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gpa" aria-label="GPA Calculator" className="mt-0">
          <GpaPanel />
        </TabsContent>

        <TabsContent value="unit" aria-label="Unit Converter" className="mt-0">
          <UnitPanel />
        </TabsContent>
      </Tabs>
      {/* (the single Tabs root opened at the custom header closes here) */}

      {/* ---- history: the ref's right slide-in panel, mounted ONLY while
          toggled (at zero the ref renders no history chrome — probe #6) ---- */}
      {historyOpen && (
        <aside
          id="calc-history-panel"
          ref={historyPanelRef}
          tabIndex={-1}
          aria-label="Calculation History"
          className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl outline-none dark:border-slate-800 dark:bg-slate-900"
        >
          {/* the ref renders this title as an h3 (16px/700) — the R1
              heading-order contract owns the level (h1 → h2, no skip) */}
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Calculation History</h2>
          <div className="mt-4 flex flex-col gap-3">
            {loading && history.length === 0 ? (
              <div className="flex justify-center py-8 text-sf-primary" role="status" aria-label="Loading calculation history">
                <Spinner className="size-6" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your calculations will appear here.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {[...history]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 20)
                  .map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700"
                    >
                      <p className="truncate font-mono text-sm text-slate-500 dark:text-slate-400">
                        {spacedExpression(entry.expression)}
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">
                        = {entry.result}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <Button
            // S80/AG2 (the panel-footer sibling of the header toggle —
            // same measured-dark treatment, same drift removed).
            className="mt-4 w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-[#0a0a0a] dark:text-[#fafafa] dark:hover:bg-[#262626]"
            onClick={() => void clearHistory()}
            disabled={clearing || history.length === 0}
          >
            {clearing ? <Spinner className="size-4" /> : null}
            Clear History
          </Button>
        </aside>
      )}
    </div>
  );
}

/** The history clear-all — DELETE /api/calculator/history has no per-row
 *  helper in mutations, so this goes through apiSend + slice refresh. */
async function apiDeleteHistory(): Promise<void> {
  await apiSend("DELETE", "/api/calculator/history");
  await useDataStore.getState().loadCollections(["calculatorHistory"]);
}

// ---- GPA tab ---------------------------------------------------------------------------

type GpaCourse = { id: string; name: string; credits: string; grade: string };

const GRADE_OPTIONS = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];

function GpaPanel() {
  const { toast } = useToast();
  // The reference's seeded GPA rows (A 4.0×3cr + B+ 3.3×4cr → 3.60).
  const [courses, setCourses] = React.useState<GpaCourse[]>([
    { id: "c1", name: "Calculus II", credits: "3", grade: "A" },
    { id: "c2", name: "Physics", credits: "4", grade: "B+" },
  ]);
  // S122/BW13: a monotonic counter for added-course ids — Date.now()
  // collides on a same-millisecond double-click (a React key collision).
  const nextCourseIdRef = React.useRef(3);

  const rows: GpaRow[] = courses.map((c) => ({
    grade: c.grade,
    credits: Number(c.credits) || 0,
  }));
  const gpa = computeGpa(rows);

  const update = (id: string, patch: Partial<GpaCourse>) =>
    setCourses((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  // S149/CX4 (audit B-L2): the GPA Save in-flight guard (the CI4 pattern —
  // the myday quick-add idiom): a rapid double-click fired one POST per
  // click and duplicated the history row; the latch serializes the saves
  // and the button disables while the POST is in flight.
  const [savingGpa, setSavingGpa] = React.useState(false);

  const saveGpaToHistory = async () => {
    if (savingGpa) return;
    setSavingGpa(true);
    try {
      await mutations.createCalculatorEntry({
        expression: "GPA",
        result: gpa.toFixed(2),
        mode: "gpa",
      });
      toast.success("GPA saved to history");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not save the GPA."));
    } finally {
      setSavingGpa(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {courses.map((course, index) => (
        <div key={course.id} className="grid grid-cols-[1fr_5rem_7rem_2.5rem] items-end gap-2">
          <div className="flex flex-col gap-1.5">
            {index === 0 && <Label htmlFor={`gpa-name-${course.id}`}>Course</Label>}
            <Input
              id={`gpa-name-${course.id}`}
              value={course.name}
              onChange={(e) => update(course.id, { name: e.target.value })}
              placeholder="e.g. Calculus II"
              aria-label={`Course ${index + 1} name`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            {index === 0 && <Label htmlFor={`gpa-credits-${course.id}`}>Credits</Label>}
            <Input
              id={`gpa-credits-${course.id}`}
              type="number"
              min={0}
              max={24}
              step="any"
              value={course.credits}
              onChange={(e) => update(course.id, { credits: e.target.value })}
              aria-label={`Course ${index + 1} credits`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            {index === 0 && <Label>Grade</Label>}
            <Select value={course.grade} onValueChange={(value) => update(course.id, { grade: value })}>
              <SelectTrigger aria-label={`Course ${index + 1} grade`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            type="button"
            aria-label={`Remove course ${index + 1}`}
            onClick={() => setCourses((list) => list.filter((c) => c.id !== course.id))}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
          >
            <Trash2 className="size-4" strokeWidth={2} />
          </button>
        </div>
      ))}

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() =>
            setCourses((list) => [
              ...list,
              { id: `c${nextCourseIdRef.current++}`, name: "", credits: "3", grade: "A" },
            ])
          }
        >
          Add course
        </Button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Computed GPA</p>
            <p className="text-3xl font-bold tabular-nums text-slate-800 dark:text-slate-100" aria-live="polite">
              {gpa.toFixed(2)}
            </p>
          </div>
          <Button variant="gradient" className="sf-gradient-shadow" onClick={() => void saveGpaToHistory()} disabled={savingGpa}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- Unit Converter tab --------------------------------------------------------------------

const UNIT_CATEGORIES: { value: UnitCategory; label: string; units: string[] }[] = [
  { value: "length", label: "Length", units: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"] },
  { value: "temperature", label: "Temperature", units: ["°C", "°F", "K"] },
  { value: "data", label: "Data", units: ["B", "KB", "MB", "GB", "TB"] },
];

/** S140/CO4d: the ONE unit-converter default rule — Length re-selects the
 *  reference's measured m → ft pair; every other category takes
 *  units[0] → units[2] (the long-standing switch behavior — no measured
 *  basis exists to change it, and none is needed: only Length's default
 *  was ever measured against the reference). */
function unitDefaultPair(category: { value: UnitCategory; units: string[] }): {
  from: string;
  to: string;
} {
  if (category.value === "length") return { from: "m", to: "ft" };
  return { from: category.units[0], to: category.units[2] ?? category.units[1] };
}

function UnitPanel() {
  const { toast } = useToast();
  const [categoryValue, setCategoryValue] = React.useState<UnitCategory>("length");
  const category = UNIT_CATEGORIES.find((c) => c.value === categoryValue) ?? UNIT_CATEGORIES[0];
  // The reference's length defaults are m → ft (1 / 0.3048 = 3.2808…).
  // S140/CO4d (Audit A L-6): the dead initializer ternary is gone (the
  // category is always Length at mount) and the default rule now has ONE
  // form — `unitDefaultPair` — applied at mount AND on re-select, so
  // cycling away from Length and back restores the measured m → ft pair
  // (previously the switch handler fell to units[0]/units[2] = mm → m).
  const [from, setFrom] = React.useState(() => unitDefaultPair(UNIT_CATEGORIES[0]).from);
  const [to, setTo] = React.useState(() => unitDefaultPair(UNIT_CATEGORIES[0]).to);
  const [value, setValue] = React.useState("1");

  const switchCategory = (next: string) => {
    const nextCategory = UNIT_CATEGORIES.find((c) => c.value === next) ?? UNIT_CATEGORIES[0];
    setCategoryValue(nextCategory.value);
    const pair = unitDefaultPair(nextCategory);
    setFrom(pair.from);
    setTo(pair.to);
  };

  // S149/CX4 (audit B-L2): the unit Save in-flight guard (the CI4 pattern —
  // the GpaPanel twin above): a rapid double-click fired one POST per click
  // and duplicated the history row; the latch serializes the saves and the
  // button disables while the POST is in flight.
  const [savingUnit, setSavingUnit] = React.useState(false);

  const parsed = Number(value);
  let converted: string | null = null;
  if (Number.isFinite(parsed)) {
    try {
      converted = formatCalcResult(convert(parsed, from, to, categoryValue));
    } catch {
      converted = null;
    }
  }

  const saveUnitToHistory = async () => {
    if (savingUnit) return;
    setSavingUnit(true);
    try {
      await mutations.createCalculatorEntry({
        expression: `${value} ${from} → ${to}`,
        result: converted ?? "",
        mode: "unit",
      });
      // S151/CZ4 (audit B-L4): the success branch speaks — the GPA twin's
      // mirror ("GPA saved to history"): a silent success left the user
      // unable to tell whether the conversion was recorded (especially
      // with the history panel closed).
      toast.success("Conversion saved to history");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not save the conversion."));
    } finally {
      setSavingUnit(false);
    }
  };

  const unitSelect = (which: "from" | "to", unit: string, setUnit: (u: string) => void) => (
    <Select value={unit} onValueChange={setUnit}>
      {/* S120/BU17a: the id binds the visible From/To Labels (they dangled
          on aria-label-only triggers before — every other Select in the
          app binds both). */}
      <SelectTrigger id={`unit-${which}`} aria-label={`${which === "from" ? "From" : "To"} unit`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {category.units.map((u) => (
          <SelectItem key={u} value={u}>
            {u}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Category</Label>
        <Select value={categoryValue} onValueChange={switchCategory}>
          <SelectTrigger aria-label="Conversion category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNIT_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-[1fr_7rem] gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="unit-value">Value</Label>
          <Input
            id="unit-value"
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="unit-from">From</Label>
          {unitSelect("from", from, setFrom)}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_7rem] items-end gap-2">
        <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
          <p className="text-xs text-slate-500 dark:text-slate-400">Result</p>
          <p className="truncate text-2xl font-bold tabular-nums text-slate-800 dark:text-slate-100" aria-live="polite">
            {converted === null ? "—" : converted}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="unit-to">To</Label>
          {unitSelect("to", to, setTo)}
        </div>
      </div>

      {converted !== null && Number.isFinite(parsed) && (
        <Button
          variant="outline"
          className="self-start"
          disabled={savingUnit}
          onClick={() => {
            void saveUnitToHistory();
          }}
        >
          Save to history
        </Button>
      )}
    </div>
  );
}
