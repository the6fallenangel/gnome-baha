import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import Soup from "gi://Soup?version=3.0";
import GLib from "gi://GLib";
import BahaIndicator from "./indicator.js";
import { WORKER_URL } from "./constants.js";

export default class BahaExtension extends Extension {
  enable() {
    this._settings = this.getSettings();
    this._indicator = new BahaIndicator(this._settings, this);
    Main.panel.addToStatusArea("baha-indicator", this._indicator);

    const cached = this._getCache();
    if (cached) {
      this._indicator.setData(cached, false);
    }

    this._fetchAndUpdate();
    this._scheduleRefresh();

    this._intervalChangedId = this._settings.connect(
      "changed::refresh-interval-minutes",
      () => this._scheduleRefresh(),
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

  _scheduleRefresh() {
    if (this._timeoutId) {
      GLib.source_remove(this._timeoutId);
      this._timeoutId = null;
    }

    const minutes = this._settings.get_int("refresh-interval-minutes");
    let seconds = minutes * 60;

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

  _getCache() {
    const cached = this._settings.get_string("cached-data");
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
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

          this._settings.set_string("cached-data", text);
          this._indicator.setData(json, false);
        } catch (e) {
          const cached = this._getCache();
          if (cached) {
            this._indicator.setData(cached, false);
          } else {
            this._indicator.setData(null, true);
          }
        }
      },
    );
  }
}
