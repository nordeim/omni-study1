// ---------------------------------------------------------------------------
// Calculator engine: the tokenizer + shunting-yard evaluator behind the
// Calculator view's four tabs (Basic / Scientific / GPA / Unit Converter),
// plus the physical-keyboard superset mapping (S15). Pure — unit-pinned by
// tests/calculator.test.ts.
//
// Security posture (AGENTS.md): the evaluator is a hand-rolled shunting-yard
// pipeline — NEVER eval/Function. Display glyphs (× ÷ −) normalize to ASCII
// operators at the tokenizer so the keypad pipeline and the physical keyboard
// feed one engine.
// ---------------------------------------------------------------------------

// ---- tokenizer -------------------------------------------------------------

type Token =
  | { t: "num"; v: number }
  | { t: "const"; v: number }
  | { t: "func"; v: string }
  | { t: "op"; v: "+" | "-" | "*" | "/" | "%" | "^" | "u-" }
  | { t: "post"; v: "!" }
  | { t: "lp" }
  | { t: "rp" };

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

const FUNCTIONS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt,
  ln: Math.log,
  log: Math.log10,
  abs: Math.abs,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
};

/**
 * Normalize the display glyphs the keypad renders (× ÷ −) back to the ASCII
 * operators the engine speaks, then cut the string into tokens. A "-" is
 * UNARY when it opens the expression, follows another operator, or follows
 * "(" — binary otherwise. Throws (never throws raw SyntaxError) on unknown
 * functions, unknown names, and stray characters.
 */
function tokenize(input: string): Token[] {
  const src = input
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-");
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === " " || ch === "\t") {
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      const match = /^(\d+(\.\d+)?|\.\d+)/.exec(src.slice(i));
      if (!match) throw new Error(`malformed number at position ${i}`);
      tokens.push({ t: "num", v: Number.parseFloat(match[0]) });
      i += match[0].length;
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      const name = /^[a-zA-Z]+/.exec(src.slice(i))![0];
      const lower = name.toLowerCase();
      if (src[i + name.length] === "(") {
        if (!(lower in FUNCTIONS)) throw new Error(`unknown function: ${name}`);
        tokens.push({ t: "func", v: lower });
      } else if (lower in CONSTANTS) {
        tokens.push({ t: "const", v: CONSTANTS[lower] });
      } else {
        throw new Error(`unknown name: ${name}`);
      }
      i += name.length;
      continue;
    }
    if (ch === "(") {
      tokens.push({ t: "lp" });
      i += 1;
      continue;
    }
    if (ch === ")") {
      tokens.push({ t: "rp" });
      i += 1;
      continue;
    }
    if (ch === "!") {
      tokens.push({ t: "post", v: "!" });
      i += 1;
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "%" || ch === "^") {
      const prev = tokens[tokens.length - 1];
      const unary =
        ch === "-" &&
        (prev === undefined ||
          prev.t === "op" ||
          prev.t === "lp");
      tokens.push(unary ? { t: "op", v: "u-" } : { t: "op", v: ch });
      i += 1;
      continue;
    }
    throw new Error(`unexpected character: ${ch}`);
  }
  if (tokens.length === 0) throw new Error("empty expression");
  return tokens;
}

// ---- shunting-yard -----------------------------------------------------------

const PRECEDENCE: Record<string, number> = {
  "u-": 4,
  "^": 3,
  "*": 2,
  "/": 2,
  "%": 2,
  "+": 1,
  "-": 1,
};

/** "^" and the prefix "u-" are right-associative; the rest are left. */
function isRightAssociative(op: string): boolean {
  return op === "^" || op === "u-";
}

