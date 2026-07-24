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

export const PREFS_STRINGS = {
  en: {
    pageTitle: "Baha",
    generalGroup: "General",
    intervalTitle: "Refresh interval",
    intervalSubtitle: "How often to fetch new rates (minimum 3 minutes)",
    gapTitle: "Marquee gap style",
    gapSubtitle: "Style shown between repeated text when scrolling",
    speedTitle: "Marquee speed",
    separatorTitle: "Separator",
    separatorSubtitle: "Character shown between symbols in the panel",
    trendTitle: "Show trend arrow in panel",
    trendSubtitle:
      "Display ▲/▼ next to values in the top bar, not just in the menu",
    lastUpdatedTitle: "Show last updated time",
    lastUpdatedSubtitle:
      "Display when the data was last refreshed, in the popup menu",
    aboutGroup: "About",
    aboutRow: "Symbols and language",
    aboutSubtitle: "Configure these from the panel popup menu directly.",
    sourceRow: "Source code on github",
    languageTitle: "Language",
    languageSubtitle: "Interface language",
    slow: "Slow",
    medium: "Medium",
    fast: "Fast",
    minutes3: "3 minutes",
    minutes5: "5 minutes",
    minutes10: "10 minutes",
    minutes15: "15 minutes",
    minutes30: "30 minutes",
    hour1: "1 hour",
    blankSpace: "Blank space",
    dot: "Dot: •",
    dash: "Dash: —",
    star: "Star: ★",
    diamond: "Diamond: ◆",
    pipe: "Pipe: |",
    middleDot: "Middle dot: ·",
    dashSymbol: "Dash: -",
    slash: "Slash: /",
    space: "Space",
    languageChanged: "Language changed. Please reopen.",
  },
  fa: {
    pageTitle: "بها",
    generalGroup: "تنظیمات عمومی",
    intervalTitle: "فاصله بروزرسانی",
    intervalSubtitle: "هر چند وقت یک‌بار نرخ‌ها بروزرسانی شوند (حداقل ۳ دقیقه)",
    gapTitle: "طرح فاصله بین تکرار متن",
    gapSubtitle: "طرحی که بین تکرار متن هنگام اسکرول نمایش داده می‌شود.",
    speedTitle: "سرعت اسکرول",
    separatorTitle: "جداکننده",
    separatorSubtitle: "کاراکتری که بین نمادها در نوار بالا نمایش داده می‌شود",
    trendTitle: "نمایش فلش تغییرات در نوار بالا",
    trendSubtitle: "نمایش ▲/▼ کنار مقادیر در تاپ‌بار، نه فقط در منو",
    lastUpdatedTitle: "نمایش زمان آخرین بروزرسانی",
    lastUpdatedSubtitle: "نمایش زمان آخرین بروزرسانی داده‌ها در منوی پاپ‌آپ",
    aboutGroup: "درباره",
    aboutRow: "نمادها و زبان",
    aboutSubtitle: "مستقیماً از منوی پاپ‌آپ پنل تنظیم کنید.",
    sourceRow: "کد منبع در گیتهاب",
    languageTitle: "زبان",
    languageSubtitle: "زبان رابط کاربری",
    slow: "آهسته",
    medium: "متوسط",
    fast: "سریع",
    minutes3: "۳ دقیقه",
    minutes5: "۵ دقیقه",
    minutes10: "۱۰ دقیقه",
    minutes15: "۱۵ دقیقه",
    minutes30: "۳۰ دقیقه",
    hour1: "۱ ساعت",
    blankSpace: "خالی",
    dot: "نقطه: •",
    dash: "خط: —",
    star: "ستاره: ★",
    diamond: "الماس: ◆",
    pipe: "خط عمودی: |",
    middleDot: "نقطه میانی: ·",
    dashSymbol: "خط تیره: -",
    slash: "اسلش: /",
    space: "فاصله",
    languageChanged: "زبان تغییر کرد. دوباره باز کنید.",
  },
};
