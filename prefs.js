import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import { PREFS_STRINGS } from "./constants.js";

export default class BahaPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();
    const lang = settings.get_string("language") === "fa" ? "fa" : "en";
    const t = PREFS_STRINGS[lang];

    if (lang === "fa") {
      Gtk.Widget.set_default_direction(Gtk.TextDirection.RTL);
    }

    const page = new Adw.PreferencesPage({ title: t.pageTitle });
    window.add(page);

    const generalGroup = new Adw.PreferencesGroup({ title: t.generalGroup });
    page.add(generalGroup);

    generalGroup.add(this._buildLanguageSelector(settings, lang));

    generalGroup.add(
      this._buildIntCombo(
        settings,
        "refresh-interval-minutes",
        t.intervalTitle,
        t.intervalSubtitle,
        [
          { value: 3, label: t.minutes3 },
          { value: 5, label: t.minutes5 },
          { value: 10, label: t.minutes10 },
          { value: 15, label: t.minutes15 },
          { value: 30, label: t.minutes30 },
          { value: 60, label: t.hour1 },
        ],
      ),
    );

    generalGroup.add(
      this._buildStringCombo(
        settings,
        "marquee-gap-style",
        t.gapTitle,
        t.gapSubtitle,
        [
          { value: "space", label: t.blankSpace },
          { value: "dot", label: t.dot },
          { value: "dash", label: t.dash },
          { value: "star", label: t.star },
          { value: "diamond", label: t.diamond },
        ],
      ),
    );

    generalGroup.add(
      this._buildStringCombo(settings, "marquee-speed", t.speedTitle, null, [
        { value: "slow", label: t.slow },
        { value: "medium", label: t.medium },
        { value: "fast", label: t.fast },
      ]),
    );

    generalGroup.add(
      this._buildStringCombo(
        settings,
        "separator",
        t.separatorTitle,
        t.separatorSubtitle,
        [
          { value: "|", label: t.pipe },
          { value: "•", label: t.dot },
          { value: "·", label: t.middleDot },
          { value: "-", label: t.dashSymbol },
          { value: "/", label: t.slash },
          { value: " ", label: t.space },
        ],
      ),
    );

    const trendRow = new Adw.SwitchRow({
      title: t.trendTitle,
      subtitle: t.trendSubtitle,
      active: settings.get_boolean("show-trend-in-panel"),
    });
    trendRow.connect("notify::active", () => {
      settings.set_boolean("show-trend-in-panel", trendRow.active);
    });
    generalGroup.add(trendRow);

    const lastUpdatedRow = new Adw.SwitchRow({
      title: t.lastUpdatedTitle,
      subtitle: t.lastUpdatedSubtitle,
      active: settings.get_boolean("show-last-updated"),
    });
    lastUpdatedRow.connect("notify::active", () => {
      settings.set_boolean("show-last-updated", lastUpdatedRow.active);
    });
    generalGroup.add(lastUpdatedRow);

    const aboutGroup = new Adw.PreferencesGroup({ title: t.aboutGroup });
    page.add(aboutGroup);

    aboutGroup.add(
      new Adw.ActionRow({ title: t.aboutRow, subtitle: t.aboutSubtitle }),
    );

    const sourceRow = new Adw.ActionRow({
      title: t.sourceRow,
      subtitle: "github.com/the6fallenangel/gnome-baha",
      activatable: true,
    });
    sourceRow.connect("activated", () => {
      Gio.AppInfo.launch_default_for_uri(
        "https://github.com/the6fallenangel/gnome-baha",
        null,
      );
    });
    aboutGroup.add(sourceRow);
  }

  _buildLanguageSelector(settings, currentLang) {
    const model = Gtk.StringList.new(["English", "فارسی"]);
    const row = new Adw.ComboRow({
      title: PREFS_STRINGS[currentLang].languageTitle,
      subtitle: PREFS_STRINGS[currentLang].languageSubtitle,
      model,
    });

    row.selected = currentLang === "fa" ? 1 : 0;

    row.connect("notify::selected", () => {
      const newLang = row.selected === 1 ? "fa" : "en";
      settings.set_string("language", newLang);

      const window = row.get_ancestor(Gtk.Window);
      const toast = new Adw.Toast({
        title: PREFS_STRINGS[newLang].languageChanged,
        timeout: 3,
      });
      window.add_toast(toast);
    });

    return row;
  }

  _buildIntCombo(settings, key, title, subtitle, choices) {
    const model = new Gtk.StringList();
    choices.forEach((c) => model.append(c.label));

    const row = new Adw.ComboRow({ title, subtitle, model });

    const currentValue = settings.get_int(key);
    const currentIndex = choices.findIndex((c) => c.value === currentValue);
    row.selected = currentIndex >= 0 ? currentIndex : 0;

    row.connect("notify::selected", () => {
      settings.set_int(key, choices[row.selected].value);
    });

    return row;
  }

  _buildStringCombo(settings, key, title, subtitle, choices) {
    const model = new Gtk.StringList();
    choices.forEach((c) => model.append(c.label));

    const row = new Adw.ComboRow({ title, subtitle, model });

    const currentValue = settings.get_string(key);
    const currentIndex = choices.findIndex((c) => c.value === currentValue);
    row.selected = currentIndex >= 0 ? currentIndex : 0;

    row.connect("notify::selected", () => {
      settings.set_string(key, choices[row.selected].value);
    });

    return row;
  }
}
