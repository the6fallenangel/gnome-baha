import St from "gi://St";
import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import Soup from "gi://Soup?version=3.0";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

const WORKER_URL = "https://baha-worker.the6fallenangels.workers.dev/latest";
const REFRESH_SECONDS = 120;

export default class BahaExtension extends Extension {
  enable() {
    this._label = new St.Label({
      text: "Baha: ...",
      y_align: Clutter.ActorAlign.CENTER,
    });
    Main.panel._rightBox.insert_child_at_index(this._label, 0);

    this._session = new Soup.Session();

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
    this._session = null;
    this._label?.destroy();
    this._label = null;
  }

  _fetchAndUpdate() {
    const message = Soup.Message.new("GET", WORKER_URL);

    this._session.send_and_read_async(
      message,
      GLib.PRIORITY_DEFAULT,
      null,
      (session, result) => {
        try {
          const bytes = session.send_and_read_finish(result);
          const text = new TextDecoder().decode(bytes.get_data());
          const json = JSON.parse(text);
          this._renderData(json);
        } catch (e) {
          this._label.set_text("Baha: error");
          logError(e, "Baha fetch failed");
        }
      },
    );
  }

  _renderData(json) {
    const data = json?.data;
    if (!data) {
      this._label.set_text("Baha: no data");
      return;
    }

    const usd = data.currency?.USD?.current;
    const gold18k = data.gold?.GOLD18K?.current;

    const usdText = usd ? `USD ${Number(usd).toLocaleString()}` : "USD --";
    const goldText = gold18k
      ? `18K ${Number(gold18k).toLocaleString()}`
      : "18K --";

    this._label.set_text(`${usdText} | ${goldText}`);
  }
}
