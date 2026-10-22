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
import { History, RotateCcw, Trash2 } from "lucide-react";

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
  { label: "AC", token: "C", kind: "clear", span: true },
  { label: "±", token: "NEG", kind: "fn" },
  { label: "÷", token: "÷", kind: "op" },
  { label: "7", token: "7", kind: "digit" },
  { label: "8", token: "8", kind: "digit" },
  { label: "9", token: "9", kind: "digit" },
  { label: "×", token: "×", kind: "op" },
  { label: "4", token: "4", kind: "digit" },
  { label: "5", token: "5", kind: "digit" },
  { label: "6", token: "6", kind: "digit" },
  { label: "-", token: "-", kind: "op" },
  { label: "1", token: "1", kind: "digit" },
  { label: "2", token: "2", kind: "digit" },
  { label: "3", token: "3", kind: "digit" },
  { label: "+", token: "+", kind: "op" },
  { label: "0", token: "0", kind: "digit" },
  { label: ".", token: ".", kind: "digit" },
  { label: "(", token: "(", kind: "digit" },
  { label: ")", token: ")", kind: "digit" },
];

const SCIENTIFIC_EXTRA: CalcKey[] = [
  { label: "sin", token: "sin(", kind: "fn" },
  { label: "cos", token: "cos(", kind: "fn" },
  { label: "tan", token: "tan(", kind: "fn" },
  { label: "ln", token: "ln(", kind: "fn" },
  { label: "log", token: "log(", kind: "fn" },
  { label: "√", token: "sqrt(", kind: "fn" },
  { label: "x²", token: "^2", kind: "fn" },
  { label: "π", token: "pi", kind: "fn" },
  { label: "e", token: "e", kind: "fn" },
  { label: "!", token: "!", kind: "fn" },
];

// ---- the view ----------------------------------------------------------------------

