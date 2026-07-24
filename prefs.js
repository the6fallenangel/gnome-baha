import Adw from "gi://Adw";
import Gio from "gi://Gio";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class BahaPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup({ title: "Baha" });
    page.add(group);

    const infoRow = new Adw.ActionRow({
      title: "Symbols and language",
      subtitle:
        "Configure these from the panel popup menu directly — click the Baha indicator in the top bar.",
    });
    group.add(infoRow);

    const linkRow = new Adw.ActionRow({
      title: "Source code",
      subtitle: "github.com/the6fallenangel/gnome-baha",
      activatable: true,
    });
    linkRow.connect("activated", () => {
      Gio.AppInfo.launch_default_for_uri(
        "https://github.com/the6fallenangel/gnome-baha",
        null,
      );
    });
    group.add(linkRow);

    window.add(page);
  }
}
