import St from "gi://St";
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
const REFRESH_SECONDS = 180;

const BahaIndicator = GObject.registerClass(
  class BahaIndicator extends PanelMenu.Button {
    _init(settings) {
      super._init(0.0, "Baha Indicator");
      this._settings = settings;

      this._viewport = new St.Bin({
        clip_to_allocation: true,
        style_class: "baha-viewport",
      });

      this._track = new St.Widget({
        layout_manager: new Clutter.FixedLayout(),
      });

      this._labelA = new St.Label({ y_align: Clutter.ActorAlign.CENTER });
      this._labelB = new St.Label({ y_align: Clutter.ActorAlign.CENTER });

      for (const label of [this._labelA, this._labelB]) {
        label.clutter_text.set_line_wrap(false);
        label.clutter_text.set_ellipsize(Pango.EllipsizeMode.NONE);
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
        if (this._lastData) this._render(this._lastData);
      });
    }

    _buildMenu() {
      const symbolSwitches = [
        ["show-usd", "USD | دلار"],
        ["show-eur", "EUR | یورو"],
        ["show-gold18k", "Gold 18K | طلا 18 عیار"],
        ["show-btc", "BTC | بیتکوین"],
      ];
      for (const [key, label] of symbolSwitches) {
        const item = new PopupMenu.PopupSwitchMenuItem(
          label,
          this._settings.get_boolean(key),
        );
        item.connect("toggled", (_item, state) => {
          this._settings.set_boolean(key, state);
        });
        item.activate = () => {
          item.toggle();
        };
        this.menu.addMenuItem(item);
      }

      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      const langSubMenuText =
        this._settings.get_string("language") === "en" ? "Language" : "زبان";
      this._langSubMenu = new PopupMenu.PopupSubMenuMenuItem(langSubMenuText);
      this._langItems = {};

      const languages = [
        ["en", "English"],
        ["fa", "فارسی"],
      ];

      for (const [code, label] of languages) {
        const langItem = new PopupMenu.PopupMenuItem(label);
        langItem.activate = () => {
          this._settings.set_string("language", code);
          this._updateLanguageOrnaments();
        };
        this._langSubMenu.menu.addMenuItem(langItem);
        this._langItems[code] = langItem;
      }

      this.menu.addMenuItem(this._langSubMenu);
      this._updateLanguageOrnaments();

      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      const updatedText =
        this._settings.get_string("language") === "en"
          ? "Last updated: --"
          : "آخرین بروزرسانی";
      this._lastUpdateItem = new PopupMenu.PopupMenuItem(updatedText, {
        reactive: false,
      });
      this.menu.addMenuItem(this._lastUpdateItem);
    }

    _updateLanguageOrnaments() {
      const current = this._settings.get_string("language");
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
        this._label.set_text("Baha: --");
        return;
      }
      this._render(this._lastData);
    }

    _render(json) {
      const data = json?.data;
      const lang = this._settings.get_string("language");
      const parts = [];

      if (!data) {
        this._baseText = lang === "en" ? "Baha: --" : "بها: --";
        this._applyText();
        return;
      }

      if (
        this._settings.get_boolean("show-usd") &&
        data.currency?.USD?.current
      ) {
        const v = Number(data.currency.USD.current).toLocaleString();
        parts.push(lang === "fa" ? `دلار ${v}` : `USD ${v}`);
      }
      if (
        this._settings.get_boolean("show-eur") &&
        data.currency?.EUR?.current
      ) {
        const v = Number(data.currency.EUR.current).toLocaleString();
        parts.push(lang === "fa" ? `یورو ${v}` : `EUR ${v}`);
      }
      if (
        this._settings.get_boolean("show-gold18k") &&
        data.gold?.GOLD18K?.current
      ) {
        const v = Number(data.gold.GOLD18K.current).toLocaleString();
        parts.push(lang === "fa" ? `طلا ${v}` : `Gold ${v}`);
      }
      if (this._settings.get_boolean("show-btc") && data.crypto?.BTC?.current) {
        const v = Number(data.crypto.BTC.current).toLocaleString();
        parts.push(lang === "fa" ? `بیت‌کوین ${v}` : `BTC ${v}`);
      }

      this._baseText = parts.length
        ? parts.join(" | ")
        : lang === "en"
          ? "Baha: --"
          : "بها: --";

      if (data.date) {
        const prefix = lang === "fa" ? "آخرین بروزرسانی" : "Last updated";
        this._lastUpdateItem.label.set_text(`${prefix}: ${data.date}`);
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
      const PIXELS_PER_SECOND = 40;
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
    this._indicator = new BahaIndicator(this._settings);
    Main.panel.addToStatusArea("baha-indicator", this._indicator);

    this._fetchAndUpdate();
    this._timeoutId = GLib.timeout_add_seconds(
      GLib.PRIORITY_DEFAULT,
      REFRESH_SECONDS,
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