export function CalculatorView() {
  const { toast } = useToast();
  const history = useDataStore((s) => s.calculatorHistory);

  const [tab, setTab] = React.useState("basic");
  const [expression, setExpression] = React.useState("");
  const [clearing, setClearing] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
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
        try {
          const value = evaluate(expression);
          const formatted = formatCalcResult(value);
          // The result becomes the new expression (calculator chaining), and
          // the next DIGIT starts a fresh entry.
          setExpression(formatted);
          setLastGood(formatted);
          justEvaluated.current = true;
          await mutations.createCalculatorEntry({
            expression,
            result: formatted,
            mode: (tab === "scientific" ? "scientific" : "basic") as "basic" | "scientific",
          });
        } catch (err: unknown) {
          toast.error(errorMessage(err, "That expression could not be evaluated."));
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
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) {
        return;
      }
      const token = mapPhysicalKey(event.key);
      if (token === null) return;
      event.preventDefault();
      void press(token);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [press]);

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
          : key.token === "C"
            ? "Clear: AC" // must contain the visible token "AC" (axe strips parentheticals)
            : `Insert ${key.label}`
      }
      onClick={() => void press(key.token)}
      className={cn(
        "h-14 rounded-xl text-lg font-medium transition-colors",
        key.span && "col-span-2",
        key.kind === "digit" &&
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
        key.kind === "op" && "bg-sf-primary-soft text-sf-primary-strong hover:brightness-95 dark:bg-sf-primary-soft-dark/40 dark:text-sf-primary-strong-dark",
        key.kind === "fn" &&
          "border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
        key.kind === "clear" &&
          "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900",
      )}
    >
      {key.kind === "clear" && (
        <RotateCcw className="size-4" strokeWidth={2} aria-hidden />
      )}
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Calculator Suite</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            All your calculation needs in one place
          </p>
        </div>
        <Button
          variant="outline"
          aria-expanded={historyOpen}
          aria-controls={historyOpen ? "calc-history-panel" : undefined}
          onClick={() => setHistoryOpen((open) => !open)}
          // S80/AG2 (re-measured s80 on the live ref in dark): the ref's
          // History toggle stays the near-black pill (rgb(10,10,10) +
          // light text) in dark mode — it does NOT invert. The s72-era
          // dark:bg-slate-100 inversion was drift and a standing
          // dark-sweep flashbulb.
          className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-[#0a0a0a] dark:text-[#fafafa] dark:hover:bg-[#262626]"
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
        <TabsList aria-label="Calculator mode" className="max-w-full overflow-x-auto">
          <TabsTrigger value="basic" className="data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400">Basic</TabsTrigger>
          <TabsTrigger value="scientific" className="data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400">Scientific</TabsTrigger>
          <TabsTrigger value="gpa" className="data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400">GPA Calculator</TabsTrigger>
          <TabsTrigger value="unit" className="data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400">Unit Converter</TabsTrigger>
        </TabsList>
      </div>

      {/* ---- display ---- */}
      <div className="sf-calc-display rounded-2xl p-6 text-4xl" aria-label="Calculator display" aria-live="polite">
        <p className="text-right font-mono text-sm text-slate-500 dark:text-slate-400" data-testid="calc-expression">
          {expression || "0"}
        </p>
        <p className="mt-1 truncate text-right text-4xl font-bold tabular-nums text-slate-800 dark:text-slate-100" data-testid="calc-result">
          {result || "0"}
        </p>
      </div>

      {/* ---- BASIC + SCIENTIFIC share the display ---- */}
        <TabsContent value="basic" aria-label="Basic" className="mt-0">
          <div className="grid grid-cols-4 gap-2">{BASIC_KEYS.map(keyButton)}</div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            <button
              type="button"
              aria-label="Backspace"
              onClick={() => void press("⌫")}
              className="h-14 rounded-xl border border-slate-200 bg-white text-lg font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              ⌫
            </button>
            <button
              type="button"
              aria-label="Insert ^"
              onClick={() => setExpression((prev) => `${prev}^`)}
              className="h-14 rounded-xl bg-sf-primary-soft text-lg font-medium text-sf-primary-strong hover:brightness-95 dark:bg-sf-primary-soft-dark/40 dark:text-sf-primary-strong-dark"
            >
              ^
            </button>
            <div className="col-span-2">
              <Button
                variant="gradient"
                aria-label="Equals"
                className="sf-gradient-shadow h-14 w-full rounded-xl text-lg"
                onClick={() => void press("=")}
              >
                =
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scientific" aria-label="Scientific" className="mt-0">
          <div className="grid grid-cols-5 gap-2">
            {SCIENTIFIC_EXTRA.map(keyButton)}
            {BASIC_KEYS.map(keyButton)}
            <button
              type="button"
              aria-label="Backspace"
              onClick={() => void press("⌫")}
              className="h-14 rounded-xl border border-slate-200 bg-white text-lg font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              ⌫
            </button>
            <div className="col-span-4">
              <Button
                variant="gradient"
                className="sf-gradient-shadow h-14 w-full rounded-xl text-lg"
                onClick={() => void press("=")}
              >
                =
              </Button>
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
          aria-label="Calculation History"
          className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        >
          {/* the ref renders this title as an h3 (16px/700) — the R1
              heading-order contract owns the level (h1 → h2, no skip) */}
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Calculation History</h2>
          <div className="mt-4 flex flex-col gap-3">
            {history.length === 0 ? (
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

  const rows: GpaRow[] = courses.map((c) => ({
    grade: c.grade,
    credits: Number(c.credits) || 0,
  }));
  const gpa = computeGpa(rows);

  const update = (id: string, patch: Partial<GpaCourse>) =>
    setCourses((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const saveGpaToHistory = async () => {
    try {
      await mutations.createCalculatorEntry({
        expression: "GPA",
        result: gpa.toFixed(2),
        mode: "gpa",
      });
      toast.success("GPA saved to history");
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Could not save the GPA."));
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
              { id: `c${Date.now()}`, name: "", credits: "3", grade: "A" },
            ])
          }
        >
          Add course
        </Button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">Computed GPA</p>
            <p className="text-3xl font-bold tabular-nums text-slate-800 dark:text-slate-100" aria-live="polite">
              {gpa.toFixed(2)}
            </p>
          </div>
          <Button variant="gradient" className="sf-gradient-shadow" onClick={() => void saveGpaToHistory()}>
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

function UnitPanel() {
  const { toast } = useToast();
  const [categoryValue, setCategoryValue] = React.useState<UnitCategory>("length");
  const category = UNIT_CATEGORIES.find((c) => c.value === categoryValue) ?? UNIT_CATEGORIES[0];
  // The reference's length defaults are m → ft (1 / 0.3048 = 3.2808…).
  const [from, setFrom] = React.useState(category.value === "length" ? "m" : category.units[0]);
  const [to, setTo] = React.useState(category.value === "length" ? "ft" : (category.units[2] ?? category.units[1]));
  const [value, setValue] = React.useState("1");

  const switchCategory = (next: string) => {
    const nextCategory = UNIT_CATEGORIES.find((c) => c.value === next) ?? UNIT_CATEGORIES[0];
    setCategoryValue(nextCategory.value);
    setFrom(nextCategory.units[0]);
    setTo(nextCategory.units[2] ?? nextCategory.units[1]);
  };

  const parsed = Number(value);
  let converted: string | null = null;
  if (Number.isFinite(parsed)) {
    try {
      converted = formatCalcResult(convert(parsed, from, to, categoryValue));
    } catch {
      converted = null;
    }
  }

  const unitSelect = (which: "from" | "to", unit: string, setUnit: (u: string) => void) => (
    <Select value={unit} onValueChange={setUnit}>
      <SelectTrigger aria-label={`${which === "from" ? "From" : "To"} unit`}>
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
          <p className="text-xs text-slate-500">Result</p>
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
          onClick={() => {
            void mutations
              .createCalculatorEntry({
                expression: `${value} ${from} → ${to}`,
                result: converted ?? "",
                mode: "unit",
              })
              .catch((err: unknown) => toast.error(errorMessage(err, "Could not save the conversion.")));
          }}
        >
          Save to history
        </Button>
      )}
    </div>
  );
}
