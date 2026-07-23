import St from "gi://St";
import Clutter from "gi://Clutter";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

export default class BahaExtension extends Extension {
  enable() {
    this._label = new St.Label({
      text: "Baha: Hello",
      y_align: Clutter.ActorAlign.CENTER,
    });
    Main.panel._rightBox.insert_child_at_index(this._label, 0);
  }

  disable() {
    this._label?.destroy();
    this._label = null;
  }
}
