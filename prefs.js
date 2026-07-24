import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

const STRINGS = {
  en: {
    pageTitle: "Baha",
    generalGroup: "General",
    intervalTitle: "Refresh interval",
    intervalSubtitle: "How often to fetch new rates (minimum 3 minutes)",
    gapTitle: "Marquee gap",
    gapSubtitle: "Space between repeated text when scrolling",
    speedTitle: "Marquee speed",
    separatorTitle: "Separator",
    separatorSubtitle: "Character shown between symbols in the panel",
    trendTitle: "Show trend arrow in panel",
    trendSubtitle:
      "Display ▲/▼ next to values in the top bar, not just in the menu",
    aboutGroup: "About",
    aboutRow: "Symbols and language",
    aboutSubtitle: "Configure these from the panel popup menu directly.",
    sourceRow: "Source code on github",
  },
  fa: {
    pageTitle: "بها",
    generalGroup: "تنظیمات عمومی",
    intervalTitle: "فاصله بروزرسانی",
    intervalSubtitle: "هر چند وقت یک‌بار نرخ‌ها بروزرسانی شوند (حداقل ۳ دقیقه)",
    gapTitle: "فاصله بین تکرار متن",
    gapSubtitle: "فاصله بین تکرار متن هنگام اسکرول",
    speedTitle: "سرعت اسکرول",
    separatorTitle: "جداکننده",
    separatorSubtitle: "کاراکتری که بین نمادها در نوار بالا نمایش داده می‌شود",
    trendTitle: "نمایش فلش تغییرات در نوار بالا",
    trendSubtitle: "نمایش ▲/▼ کنار مقادیر در تاپ‌بار، نه فقط در منو",
    aboutGroup: "درباره",
    aboutRow: "نمادها و زبان",
    aboutSubtitle: "مستقیماً از منوی پاپ‌آپ پنل تنظیم کنید.",
    sourceRow: "کد منبع در گیتهاب",
  },
};

export default class BahaPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();
    const lang = settings.get_string("language") === "fa" ? "fa" : "en";
    const t = STRINGS[lang];

    if (lang === "fa") {
      Gtk.Widget.set_default_direction(Gtk.TextDirection.RTL);
    }

    const page = new Adw.PreferencesPage({ title: t.pageTitle });
    window.add(page);

    const generalGroup = new Adw.PreferencesGroup({ title: t.generalGroup });
    page.add(generalGroup);

    generalGroup.add(
      this._buildIntCombo(
        settings,
        "refresh-interval-minutes",
        t.intervalTitle,
        t.intervalSubtitle,
        [
          { value: 3, label: lang === "fa" ? "۳ دقیقه" : "3 minutes" },
          { value: 5, label: lang === "fa" ? "۵ دقیقه" : "5 minutes" },
          { value: 10, label: lang === "fa" ? "۱۰ دقیقه" : "10 minutes" },
          { value: 15, label: lang === "fa" ? "۱۵ دقیقه" : "15 minutes" },
          { value: 30, label: lang === "fa" ? "۳۰ دقیقه" : "30 minutes" },
        ],
      ),
    );

    generalGroup.add(
      this._buildIntCombo(settings, "marquee-gap", t.gapTitle, t.gapSubtitle, [
        { value: 20, label: "20px" },
        { value: 40, label: "40px" },
        { value: 60, label: "60px" },
        { value: 80, label: "80px" },
      ]),
    );

    generalGroup.add(
      this._buildStringCombo(settings, "marquee-speed", t.speedTitle, null, [
        { value: "slow", label: lang === "fa" ? "آهسته" : "Slow" },
        { value: "medium", label: lang === "fa" ? "متوسط" : "Medium" },
        { value: "fast", label: lang === "fa" ? "سریع" : "Fast" },
      ]),
    );

    generalGroup.add(
      this._buildStringCombo(
        settings,
        "separator",
        t.separatorTitle,
        t.separatorSubtitle,
        [
          { value: "|", label: "|" },
          { value: "•", label: "•" },
          { value: "-", label: "-" },
          { value: "/", label: "/" },
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
