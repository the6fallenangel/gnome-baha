import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import GLib from "gi://GLib";
import Soup from "gi://Soup";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import { PREFS_STRINGS, WORKER_URL, NERKH_DIRECT_URL } from "./constants.js";

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
      this._buildStringCombo(
        settings,
        "currency-display",
        t.currencyDisplayTitle,
        t.currencyDisplaySubtitle,
        [
          { value: "toman", label: t.toman },
          { value: "usd", label: t.dollar },
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

    const dataSourceGroup = new Adw.PreferencesGroup({
      title: t.dataSourceGroup,
      description: t.quotaWarning,
    });
    page.add(dataSourceGroup);

    const sourceChoices = [
      { value: "worker", label: t.workerOption },
      { value: "direct", label: t.directOption },
      { value: "custom-worker", label: t.customWorkerOption },
    ];
    const dataSourceRow = this._buildStringCombo(
      settings,
      "api-source",
      t.dataSourceTitle,
      t.dataSourceSubtitle,
      sourceChoices,
    );
    dataSourceGroup.add(dataSourceRow);

    const apiKeyRow = new Adw.EntryRow({
      title: t.apiKeyTitle,
      text: settings.get_string("nerkh-api-key"),
      show_apply_button: true,
    });
    apiKeyRow.set_input_purpose(Gtk.InputPurpose.PASSWORD);
    dataSourceGroup.add(apiKeyRow);

    const customWorkerRow = new Adw.EntryRow({
      title: t.customWorkerUrlTitle,
      text: settings.get_string("custom-worker-url"),
      show_apply_button: true,
    });
    dataSourceGroup.add(customWorkerRow);

    const quotaInfoRow = new Adw.ActionRow({
      title: t.directQuotaWarning,
      subtitle: t.apiKeySubtitle,
    });
    quotaInfoRow.add_css_class("boxed-list");
    dataSourceGroup.add(quotaInfoRow);

    const getKeyRow = new Adw.ActionRow({
      title: t.getFreeKeyLabel,
      subtitle: "cp.nerkh.io",
      activatable: true,
    });
    getKeyRow.add_suffix(new Gtk.Image({ icon_name: "external-link-symbolic" }));
    getKeyRow.connect("activated", () => {
      Gio.AppInfo.launch_default_for_uri("https://cp.nerkh.io", null);
    });
    dataSourceGroup.add(getKeyRow);

    const testRow = new Adw.ActionRow({
      title: t.testConnectionLabel,
      subtitle: t.testConnectionSubtitle,
      activatable: true,
    });
    const testSpinner = new Gtk.Spinner({ visible: false });
    const testIcon = new Gtk.Image({ icon_name: "emblem-ok-symbolic", visible: false });
    testRow.add_suffix(testSpinner);
    testRow.add_suffix(testIcon);
    testRow.add_suffix(new Gtk.Image({ icon_name: "system-run-symbolic" }));
    dataSourceGroup.add(testRow);

    const applyApiKey = () => {
      settings.set_string("nerkh-api-key", apiKeyRow.text.trim());
    };
    apiKeyRow.connect("apply", applyApiKey);
    apiKeyRow.connect("entry-activated", applyApiKey);

    const applyWorkerUrl = () => {
      settings.set_string("custom-worker-url", customWorkerRow.text.trim());
    };
    customWorkerRow.connect("apply", applyWorkerUrl);
    customWorkerRow.connect("entry-activated", applyWorkerUrl);

    apiKeyRow.connect("notify::text", () => {});

    const updateVisibility = () => {
      const src = settings.get_string("api-source");
      apiKeyRow.visible = src === "direct";
      customWorkerRow.visible = src === "custom-worker";
      quotaInfoRow.visible = src === "direct";
      getKeyRow.visible = src === "direct";
      if (src === "worker") {
        testRow.subtitle = `${WORKER_URL}`;
      } else if (src === "direct") {
        testRow.subtitle = NERKH_DIRECT_URL;
      } else {
        const url = settings.get_string("custom-worker-url") || "https://...";
        testRow.subtitle = url;
      }
    };
    updateVisibility();
    dataSourceRow.connect("notify::selected", updateVisibility);
    settings.connect("changed::api-source", updateVisibility);
    settings.connect("changed::custom-worker-url", updateVisibility);

    testRow.connect("activated", () => {
      const src = settings.get_string("api-source");
      let url = WORKER_URL;
      let apiKey = "";
      if (src === "direct") {
        url = NERKH_DIRECT_URL;
        apiKey = apiKeyRow.text.trim() || settings.get_string("nerkh-api-key").trim();
        if (!apiKey) {
          const win = testRow.get_ancestor(Gtk.Window);
          win.add_toast(new Adw.Toast({ title: t.apiKeyEmptyWarning, timeout: 3 }));
          return;
        }
      } else if (src === "custom-worker") {
        url = customWorkerRow.text.trim() || settings.get_string("custom-worker-url").trim();
        if (!url) {
          const win = testRow.get_ancestor(Gtk.Window);
          win.add_toast(new Adw.Toast({ title: t.customWorkerEmptyWarning, timeout: 3 }));
          return;
        }
      }

      testSpinner.visible = true;
      testSpinner.start();
      testIcon.visible = false;
      testRow.sensitive = false;

      const session = new Soup.Session();
      const msg = Soup.Message.new("GET", url);
      if (src === "direct" && apiKey) {
        msg.request_headers.append("Authorization", `Bearer ${apiKey}`);
      }

      session.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null, (s, res) => {
        testSpinner.stop();
        testSpinner.visible = false;
        testRow.sensitive = true;
        let bytes;
        try {
          bytes = s.send_and_read_finish(res);
        } catch (e) {
          console.error(e);
          const win = testRow.get_ancestor(Gtk.Window);
          win.add_toast(new Adw.Toast({ title: `${t.connectionFailed}: ${e.message}`, timeout: 4 }));
          return;
        }
        const status = msg.get_status();
        const win = testRow.get_ancestor(Gtk.Window);
        if (status === 460) {
          win.add_toast(new Adw.Toast({ title: t.quotaExceededMsg, timeout: 4 }));
          return;
        }
        if (status >= 200 && status < 300 && bytes) {
          const text = new TextDecoder().decode(bytes.get_data());
          let json;
          try {
            json = JSON.parse(text);
          } catch (e) {
            console.error(e);
            win.add_toast(new Adw.Toast({ title: `${t.connectionFailed}: Invalid JSON`, timeout: 4 }));
            return;
          }
          if (json && (json.data || json.code === 460)) {
            if (json.code === 460) {
              win.add_toast(new Adw.Toast({ title: t.quotaExceededMsg, timeout: 4 }));
            } else {
              testIcon.visible = true;
              win.add_toast(new Adw.Toast({ title: t.connectionSuccess, timeout: 3 }));
              GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
                testIcon.visible = false;
                return GLib.SOURCE_REMOVE;
              });
            }
          } else if (json && json.error) {
            win.add_toast(new Adw.Toast({ title: `${t.connectionFailed}: ${json.error}`, timeout: 4 }));
          } else {
            testIcon.visible = true;
            win.add_toast(new Adw.Toast({ title: t.connectionSuccess, timeout: 3 }));
          }
        } else {
          const win2 = testRow.get_ancestor(Gtk.Window);
          win2.add_toast(new Adw.Toast({ title: `${t.connectionFailed} (HTTP ${status})`, timeout: 4 }));
        }
      });
    });

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

    const supportRow = new Adw.ActionRow({
      title: t.supportRow,
      subtitle: "the6fallenangel.github.io/support/",
      activatable: true,
    });
    supportRow.connect("activated", () => {
      Gio.AppInfo.launch_default_for_uri(
        "https://the6fallenangel.github.io/support/",
        null,
      );
    });
    aboutGroup.add(supportRow);
  }

  _buildLanguageSelector(settings, currentLang) {
    const model = Gtk.StringList.new(["English", "پارسی"]);
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
    let currentIndex = choices.findIndex((c) => c.value === currentValue);
    if (currentIndex < 0) {
      currentIndex = 0;
      settings.set_int(key, choices[0].value);
    }
    row.selected = currentIndex;

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
