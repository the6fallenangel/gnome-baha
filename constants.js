export const WORKER_URL =
  "https://baha-worker.the6fallenangels.workers.dev/latest";

export const MARQUEE_GAP_STYLES = {
  space: "             ",
  dot: "      •     ",
  dash: "      ———     ",
  star: "      ★     ",
  diamond: "      ◆     ",
};

export const LANGUAGES = [
  ["en", "English"],
  ["fa", "فارسی"],
];

export const SPEED_MAP = Object.freeze({ slow: 10, medium: 25, fast: 45 });

export const SYMBOL_API_MAP = {
  "gold-ounce": "OUNCE",
  "gold-mazaneh": "MAZANEH",
  "seke-bahar": "SEKE_BAHAR",
  "seke-emami": "SEKE_EMAMI",
  "seke-nim": "SEKE_NIM",
  "seke-rob": "SEKE_ROB",
  "seke-1g": "SEKE_1G",
};

export function createItem(key, enLabel, faLabel) {
  return { key: `show-${key}`, labels: { en: enLabel, fa: faLabel } };
}

export function createGroup(id, enLabel, faLabel, items) {
  return { id, labels: { en: enLabel, fa: faLabel }, items };
}

export const SYMBOL_GROUPS = [
  createGroup("gold", "Gold", "طلا", [
    createItem("gold18k", "18K Gold", "طلا ۱۸ عیار"),
    createItem("gold24k", "24K Gold", "طلا ۲۴ عیار"),
    createItem("gold-ounce", "Gold Ounce", "اونس طلا"),
    createItem("gold-mazaneh", "Mazaneh", "مثقال"),
    createItem("seke-bahar", "Bahar Coin", "سکه بهار آزادی"),
    createItem("seke-emami", "Emami Coin", "سکه امامی"),
    createItem("seke-nim", "Half Coin", "نیم سکه"),
    createItem("seke-rob", "Quarter Coin", "ربع سکه"),
    createItem("seke-1g", "1g Coin", "سکه ۱ گرمی"),
  ]),

  createGroup("parsian", "Parsian Coins", "سکه پارسیان", [
    createItem("seke-prs100", "Parsian 100 sot", "پارسیان ۱۰۰ سوت"),
    createItem("seke-prs200", "Parsian 200 sot", "پارسیان ۲۰۰ سوت"),
    createItem("seke-prs400", "Parsian 400 sot", "پارسیان ۴۰۰ سوت"),
    createItem("seke-prs500", "Parsian 500 sot", "پارسیان ۵۰۰ سوت"),
    createItem("seke-prs700", "Parsian 700 sot", "پارسیان ۷۰۰ سوت"),
  ]),

  createGroup("currency", "Currency", "ارز", [
    createItem("usd", "USD", "دلار"),
    createItem("eur", "EUR", "یورو"),
    createItem("gbp", "GBP", "پوند"),
    createItem("aed", "AED", "درهم"),
    createItem("try", "TRY", "لیر"),
  ]),

  createGroup("crypto", "Crypto", "ارز دیجیتال", [
    createItem("btc", "Bitcoin", "بیت‌کوین"),
    createItem("eth", "Ethereum", "اتریوم"),
    createItem("usdt", "USDT", "تتر"),
    createItem("xrp", "XRP", "ریپل"),
  ]),
];

export const GROUP_MAP = {
  gold: "gold",
  parsian: "gold",
  currency: "currency",
  crypto: "crypto",
};
