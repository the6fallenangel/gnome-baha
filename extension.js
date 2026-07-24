import St from "gi://St";
import Gio from "gi://Gio";
import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import Soup from "gi://Soup?version=3.0";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import Pango from "gi://Pango";

const WORKER_URL = "https://baha-worker.the6fallenangels.workers.dev/latest";

const SYMBOL_API_MAP = {
  "gold-ounce": "OUNCE",
  "gold-mazaneh": "MAZANEH",
  "seke-bahar": "SEKE_BAHAR",
  "seke-emami": "SEKE_EMAMI",
  "seke-nim": "SEKE_NIM",
  "seke-rob": "SEKE_ROB",
  "seke-1g": "SEKE_1G",
};
const SYMBOL_GROUPS = [
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

const BahaIndicator = GObject.registerClass(
  class BahaIndicator extends PanelMenu.Button {
    _init(settings, extension) {
      super._init(0.0, "Baha Indicator");
      this._settings = settings;
      this._extension = extension;

      this._viewport = new St.Bin({
        clip_to_allocation: true,
        style_class: "baha-viewport",
      });

      this._track = new St.Widget({
        layout_manager: new Clutter.FixedLayout(),
        y_expand: true,
        y_align: Clutter.ActorAlign.CENTER,
      });

      this._labelA = new St.Label({
        y_align: Clutter.ActorAlign.CENTER,
        y_expand: true,
      });

      this._labelB = new St.Label({
        y_align: Clutter.ActorAlign.CENTER,
        y_expand: true,
      });

      for (const label of [this._labelA, this._labelB]) {
        label.clutter_text.set_line_wrap(false);
        label.clutter_text.set_ellipsize(Pango.EllipsizeMode.NONE);
        label.clutter_text.set_y_align(Clutter.ActorAlign.CENTER);
        this._track.add_child(label);
      }

      this._viewport.set_child(this._track);
      this.add_child(this._viewport);

      this._buildMenu();

      this._lastData = null;
      this._session = new Soup.Session();
      this._marqueeGeneration = 0;
      this._marqueeTimeoutId = null;

      this._settingsChangedId = this._settings.connect("changed", () => {
        this._updateMenuLanguage();
        if (this._lastData) this._render(this._lastData);
      });
    }

    _buildMenu() {
      const lang = this._getLang();
      this._symbolGroups = [];
      this._symbolItems = [];
      this._symbolWidgetsByKey = new Map();

      for (const group of SYMBOL_GROUPS) {
        const submenu = new PopupMenu.PopupSubMenuMenuItem(group.labels[lang]);
        this._symbolGroups.push({
          menu: submenu,
          group,
        });

        for (const item of group.items) {
          const key = Array.isArray(item) ? item[0] : item.key;
          const labels = Array.isArray(item) ? item[1] : item.labels;

          const checkItem = new PopupMenu.PopupMenuItem(labels[lang]);
          checkItem.label.x_expand = true;
          checkItem.setOrnament(
            this._settings.get_boolean(key)
              ? PopupMenu.Ornament.CHECK
              : PopupMenu.Ornament.NONE,
          );

          const valueLabel = new St.Label({
            text: "",
            y_align: Clutter.ActorAlign.CENTER,
            style_class: "baha-item-value",
          });
          const arrowLabel = new St.Label({
            text: "",
            y_align: Clutter.ActorAlign.CENTER,
            style_class: "baha-item-arrow",
          });
          checkItem.add_child(valueLabel);
          checkItem.add_child(arrowLabel);

          checkItem.activate = () => {
            const newState = !this._settings.get_boolean(key);
            this._settings.set_boolean(key, newState);
            checkItem.setOrnament(
              newState ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE,
            );
          };

          this._symbolItems.push({
            item: checkItem,
            labels,
            key,
            valueLabel,
          });

          this._symbolWidgetsByKey.set(key, { valueLabel, arrowLabel });

          submenu.menu.addMenuItem(checkItem);
        }

        this.menu.addMenuItem(submenu);
      }

      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      const langSubMenuText = lang === "en" ? "Language" : "زبان";
      this._langSubMenu = new PopupMenu.PopupSubMenuMenuItem(langSubMenuText);
      this._langSubMenuLabels = {
        en: "Language",
        fa: "زبان",
      };

      this._langItems = {};

      const languages = [
        ["en", "English"],
        ["fa", "فارسی"],
      ];

      for (const [code, label] of languages) {
        const langItem = new PopupMenu.PopupMenuItem(label);
        langItem.activate = () => {
          this._settings.set_string("language", code);
        };
        this._langSubMenu.menu.addMenuItem(langItem);
        this._langItems[code] = langItem;
      }

      this.menu.addMenuItem(this._langSubMenu);
      this._updateLanguageOrnaments();

      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      const updatedText =
        lang === "en" ? "Last updated: --" : "آخرین بروزرسانی";
      this._lastUpdateItem = new PopupMenu.PopupMenuItem(updatedText, {
        reactive: false,
      });
      this.menu.addMenuItem(this._lastUpdateItem);

      const footerRow = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
        can_focus: false,
      });

      const spacer = new St.Widget({ x_expand: true });

      const settingsButton = new St.Button({
        style_class: "baha-footer-button",
        child: new St.Icon({
          icon_name: "preferences-system-symbolic",
          icon_size: 16,
        }),
      });
      settingsButton.connect("clicked", () => {
        this._extension.openPreferences();
        this.menu.close();
      });

      const githubButton = new St.Button({
        style_class: "baha-footer-button",
        child: new St.Icon({
          icon_name: "web-browser-symbolic",
          icon_size: 16,
        }),
      });
      githubButton.connect("clicked", () => {
        Gio.AppInfo.launch_default_for_uri(
          "https://github.com/the6fallenangel/gnome-baha",
          null,
        );
        this.menu.close();
      });

      footerRow.add_child(spacer);
      footerRow.add_child(settingsButton);
      footerRow.add_child(githubButton);
      this.menu.addMenuItem(footerRow);
    }

    _formatTrend(currentStr, minObj, maxObj) {
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
      return { text: "--", style: "" };
    }

    _getLang() {
      return this._settings.get_string("language");
    }

    _updateMenuLanguage() {
      const lang = this._getLang();
      for (const { menu, group } of this._symbolGroups) {
        menu.label.text = group.labels[lang];
      }
      for (const { item, labels } of this._symbolItems) {
        item.label.text = labels[lang];
      }
      this._langSubMenu.label.text = this._langSubMenuLabels[lang];
      this._updateLanguageOrnaments();
    }

    _updateLanguageOrnaments() {
      const current = this._getLang();
      for (const [code, item] of Object.entries(this._langItems)) {
        item.setOrnament(
          code === current ? PopupMenu.Ornament.DOT : PopupMenu.Ornament.NONE,
        );
      }
    }

    setData(json, isError) {
      if (!isError && json) {
        this._lastData = json;
      }
      if (!this._lastData) {
        this._baseText = this._getLang() === "en" ? "Baha" : "بها";
        this._applyText();
        return;
      }
      this._render(this._lastData);
    }

    _render(json) {
      const data = json?.data;
      const lang = this._getLang();
      const parts = [];

      if (!data) {
        this._baseText = lang === "en" ? "Baha" : "بها";
        this._applyText();
        return;
      }

      for (const group of SYMBOL_GROUPS) {
        let dataGroup;

        switch (group.id) {
          case "gold":
          case "parsian":
            dataGroup = data.gold;
            break;

          case "currency":
            dataGroup = data.currency;
            break;

          case "crypto":
            dataGroup = data.crypto;
            break;
        }

        if (!dataGroup) continue;

        for (const item of group.items) {
          const key = Array.isArray(item) ? item[0] : item.key;

          const rawSymbol = key.replace("show-", "");

          const symbol =
            SYMBOL_API_MAP[rawSymbol] ??
            rawSymbol.replaceAll("-", "_").toUpperCase();

          const value = dataGroup[symbol]?.current;
          if (!value) continue;

          const numericValue = Number(value);
          const labels = Array.isArray(item) ? item[1] : item.labels;

          const widgets = this._symbolWidgetsByKey.get(key);

          let trend = { text: "", style: "" };

          if (widgets) {
            widgets.valueLabel.set_text(Number(value).toLocaleString());
            const symbolData = dataGroup[symbol];
            trend = this._formatTrend(value, symbolData?.min, symbolData?.max);
            widgets.arrowLabel.set_text(trend.text);
            widgets.arrowLabel.set_style(trend.style);
          }

          const formatted = Number(value).toLocaleString();

          if (!this._settings.get_boolean(key)) continue;

          const showTrend = this._settings.get_boolean("show-trend-in-panel");
          const trendSuffix =
            showTrend && trend.text !== "-" ? ` ${trend.text}` : "";
          parts.push(`${trendSuffix} ${labels[lang]} ${formatted}`);
        }
      }

      const separator = this._settings.get_string("separator") || "|";
      this._baseText = parts.length
        ? parts.join(` ${separator} `)
        : lang === "en"
          ? "Baha"
          : "بها";

      if (data.date) {
        const prefix = lang === "fa" ? "آخرین بروزرسانی" : "Last updated";
        const date = lang === "fa" ? `\u200E${data.date}\u200E` : data.date;
        this._lastUpdateItem.label.set_text(`${prefix}: ${date}`);
      }

      this._applyText();
    }

    _applyText() {
      this._marqueeGeneration++;

      if (this._marqueeTimeoutId) {
        GLib.source_remove(this._marqueeTimeoutId);
        this._marqueeTimeoutId = null;
      }

      this._labelA.set_text(this._baseText);
      this._labelB.set_text(this._baseText);
      this._labelB.hide();
      this._track.set_position(0, 0);

      GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
        const viewportWidth = this._viewport.get_width();

        const [, textWidth] = this._labelA.get_preferred_width(-1);

        if (textWidth <= viewportWidth) {
          this._labelA.set_position(0, 0);
          return GLib.SOURCE_REMOVE;
        }

        const GAP = 40;

        this._labelA.set_position(0, 0);
        this._labelB.set_position(textWidth + GAP, 0);
        this._labelB.show();

        this._startMarqueeLoop(textWidth + GAP, this._marqueeGeneration);

        return GLib.SOURCE_REMOVE;
      });
    }

    _startMarqueeLoop(loopWidth, myGeneration) {
      const TICK_MS = 30;
      const SPEED_MAP = { slow: 10, medium: 25, fast: 45 };
      const PIXELS_PER_SECOND =
        SPEED_MAP[this._settings.get_string("marquee-speed")] ??
        SPEED_MAP.medium;
      const stepPx = PIXELS_PER_SECOND * (TICK_MS / 1000);

      let x = 0;

      this._marqueeTimeoutId = GLib.timeout_add(
        GLib.PRIORITY_DEFAULT,
        TICK_MS,
        () => {
          if (myGeneration !== this._marqueeGeneration) {
            return GLib.SOURCE_REMOVE;
          }

          x = (x - stepPx) % loopWidth;
          this._track.set_position(x, 0);

          return GLib.SOURCE_CONTINUE;
        },
      );
    }

    destroy() {
      this._marqueeGeneration++;
      if (this._marqueeTimeoutId) {
        GLib.source_remove(this._marqueeTimeoutId);
        this._marqueeTimeoutId = null;
      }
      if (this._settingsChangedId) {
        this._settings.disconnect(this._settingsChangedId);
        this._settingsChangedId = null;
      }
      this._session = null;
      super.destroy();
    }
  },
);