function toRpn(tokens: Token[]): Token[] {
  const out: Token[] = [];
  const stack: Token[] = [];
  for (const token of tokens) {
    if (token.t === "num" || token.t === "const") {
      out.push(token);
      continue;
    }
    if (token.t === "post") {
      // Postfix binds to the operand already on the output — emit directly.
      out.push(token);
      continue;
    }
    if (token.t === "func" || token.t === "lp") {
      stack.push(token);
      continue;
    }
    if (token.t === "rp") {
      let matched = false;
      while (stack.length > 0) {
        const top = stack.pop()!;
        if (top.t === "lp") {
          matched = true;
          break;
        }
        out.push(top);
      }
      if (!matched) throw new Error("unbalanced parentheses: unexpected )");
      const fn = stack[stack.length - 1];
      if (fn && fn.t === "func") out.push(stack.pop()!);
      continue;
    }
    // Binary/prefix operator: pop while the stack top binds tighter.
    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      if (top.t !== "op") break;
      const pTop = PRECEDENCE[top.v];
      const pNew = PRECEDENCE[token.v];
      if (pTop > pNew || (pTop === pNew && !isRightAssociative(token.v))) {
        out.push(stack.pop()!);
      } else {
        break;
      }
    }
    stack.push(token);
  }
  while (stack.length > 0) {
    const top = stack.pop()!;
    if (top.t === "lp") throw new Error("unbalanced parentheses: missing )");
    out.push(top);
  }
  return out;
}

// ---- evaluation ---------------------------------------------------------------

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`factorial of a non-negative integer required, got ${n}`);
  }
  // 171! exceeds Number.MAX_VALUE — bail loudly instead of returning Infinity.
  if (n > 170) throw new Error(`factorial overflow: ${n}! exceeds Number range`);
  let acc = 1;
  for (let k = 2; k <= n; k++) acc *= k;
  return acc;
}

function evalRpn(rpn: Token[]): number {
  const stack: number[] = [];
  const pop = (): number => {
    const v = stack.pop();
    if (v === undefined) throw new Error("malformed expression: operand missing");
    return v;
  };
  for (const token of rpn) {
    if (token.t === "num" || token.t === "const") {
      stack.push(token.v);
      continue;
    }
    if (token.t === "post") {
      stack.push(factorial(pop()));
      continue;
    }
    if (token.t === "func") {
      stack.push(FUNCTIONS[token.v](pop()));
      continue;
    }
    if (token.t === "op") {
      if (token.v === "u-") {
        stack.push(-pop());
        continue;
      }
      const b = pop();
      const a = pop();
      switch (token.v) {
        case "+":
          stack.push(a + b);
          break;
        case "-":
          stack.push(a - b);
          break;
        case "*":
          stack.push(a * b);
          break;
        case "/":
          if (b === 0) throw new Error("Division by zero");
          stack.push(a / b);
          break;
        case "%":
          if (b === 0) throw new Error("Division by zero");
          stack.push(a % b);
          break;
        case "^":
          stack.push(a ** b);
          break;
      }
    }
  }
  if (stack.length !== 1) throw new Error("malformed expression: too many operands");
  const result = stack[0];
  if (!Number.isFinite(result)) throw new Error("result is not a finite number");
  return result;
}

/** Evaluate an infix expression (keypad glyphs tolerated) — throws on malformed input. */
export function evaluate(expression: string): number {
  return evalRpn(toRpn(tokenize(expression)));
}

// ---- GPA -----------------------------------------------------------------------

export interface GpaRow {
  grade: string;
  credits: number;
}

const GRADE_BASE: Record<string, number> = { a: 4, b: 3, c: 2, d: 1 };

const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

/**
 * Map a grade cell to 4-scale points: letters (A± … F), explicit percents
 * ("88%"), bare points ("3.7"), and bare percents above 4 ("88" → 3.52).
 * Returns null when nothing parses — the caller decides how to surface it.
 */
