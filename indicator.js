import St from "gi://St";
import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import Soup from "gi://Soup?version=3.0";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import Pango from "gi://Pango";
import {
  SYMBOL_GROUPS,
  GROUP_MAP,
  MARQUEE_GAP_STYLES,
  SPEED_MAP,
} from "./constants.js";
import { formatTrend, getSymbolFromKey, getItemKeyAndLabels } from "./utils.js";
import { MenuBuilder } from "./menuBuilder.js";

const BahaIndicator = GObject.registerClass(
  class BahaIndicator extends PanelMenu.Button {
    _init(settings, extension) {
      super._init(0.0, "Baha Indicator");
      this._settings = settings;
      this._extension = extension;
      this._symbolWidgetsByKey = new Map();

      this._initUI();

      this._menuBuilder = new MenuBuilder(
        settings,
        extension,
        this._symbolWidgetsByKey,
      );
      this._menuBuilder.build(this.menu);
      this.menu.actor.add_style_class_name("baha-menu");

      this._lastData = null;
      this._session = new Soup.Session();
      this._marqueeGeneration = 0;
      this._marqueeTimeoutId = null;

      this._settingsChangedId = this._settings.connect("changed", () => {
        this._menuBuilder.updateLanguage();
        const lastUpdateItem = this._menuBuilder.getLastUpdateItem();
        if (lastUpdateItem) {
          lastUpdateItem.visible =
            this._settings.get_boolean("show-last-updated");
        }
        if (this._lastData) this._render(this._lastData);
      });
    }

    _initUI() {
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
    }

    setData(json, isError) {
      if (!isError && json) {
        this._lastData = json;
      }
      if (!this._lastData) {
        this._baseText =
          this._settings.get_string("language") === "en" ? "Baha" : "بها";
        this._applyText();
        return;
      }
      this._render(this._lastData);
    }

    _render(json) {
      const data = json?.data;
      const lang = this._settings.get_string("language");
      const parts = [];

      if (!data) {
        this._baseText = lang === "en" ? "Baha" : "بها";
        this._applyText();
        return;
      }

      for (const group of SYMBOL_GROUPS) {
        const dataKey = GROUP_MAP[group.id];
        const dataGroup = data[dataKey];
        if (!dataGroup) continue;

        for (const item of group.items) {
          const { key, labels } = getItemKeyAndLabels(item);
          const symbol = getSymbolFromKey(key);
          const value = dataGroup[symbol]?.current;

          if (!value) continue;

          const widgets = this._symbolWidgetsByKey.get(key);
          const numericValue = Number(value);
          const formatted = numericValue.toLocaleString();

          let trend = { text: "", style: "" };

          if (widgets) {
            widgets.valueLabel.set_text(formatted);
            const symbolData = dataGroup[symbol];
            trend = formatTrend(value, symbolData?.min, symbolData?.max);
            widgets.arrowLabel.set_text(trend.text);
            widgets.arrowLabel.set_style(trend.style);
          }

          if (!this._settings.get_boolean(key)) continue;

          const showTrend = this._settings.get_boolean("show-trend-in-panel");
          const trendSuffix =
            showTrend && trend.text !== "--" ? ` ${trend.text}` : "";
          parts.push(`${trendSuffix} ${labels[lang]} ${formatted}`);
        }
      }

      const separator = this._settings.get_string("separator") || "|";
      this._baseText = parts.length
        ? parts.join(`  ${separator} `)
        : lang === "en"
          ? "Baha"
          : "بها";

      const lastUpdateItem = this._menuBuilder.getLastUpdateItem();
      if (data.date && lastUpdateItem) {
        const prefix = lang === "fa" ? "آخرین بروزرسانی" : "Last updated";
        const date = lang === "fa" ? `\u200E${data.date}\u200E` : data.date;
        lastUpdateItem.label.set_text(`${prefix}: ${date}`);
      }

      this._applyText();
    }

    _applyText() {
      this._marqueeGeneration++;

      if (this._marqueeTimeoutId) {
        GLib.source_remove(this._marqueeTimeoutId);
        this._marqueeTimeoutId = null;
      }

      const gapStyle = this._settings.get_string("marquee-gap-style");
      const GAP_TEXT = MARQUEE_GAP_STYLES[gapStyle] ?? MARQUEE_GAP_STYLES.dot;

      const fullUnit = this._baseText + GAP_TEXT;

      this._labelA.set_text(fullUnit);
      this._labelB.set_text(fullUnit);
      this._labelB.hide();
      this._track.set_position(0, 0);

      GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
        const viewportWidth = this._viewport.get_width();

        const probe = new St.Label({ text: this._baseText });
        const [, plainWidth] = probe.get_preferred_width(-1);
        probe.destroy();

        if (plainWidth <= viewportWidth) {
          this._labelA.set_text(this._baseText);
          this._labelA.set_position(0, 0);
          return GLib.SOURCE_REMOVE;
        }

        const [, unitWidth] = this._labelA.get_preferred_width(-1);

        this._labelA.set_position(0, 0);
        this._labelB.set_position(unitWidth, 0);
        this._labelB.show();

        this._startMarqueeLoop(unitWidth, this._marqueeGeneration);

        return GLib.SOURCE_REMOVE;
      });
    }

    _startMarqueeLoop(loopWidth, myGeneration) {
      const TICK_MS = 40;
      const PIXELS_PER_SECOND =
        SPEED_MAP[this._settings.get_int("marquee-speed")] ?? SPEED_MAP.medium;
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

export default BahaIndicator;
