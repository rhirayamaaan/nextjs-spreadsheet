import type {
  ColorValue,
  RgbColor,
} from "../services/reportLayout/reportLayout.types";

/**
 * サーバーから受け取った ColorValue (HEX 文字列 または RGB タプル) を
 * jsPDF / jspdf-autotable で使用可能な RgbColor ([number, number, number]) に正規化する。
 */
export const resolveRgbColor = (
  color?: ColorValue,
  fallback: RgbColor = [0, 0, 0],
): RgbColor => {
  if (!color) {
    return fallback;
  }

  if (Array.isArray(color)) {
    if (color.length >= 3) {
      const r = Math.min(255, Math.max(0, Math.round(color[0] ?? 0)));
      const g = Math.min(255, Math.max(0, Math.round(color[1] ?? 0)));
      const b = Math.min(255, Math.max(0, Math.round(color[2] ?? 0)));
      return [r, g, b];
    }
    return fallback;
  }

  if (typeof color === "string") {
    const trimmed = color.trim();
    const hexPattern = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i;
    const shortHexPattern = /^#?([a-f\d])([a-f\d])([a-f\d])/i;

    const fullMatch = hexPattern.exec(trimmed);
    if (fullMatch?.[1] && fullMatch[2] && fullMatch[3]) {
      return [
        Number.parseInt(fullMatch[1], 16),
        Number.parseInt(fullMatch[2], 16),
        Number.parseInt(fullMatch[3], 16),
      ];
    }

    const shortMatch = shortHexPattern.exec(trimmed);
    if (shortMatch?.[1] && shortMatch[2] && shortMatch[3]) {
      return [
        Number.parseInt(shortMatch[1] + shortMatch[1], 16),
        Number.parseInt(shortMatch[2] + shortMatch[2], 16),
        Number.parseInt(shortMatch[3] + shortMatch[3], 16),
      ];
    }
  }

  return fallback;
};
