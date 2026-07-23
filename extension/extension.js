import St from "gi://St";
import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import Soup from "gi://Soup?version=3.0";
import GObject from "gi://GObject";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

const WORKER_URL = "https://baha-worker.the6fallenangels.workers.dev/latest";
const REFRESH_SECONDS = 180;

const BahaIndicator = GObject.registerClass(
  class BahaIndicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, "Baha Indicator");

      this._label = new St.Label({
        text: "...",
        y_align: Clutter.ActorAlign.CENTER,
        style_class: "baha-panel-label",
      });
      this.add_child(this._label);

      this._lastUpdateItem = new PopupMenu.PopupMenuItem("Last updated: --", {
        reactive: false,
      });
      this.menu.addMenuItem(this._lastUpdateItem);

      this._lastData = null;
      this._session = new Soup.Session();
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
      if (!data) {
        this._label.set_text("Baha: --");
        return;
      }

      const usd = data.currency?.USD?.current;
      const gold = data.gold?.GOLD18K?.current;

      const usdText = usd ? `USD ${Number(usd).toLocaleString()}` : "USD --";
      const goldText = gold
        ? `Gold ${Number(gold).toLocaleString()}`
        : "Gold --";

      this._label.set_text(`${usdText} | ${goldText}`);

      if (data.date) {
        this._lastUpdateItem.label.set_text(`Last updated: ${data.date}`);
      }
    }

    destroy() {
      this._session = null;
      super.destroy();
    }
  },
);

export default class BahaExtension extends Extension {
  enable() {
    this._indicator = new BahaIndicator();
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
