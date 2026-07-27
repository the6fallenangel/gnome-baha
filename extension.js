import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import GLib from "gi://GLib";
import BahaIndicator from "./indicator.js";

export default class BahaExtension extends Extension {
  enable() {
    this._settings = this.getSettings();
    this._indicator = new BahaIndicator(this._settings, this);
    Main.panel.addToStatusArea("baha-indicator", this._indicator);

    this._indicator.loadCachedData();
    this._indicator.fetchAndUpdate();
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
        this._indicator.fetchAndUpdate();
        return GLib.SOURCE_CONTINUE;
      },
    );
  }
}
