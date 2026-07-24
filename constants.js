export const WORKER_URL =
  "https://baha-worker.the6fallenangels.workers.dev/latest";

export const SYMBOL_API_MAP = {
  "gold-ounce": "OUNCE",
  "gold-mazaneh": "MAZANEH",
  "seke-bahar": "SEKE_BAHAR",
  "seke-emami": "SEKE_EMAMI",
  "seke-nim": "SEKE_NIM",
  "seke-rob": "SEKE_ROB",
  "seke-1g": "SEKE_1G",
};

export const MARQUEE_GAP_STYLES = {
  space: "         ",
  dot: "    •   ",
  dash: "    ———   ",
  star: "    ★   ",
  diamond: "    ◆   ",
};

export const SYMBOL_GROUPS = [
  {
    id: "gold",
    labels: {
      en: "Gold",
      fa: "طلا",
    },
    items: [
      {
        key: "show-gold18k",
        labels: { en: "18K Gold", fa: "طلا ۱۸ عیار" },
      },
      {
        key: "show-gold24k",
        labels: { en: "24K Gold", fa: "طلا ۲۴ عیار" },
      },
      {
        key: "show-gold-ounce",
        labels: { en: "Gold Ounce", fa: "اونس طلا" },
      },
      {
        key: "show-gold-mazaneh",
        labels: { en: "Mazaneh", fa: "مثقال" },
      },
      {
        key: "show-seke-bahar",
        labels: { en: "Bahar Coin", fa: "سکه بهار آزادی" },
      },
      {
        key: "show-seke-emami",
        labels: { en: "Emami Coin", fa: "سکه امامی" },
      },
      {
        key: "show-seke-nim",
        labels: { en: "Half Coin", fa: "نیم سکه" },
      },
      {
        key: "show-seke-rob",
        labels: { en: "Quarter Coin", fa: "ربع سکه" },
      },
      {
        key: "show-seke-1g",
        labels: { en: "1g Coin", fa: "سکه ۱ گرمی" },
      },
    ],
  },

  {
    id: "parsian",
    labels: {
      en: "Parsian Coins",
      fa: "سکه پارسیان",
    },
    items: [
      {
        key: "show-seke-prs100",
        labels: { en: "Parsian 100 sot", fa: "پارسیان ۱۰۰ سوت" },
      },
      {
        key: "show-seke-prs200",
        labels: { en: "Parsian 200 sot", fa: "پارسیان ۲۰۰ سوت" },
      },
      {
        key: "show-seke-prs400",
        labels: { en: "Parsian 400 sot", fa: "پارسیان ۴۰۰ سوت" },
      },
      {
        key: "show-seke-prs500",
        labels: { en: "Parsian 500 sot", fa: "پارسیان ۵۰۰ سوت" },
      },
      {
        key: "show-seke-prs700",
        labels: { en: "Parsian 700 sot", fa: "پارسیان ۷۰۰ سوت" },
      },
    ],
  },

  {
    id: "currency",
    labels: {
      en: "Currency",
      fa: "ارز",
    },
    items: [
      ["show-usd", { en: "USD", fa: "دلار" }],
      ["show-eur", { en: "EUR", fa: "یورو" }],
      ["show-gbp", { en: "GBP", fa: "پوند" }],
      ["show-aed", { en: "AED", fa: "درهم" }],
      ["show-try", { en: "TRY", fa: "لیر" }],
    ],
  },

  {
    id: "crypto",
    labels: {
      en: "Crypto",
      fa: "ارز دیجیتال",
    },
    items: [
      {
        key: "show-btc",
        labels: { en: "Bitcoin", fa: "بیت‌کوین" },
      },
      {
        key: "show-eth",
        labels: { en: "Ethereum", fa: "اتریوم" },
      },
      {
        key: "show-usdt",
        labels: { en: "USDT", fa: "تتر" },
      },
      {
        key: "show-xrp",
        labels: { en: "XRP", fa: "ریپل" },
      },
    ],
  },
];