export function gpaPoints(grade: string): number | null {
  const s = grade.trim().toLowerCase();
  if (s === "") return null;
  if (s.endsWith("%")) {
    const pct = Number.parseFloat(s.slice(0, -1));
    if (Number.isNaN(pct)) return null;
    return clamp((pct / 100) * 4, 0, 4);
  }
  const letter = /^([a-df])([+-])?$/.exec(s);
  if (letter) {
    if (letter[1] === "f") return 0;
    const base = GRADE_BASE[letter[1]];
    const bump = letter[2] === "+" ? 0.3 : letter[2] === "-" ? -0.3 : 0;
    return clamp(base + bump, 0, 4);
  }
  const num = Number.parseFloat(s);
  if (Number.isNaN(num)) return null;
  // Above 4 the number reads as a percent (88 → 3.52), at or below 4 as points.
  return num > 4 ? clamp((num / 100) * 4, 0, 4) : clamp(num, 0, 4);
}

/** Credit-weighted GPA over the parseable rows; 0 when nothing counts. */
export function computeGpa(rows: GpaRow[]): number {
  let points = 0;
  let credits = 0;
  for (const row of rows) {
    const p = gpaPoints(row.grade);
    if (p === null) continue;
    if (!(row.credits > 0)) continue;
    points += p * row.credits;
    credits += row.credits;
  }
  return credits === 0 ? 0 : points / credits;
}

// ---- unit converter --------------------------------------------------------------

export type UnitCategory = "length" | "temperature" | "data";

/** Factors to the category base (meter / byte); temperature routes through °C. */
const LENGTH_TO_M: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

const DATA_TO_B: Record<string, number> = {
  b: 1,
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
};

function toCelsius(v: number, unit: string): number {
  if (unit === "°C" || unit === "C") return v;
  if (unit === "°F" || unit === "F") return ((v - 32) * 5) / 9;
  if (unit === "K") return v - 273.15;
  throw new Error(`unknown temperature unit: ${unit}`);
}

function fromCelsius(c: number, unit: string): number {
  if (unit === "°C" || unit === "C") return c;
  if (unit === "°F" || unit === "F") return (c * 9) / 5 + 32;
  if (unit === "K") return c + 273.15;
  throw new Error(`unknown temperature unit: ${unit}`);
}

/** Convert through the category base (temperature pivots on Celsius). Throws on unknown units. */
export function convert(value: number, from: string, to: string, category: UnitCategory): number {
  if (category === "temperature") {
    return fromCelsius(toCelsius(value, from), to);
  }
  const table = category === "length" ? LENGTH_TO_M : DATA_TO_B;
  if (!(from in table)) throw new Error(`unknown ${category} unit: ${from}`);
  if (!(to in table)) throw new Error(`unknown ${category} unit: ${to}`);
  return (value * table[from]) / table[to];
}

// ---- result formatting -------------------------------------------------------------

/**
 * Render an engine result for the display: 12 significant digits shave the
 * binary-float noise (0.1 + 0.2 → "0.3"); extreme magnitudes switch to
 * exponential so 1e15 / 1e-10 stay readable instead of growing 10+ zeros.
 */
export function formatCalcResult(n: number): string {
  const abs = Math.abs(n);
  if (n !== 0 && (abs >= 1e15 || abs < 1e-9)) {
    return n.toExponential(6).replace(/\.?0+e/, "e");
  }
  return String(Number(n.toPrecision(12)));
}

// ---- S15: the physical-keyboard superset -------------------------------------------

/**
 * Map a physical KeyboardEvent.key onto the SAME tokens the on-screen keypad
 * emits ("*" → the × glyph, Enter → "=") so both input paths drive one
 * press/submit pipeline. The keypad-only glyphs themselves map to null — a
 * physical "×" keypress does not exist, and echoing the glyph would bypass
 * the tokenizer's normalization contract.
 */
export function mapPhysicalKey(key: string): string | null {
  if (/^[0-9]$/.test(key) || key === "." || key === "(" || key === ")" || key === "%" || key === "^") {
    return key;
  }
  switch (key) {
    case "*":
      return "×";
    case "/":
      return "÷";
    case "+":
    case "-":
      return key;
    case "Enter":
    case "=":
      return "=";
    case "Backspace":
      return "⌫";
    case "Escape":
      return "C";
    default:
      return null;
  }
}
