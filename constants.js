export const WORKER_URL =
  "https://baha-worker.the6fallenangels.workers.dev/latest";

export const NERKH_DIRECT_URL = "https://api.nerkh.io/v1/prices/json/all";

export const MIN_VIEWPORT_WIDTH = 50;
export const MAX_VIEWPORT_WIDTH = 220;
export const TICK_MS = 30;

export const MARQUEE_GAP_STYLES = {
  space: "             ",
  dot: "      •    ",
  dash: "      ———    ",
  star: "      ★    ",
  diamond: "      ◆    ",
};

export const LANGUAGES = [
  ["en", "English"],
  ["fa", "پارسی"],
];

export const SPEED_MAP = Object.freeze({ slow: 10, medium: 25, fast: 55 });

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
    intervalSubtitle: "How often to fetch new rates (minimum 10 minutes)",
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
    supportRow: "Support Baha ❤️",
    languageTitle: "Language",
    languageSubtitle: "Interface language",
    currencyDisplayTitle: "Currency display",
    currencyDisplaySubtitle: "Show prices in Toman or US Dollars",
    toman: "Toman",
    dollar: "US Dollar ($)",
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
    dataSourceGroup: "Data Source",
    dataSourceTitle: "Data source",
    dataSourceSubtitle: "Choose where prices are fetched from",
    workerOption: "Baha Cloud (shared, recommended)",
    directOption: "Personal nerkh.io key (direct)",
    customWorkerOption: "Custom Worker URL",
    apiKeyTitle: "nerkh.io API Key",
    apiKeySubtitle: "Get a free key at cp.nerkh.io (465 req/month)",
    customWorkerUrlTitle: "Worker URL",
    customWorkerUrlSubtitle:
      "Your deployed worker URL, e.g. https://your-worker.workers.dev/latest",
    testConnectionLabel: "Test Connection",
    testConnectionSubtitle: "Verify your key or worker",
    quotaWarning:
      "Free tier: 6/hour, 150/day, 465/month — use 90min interval or Baha Cloud",
    directQuotaWarning:
      "Free key = ~15/day. Use 30-60min refresh to avoid 460 QuotaExceeded",
    getFreeKeyLabel: "Get free key at cp.nerkh.io",
    apiKeyEmptyWarning: "API key is empty — add your nerkh.io key",
    customWorkerEmptyWarning: "Worker URL is empty",
    connectionSuccess: "Connection successful!",
    connectionFailed: "Connection failed — check key/URL",
    quotaExceededMsg: "Quota exceeded (460) — please try later or use another source",
  },
  fa: {
    pageTitle: "بها",
    generalGroup: "تنظیمات عمومی",
    intervalTitle: "فاصله بروزرسانی",
    intervalSubtitle: "هر چند وقت یک‌بار نرخ‌ها بروزرسانی شوند (حداقل ۱۰ دقیقه)",
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
    supportRow: "حمایت از بها ❤️",
    languageTitle: "زبان",
    languageSubtitle: "زبان رابط کاربری",
    currencyDisplayTitle: "واحد نمایش قیمت",
    currencyDisplaySubtitle: "قیمت‌ها به تومان یا دلار آمریکا نمایش داده شوند",
    toman: "تومان",
    dollar: "دلار آمریکا ($)",
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
    dataSourceGroup: "منبع داده",
    dataSourceTitle: "منبع داده",
    dataSourceSubtitle: "انتخاب کنید قیمت‌ها از کجا دریافت شوند",
    workerOption: "ابری بها (اشتراکی، پیشنهادی)",
    directOption: "کلید شخصی nerkh.io (مستقیم)",
    customWorkerOption: "آدرس ورکر شخصی",
    apiKeyTitle: "کلید nerkh.io",
    apiKeySubtitle: "کلید رایگان از cp.nerkh.io (۴۶۵ درخواست در ماه)",
    customWorkerUrlTitle: "آدرس ورکر",
    customWorkerUrlSubtitle:
      "آدرس ورکر خودتان، مثلا https://your-worker.workers.dev/latest",
    testConnectionLabel: "بررسی اتصال",
    testConnectionSubtitle: "صحت کلید یا ورکر را بررسی کنید",
    quotaWarning:
      "سهمیه رایگان: ۶ در ساعت، ۱۵۰ در روز، ۴۶۵ در ماه — از فاصله ۹۰ دقیقه یا ابری بها استفاده کنید",
    directQuotaWarning:
      "کلید رایگان ≈ ۱۵ درخواست در روز. برای جلوگیری از خطای ۴۶۰ از فاصله ۳۰-۶۰ دقیقه استفاده کنید",
    getFreeKeyLabel: "دریافت کلید رایگان از cp.nerkh.io",
    apiKeyEmptyWarning: "کلید خالی است — کلید nerkh.io را وارد کنید",
    customWorkerEmptyWarning: "آدرس ورکر خالی است",
    connectionSuccess: "اتصال موفق!",
    connectionFailed: "اتصال ناموفق — کلید/آدرس را بررسی کنید",
    quotaExceededMsg: "سهمیه تمام شد (۴۶۰) — بعدا تلاش کنید یا منبع دیگری انتخاب کنید",
  },
};

export const UI_STRINGS = {
  en: {
    appName: "Baha",
    language: "Language",
    lastUpdatedPrefix: "Last updated",
    lastUpdatedPlaceholder: "Last updated: --",
    quotaExceeded: "Quota 460 exceeded — change source in Preferences",
    fetchFailed: "Fetch failed",
    invalidJson: "Invalid JSON",
  },
  fa: {
    appName: "بها",
    language: "زبان",
    lastUpdatedPrefix: "آخرین بروزرسانی",
    lastUpdatedPlaceholder: "آخرین بروزرسانی: --",
    quotaExceeded: "سهمیه ۴۶۰ تمام شد — منبع را در تنظیمات عوض کنید",
    fetchFailed: "خطا در دریافت",
    invalidJson: "JSON نامعتبر",
  },
};
