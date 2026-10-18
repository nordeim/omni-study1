"use client";

// ---------------------------------------------------------------------------
// CalculatorView — the four-tab calculator over the pure engine seam
// (src/lib/calculator.ts: evaluate / computeGpa / convert / mapPhysicalKey /
// formatCalcResult). The physical keyboard maps through the SAME pipeline
// (S15) and is guarded against form fields. History persists through
// mutations.createCalculatorEntry; clear-all is a direct DELETE (no
// collection-wide helper exists in mutations).
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
import { SectionCard, Spinner } from "@/components/views/shared";
import { cn } from "@/lib/utils";

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
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
      aria-label={key.kind === "eq" ? "Equals" : key.token === "C" ? "Clear" : `Insert ${key.label}`}
      onClick={() => void press(key.token)}
      className={cn(
        "h-14 rounded-xl text-lg font-medium transition-colors",
        key.span && "col-span-2",
        key.kind === "digit" &&
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
        key.kind === "op" && "bg-sf-primary-soft text-sf-primary-strong hover:brightness-95 dark:bg-sf-primary-soft-dark/40 dark:text-sf-primary-strong-dark",
        key.kind === "fn" &&
          "border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
        key.kind === "clear" && "bg-red-100 text-red-600 hover:bg-red-200",
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Calculator Suite</h1>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList aria-label="Calculator mode">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="scientific">Scientific</TabsTrigger>
            <TabsTrigger value="gpa">GPA Calculator</TabsTrigger>
            <TabsTrigger value="unit">Unit Converter</TabsTrigger>
          </TabsList>
        </Tabs>
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
      <Tabs value={tab} onValueChange={setTab}>
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

      {/* ---- history ---- */}
      <SectionCard title="History" icon={History} action={
        <Button variant="outline" size="sm" onClick={() => void clearHistory()} disabled={clearing || history.length === 0}>
          {clearing ? <Spinner className="size-4" /> : <Trash2 className="size-4" strokeWidth={2} />} Empty history
        </Button>
      }>
        {history.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Your calculations will appear here.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {[...history]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 20)
              .map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60"
                >
                  <span className="min-w-0 truncate font-mono text-sm text-slate-600 dark:text-slate-300">
                    {entry.expression} = {entry.result}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">{relativeTime(entry.createdAt)}</span>
                </li>
              ))}
          </ul>
        )}
      </SectionCard>
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
