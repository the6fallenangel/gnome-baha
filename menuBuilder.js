import St from "gi://St";
import Gio from "gi://Gio";
import Clutter from "gi://Clutter";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import { LANGUAGES, SYMBOL_GROUPS } from "./constants.js";
import { getItemKeyAndLabels } from "./utils.js";

export class MenuBuilder {
  constructor(settings, extension, symbolWidgetsByKey) {
    this._settings = settings;
    this._extension = extension;
    this._symbolWidgetsByKey = symbolWidgetsByKey;
    this._symbolGroups = [];
    this._symbolItems = [];
    this._langItems = {};
    this._langSubMenu = null;
    this._lastUpdateItem = null;
  }

  build(menu) {
    const lang = this._getLang();
    this._buildSymbolGroups(menu, lang);
    this._buildSeparator(menu);
    this._buildLanguageMenu(menu, lang);
    this._buildSeparator(menu);
    this._buildLastUpdateItem(menu, lang);
    this._buildFooter(menu);
  }

  _buildSymbolGroups(menu, lang) {
    for (const group of SYMBOL_GROUPS) {
      const submenu = new PopupMenu.PopupSubMenuMenuItem(group.labels[lang]);
      this._symbolGroups.push({ menu: submenu, group });

      for (const item of group.items) {
        const { key, labels } = getItemKeyAndLabels(item);
        const menuItem = this._createMenuItem(key, labels, lang);
        this._symbolItems.push({ item: menuItem, labels, key });
        submenu.menu.addMenuItem(menuItem);
      }

      menu.addMenuItem(submenu);
    }
  }

  _createMenuItem(key, labels, lang) {
    const menuItem = new PopupMenu.PopupMenuItem(labels[lang]);
    menuItem.label.x_expand = true;
    menuItem.setOrnament(
      this._settings.get_boolean(key)
        ? PopupMenu.Ornament.CHECK
        : PopupMenu.Ornament.NONE,
    );

    const valueLabel = new St.Label({
      text: "",
      y_align: Clutter.ActorAlign.CENTER,
      style_class: "baha-item-value",
    });
    const arrowLabel = new St.Label({
      text: "",
      y_align: Clutter.ActorAlign.CENTER,
      style_class: "baha-item-arrow",
    });
    menuItem.add_child(valueLabel);
    menuItem.add_child(arrowLabel);

    this._symbolWidgetsByKey.set(key, { valueLabel, arrowLabel });

    menuItem.activate = () => {
      const newState = !this._settings.get_boolean(key);
      this._settings.set_boolean(key, newState);
      menuItem.setOrnament(
        newState ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE,
      );
    };

    return menuItem;
  }

  _buildLanguageMenu(menu, lang) {
    const label = lang === "en" ? "Language" : "زبان";
    this._langSubMenu = new PopupMenu.PopupSubMenuMenuItem(label);
    this._langSubMenuLabels = { en: "Language", fa: "زبان" };

    for (const [code, labelText] of LANGUAGES) {
      const langItem = new PopupMenu.PopupMenuItem(labelText);
      langItem.activate = () => {
        this._settings.set_string("language", code);
      };
      this._langSubMenu.menu.addMenuItem(langItem);
      this._langItems[code] = langItem;
    }

    menu.addMenuItem(this._langSubMenu);
    this._updateLanguageOrnaments();
  }

  _buildLastUpdateItem(menu, lang) {
    const text = lang === "en" ? "Last updated: --" : "آخرین بروزرسانی";
    this._lastUpdateItem = new PopupMenu.PopupMenuItem(text, {
      reactive: false,
    });
    this._lastUpdateItem.visible =
      this._settings.get_boolean("show-last-updated");
    menu.addMenuItem(this._lastUpdateItem);
  }

  _buildFooter(menu) {
    const footerRow = new PopupMenu.PopupBaseMenuItem({
      reactive: false,
      can_focus: false,
    });

    const leftSpacer = new St.Widget({ x_expand: true });
    const midSpacer = new St.Widget({ x_expand: true });
    const rightSpacer = new St.Widget({ x_expand: true });

    const settingsButton = new St.Button({
      style_class: "baha-footer-button",
      child: new St.Icon({
        icon_name: "preferences-system-symbolic",
        icon_size: 16,
      }),
    });
    settingsButton.connect("clicked", () => {
      this._extension.openPreferences();
      menu.close();
    });

    const githubButton = new St.Button({
      style_class: "baha-footer-button",
      child: new St.Icon({
        icon_name: "web-browser-symbolic",
        icon_size: 16,
      }),
    });
    githubButton.connect("clicked", () => {
      Gio.AppInfo.launch_default_for_uri(
        "https://github.com/the6fallenangel/gnome-baha",
        null,
      );
      menu.close();
    });

    footerRow.add_child(leftSpacer);
    footerRow.add_child(settingsButton);
    footerRow.add_child(midSpacer);
    footerRow.add_child(githubButton);
    footerRow.add_child(rightSpacer);
    menu.addMenuItem(footerRow);
  }

  _buildSeparator(menu) {
    menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
  }

  _getLang() {
    return this._settings.get_string("language");
  }

  _updateLanguageOrnaments() {
    const current = this._getLang();
    for (const [code, item] of Object.entries(this._langItems)) {
      item.setOrnament(
        code === current ? PopupMenu.Ornament.DOT : PopupMenu.Ornament.NONE,
      );
    }
  }

  updateLanguage() {
    const lang = this._getLang();

    for (const { menu, group } of this._symbolGroups) {
      menu.label.text = group.labels[lang];
    }

    for (const { item, labels } of this._symbolItems) {
      item.label.text = labels[lang];
    }

    this._langSubMenu.label.text = this._langSubMenuLabels[lang];
    this._updateLanguageOrnaments();
  }

  getLastUpdateItem() {
    return this._lastUpdateItem;
  }
}
