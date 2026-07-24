import { SYMBOL_API_MAP } from "./constants.js";

export function formatTrend(currentStr, minObj, maxObj) {
  const current = Number(currentStr);
  const min = Number(minObj?.["1hour"]);
  const max = Number(maxObj?.["1hour"]);

  if (
    !Number.isFinite(current) ||
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return { text: "--", style: "" };
  }

  if (current >= max) {
    return { text: "▲", style: "color: #2ecc71; font-weight: bold;" };
  }
  if (current <= min) {
    return { text: "▼", style: "color: #e74c3c; font-weight: bold;" };
  }

  const mid = (min + max) / 2;
  const range = (max - min) / 2;
  const normalized = (current - mid) / range;

  if (normalized > 0.3) {
    return { text: "↗", style: "color: #f39c12;" };
  }
  if (normalized < -0.3) {
    return { text: "↘", style: "color: #f39c12;" };
  }

  return { text: "→", style: "" };
}

export function getSymbolFromKey(key) {
  const rawSymbol = key.replace("show-", "");
  return (
    SYMBOL_API_MAP[rawSymbol] ?? rawSymbol.replaceAll("-", "_").toUpperCase()
  );
}

export function getItemKeyAndLabels(item) {
  const key = Array.isArray(item) ? item[0] : item.key;
  const labels = Array.isArray(item) ? item[1] : item.labels;
  return { key, labels };
}
