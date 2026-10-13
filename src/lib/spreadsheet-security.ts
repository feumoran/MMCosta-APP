// CSV readers interpret formula prefixes even in quoted cells and after
// leading whitespace/control characters. Numeric values remain numeric.
export function safeSpreadsheetCell<T>(value: T): T | string {
  if (typeof value !== "string") return value;
  return /^[\s\u0000-\u001f\u007f]*[=+\-@]/u.test(value) || /^[\t\r\n]/.test(value)
    ? `'${value}`
    : value;
}

export function safeSpreadsheetRows(rows: Record<string, string | number>[]) {
  return rows.map(row => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, safeSpreadsheetCell(value)]),
  ));
}