import * as formulajs from "@formulajs/formulajs";

// --- Constants for ASCII Column Math ---
const ALPHABET_SIZE = 26; // Number of letters in the English alphabet
const CHAR_CODE_A = "A".charCodeAt(0); // ASCII code for 'A' (65)
const ASCII_OFFSET_FOR_1_INDEXED_COL = CHAR_CODE_A - 1; // Offset to convert 'A' -> 1 (64)

export type CellValueGetter = (
  address: string,
) => string | number | null | undefined;

/**
 * Parse cell address like "A1" or "AB12" into 1-indexed col and row coordinates.
 * e.g., "A1" -> { col: 1, row: 1 }, "AB12" -> { col: 28, row: 12 }
 */
export function parseAddress(
  address: string,
): { col: number; row: number } | null {
  const match = address
    .trim()
    .toUpperCase()
    .match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;

  const colStr = match[1];
  const rowStr = match[2];

  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * ALPHABET_SIZE + (colStr.charCodeAt(i) - ASCII_OFFSET_FOR_1_INDEXED_COL);
  }

  const row = Number.parseInt(rowStr, 10);
  return { col, row };
}

/**
 * Convert 1-indexed column and row coordinates back to Excel address string.
 * e.g., col: 1, row: 1 -> "A1", col: 28, row: 12 -> "AB12"
 */
export function formatAddress(col: number, row: number): string {
  let label = "";
  let temp = col - 1;
  while (temp >= 0) {
    label = String.fromCharCode((temp % ALPHABET_SIZE) + CHAR_CODE_A) + label;
    temp = Math.floor(temp / ALPHABET_SIZE) - 1;
  }
  return `${label}${row}`;
}

/**
 * Expand a range string like "A1:C5" into a list of cell addresses.
 */
export function expandRange(rangeStr: string): string[] {
  const parts = rangeStr.split(":");
  if (parts.length === 1) {
    return [parts[0].trim().toUpperCase()];
  }

  if (parts.length === 2) {
    const start = parseAddress(parts[0]);
    const end = parseAddress(parts[1]);

    if (!start || !end) return [];

    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);

    const addresses: string[] = [];
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        addresses.push(formatAddress(c, r));
      }
    }
    return addresses;
  }

  return [];
}

/**
 * Get values of all cells within a range as an array.
 */
export function getRangeValues(
  rangeStr: string,
  getValue: CellValueGetter,
): (string | number)[] {
  const addresses = expandRange(rangeStr);
  return addresses.map((addr) => {
    const val = getValue(addr);
    return val !== undefined && val !== null && val !== "" ? val : 0;
  });
}

/**
 * Temporarily mask string literals (e.g. "●", 'text') into placeholders
 * so regex transformations don't accidentally mutate text inside quotes.
 */
function maskStringLiterals(expression: string): {
  maskedExpression: string;
  restoreStringLiterals: (expr: string) => string;
} {
  const literals: string[] = [];
  // Regex to capture double-quoted "..." or single-quoted '...' strings
  const stringLiteralRegex = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g;

  const maskedExpression = expression.replace(stringLiteralRegex, (match) => {
    literals.push(match);
    return `__STRING_LITERAL_${literals.length - 1}__`;
  });

  const restoreStringLiterals = (expr: string): string => {
    let restored = expr;
    literals.forEach((literal, index) => {
      restored = restored.replace(`__STRING_LITERAL_${index}__`, literal);
    });
    return restored;
  };

  return { maskedExpression, restoreStringLiterals };
}

/**
 * Convert Excel-specific operators to JavaScript equivalent operators:
 * - `<>` -> `!==`
 * - `=` -> `===` (excluding existing ==, <=, >=, !=, ===)
 * - `&` -> `+`
 */
function convertExcelOperatorsToJS(expression: string): string {
  return expression
    .replace(/<>/g, "!==")
    .replace(/([^!<>=])=([^=])/g, "$1===$2")
    .replace(/&/g, "+");
}

// Set of all available function names in @formulajs/formulajs (in uppercase)
const FORMULA_JS_FUNCTION_NAMES = new Set(
  Object.keys(formulajs).map((key) => key.toUpperCase()),
);

/**
 * Main function to evaluate Excel formulas string using @formulajs/formulajs
 */
export function evaluateFormula(
  rawFormula: string,
  getValue: CellValueGetter,
): string | number {
  if (!rawFormula.startsWith("=")) {
    return rawFormula;
  }

  const rawExpression = rawFormula.substring(1).trim();
  if (!rawExpression) return "";

  try {
    // 1. Mask string literals so quotes aren't affected by range/cell replacement
    const { maskedExpression, restoreStringLiterals } = maskStringLiterals(rawExpression);

    // 2. Expand range references like A1:A10 into JSON array literals
    let processed = maskedExpression.replace(
      /\b([A-Z]+[0-9]+:[A-Z]+[0-9]+)\b/gi,
      (match) => {
        const rangeVals = getRangeValues(match, getValue);
        return JSON.stringify(rangeVals);
      },
    );

    // 3. Replace cell references (e.g. A1, F14) with cell values
    // Using simple \b([A-Z]+[0-9]+)\b because string literals are already masked!
    processed = processed.replace(/\b([A-Z]+[0-9]+)\b/gi, (match) => {
      const upperToken = match.toUpperCase();
      if (FORMULA_JS_FUNCTION_NAMES.has(upperToken)) {
        return upperToken;
      }
      const cellVal = getValue(upperToken);
      if (cellVal === undefined || cellVal === null || cellVal === "") return "0";
      return typeof cellVal === "string" ? JSON.stringify(cellVal) : String(cellVal);
    });

    // 4. Convert Excel operators (=, <>, &) to JavaScript operators
    processed = convertExcelOperatorsToJS(processed);

    // 5. Restore original string literals
    processed = restoreStringLiterals(processed);

    // 6. Execute expression within @formulajs/formulajs context
    const keys = Object.keys(formulajs);
    const values = Object.values(formulajs);

    const fn = new Function(...keys, `"use strict"; return (${processed});`);
    const result = fn(...values);

    if (typeof result === "number") {
      if (Number.isNaN(result)) return "#VALUE!";
      return Number.isInteger(result) ? result : Number(result.toFixed(4));
    }
    if (typeof result === "boolean") {
      return result ? "TRUE" : "FALSE";
    }
    if (typeof result === "string") {
      return result;
    }
    return result !== null && result !== undefined ? String(result) : "";
  } catch (err) {
    console.warn("Failed to evaluate formula:", rawFormula, err);
    return rawFormula;
  }
}