export default class BahaExtension extends Extension {
  enable() {
    this._settings = this.getSettings();
    this._indicator = new BahaIndicator(this._settings, this);
    Main.panel.addToStatusArea("baha-indicator", this._indicator);

    this._fetchAndUpdate();
    this._scheduleRefresh();

    this._intervalChangedId = this._settings.connect(
      "changed::refresh-interval-minutes",
      () => this._scheduleRefresh(),
    );
  }

  _scheduleRefresh() {
    if (this._timeoutId) {
      GLib.source_remove(this._timeoutId);
      this._timeoutId = null;
    }

    const minutes = this._settings.get_int("refresh-interval-minutes");
    const seconds = minutes * 60;

    if (seconds < 180) {
      seconds = 180;
    }

    this._timeoutId = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      seconds,
      () => {
        this._fetchAndUpdate();
        return GLib.SOURCE_CONTINUE;
      },
    );
  }

  disable() {
    if (this._timeoutId) {
      GLib.source_remove(this._timeoutId);
      this._timeoutId = null;
    }
    if (this._intervalChangedId) {
      this._settings.disconnect(this._intervalChangedId);
      this._intervalChangedId = null;
    }
    this._indicator?.destroy();
    this._indicator = null;
    this._settings = null;
  }

  _fetchAndUpdate() {
    const message = Soup.Message.new("GET", WORKER_URL);

    this._indicator._session.send_and_read_async(
      message,
      GLib.PRIORITY_DEFAULT,
      null,
      (session, result) => {
        try {
          const bytes = session.send_and_read_finish(result);
          const text = new TextDecoder().decode(bytes.get_data());
          const json = JSON.parse(text);
          this._indicator.setData(json, false);
        } catch (e) {
          this._indicator.setData(null, true);
          logError(e, "Baha fetch failed, showing cached data if any");
        }
      },
    );
  }
}
