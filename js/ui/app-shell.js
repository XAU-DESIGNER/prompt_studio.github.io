import { el, clear } from "./dom.js";
import { icon } from "./icons.js";
import { t, getLocale, setLocale, LOCALES, getDir } from "../i18n/i18n.js";
import { CATEGORIES } from "../templates/registry.js";
import { currentHash, navigate } from "./router.js";
import { appStore } from "../state/store.js";
import { writeJSON } from "../storage/storage.js";

const NAV_ICON = { home: "home", image: "image", text: "text", code: "code", saved: "saved", settings: "settings" };

function navItem({ hash, icon: iconName, label, active, sub }) {
  return el(
    "button",
    {
      type: "button",
      className: `nav-item${sub ? " nav-subitem" : ""}${active ? " is-active" : ""}`,
      on: { click: () => navigate(hash) },
    },
    [!sub ? el("span", { className: "nav-icon", html: icon(iconName) }) : null, el("span", { text: label })]
  );
}

function buildSidebarContent(hash) {
  const wrap = el("div", { className: "stack gap-lg" });

  wrap.appendChild(
    el("div", { className: "brand" }, [
      el("div", { className: "brand-mark", text: "P" }),
      el("div", { className: "brand-name", text: t("app.name") }),
    ])
  );

  const homeGroup = el("div", { className: "nav-group" }, [
    navItem({ hash: "#/home", icon: "home", label: t("nav.home"), active: hash === "#/home" }),
  ]);
  wrap.appendChild(homeGroup);

  for (const cat of CATEGORIES) {
    const group = el("div", { className: "nav-group" }, [
      el("div", { className: "nav-group-label", text: t(`nav.category.${cat.id}`) }),
    ]);
    for (const task of cat.tasks) {
      const taskHash = `#/${cat.id}/${task}`;
      group.appendChild(
        navItem({
          hash: taskHash,
          label: t(`nav.task.${cat.id}.${task}`),
          active: hash === taskHash,
          sub: true,
        })
      );
    }
    for (const task of cat.plannedTasks) {
      group.appendChild(
        el(
          "div",
          { className: "nav-item nav-subitem", style: "opacity:.45;cursor:default;" },
          [el("span", { text: `${t(`nav.task.${cat.id}.${task}`)} · ${t("nav.comingSoon")}` })]
        )
      );
    }
    wrap.appendChild(group);
  }

  wrap.appendChild(
    el("div", { className: "nav-group" }, [
      navItem({ hash: "#/saved", icon: "saved", label: t("nav.saved"), active: hash === "#/saved" }),
      navItem({ hash: "#/settings", icon: "settings", label: t("nav.settings"), active: hash === "#/settings" }),
    ])
  );

  wrap.appendChild(
    el("div", { className: "sidebar-footer" }, [
      el("strong", { text: t("sidebar.footerTitle") }),
      el("span", { className: "text-muted", text: t("sidebar.footerSub") }),
    ])
  );

  return wrap;
}

function buildLanguageSelect() {
  const select = el(
    "select",
    {
      className: "chip-select",
      "aria-label": t("settings.language"),
      style: "border:none;appearance:none;-webkit-appearance:none;",
      on: {
        change: (e) => setLocale(e.target.value),
      },
    },
    Object.entries(LOCALES).map(([code, meta]) => el("option", { value: code, text: meta.label }))
  );
  select.value = getLocale();
  return el("div", { className: "chip-select" }, [select]);
}

function buildThemeToggle() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  return el("button", {
    type: "button",
    className: "btn-icon",
    "aria-label": t("settings.theme"),
    html: icon(isLight ? "sun" : "moon"),
    on: {
      click: () => {
        const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        writeJSON("theme", next);
        appStore.set({ theme: next });
        renderShell(); // rebuild topbar icon
      },
    },
  });
}

let sidebarEl, topbarEl, mobileTopbarEl, mobileTabbarEl;

export function mountShell({ sidebar, topbar, mobileTopbar, mobileTabbar }) {
  sidebarEl = sidebar;
  topbarEl = topbar;
  mobileTopbarEl = mobileTopbar;
  mobileTabbarEl = mobileTabbar;
  renderShell();
}

export function renderShell() {
  const hash = currentHash();

  if (sidebarEl) {
    clear(sidebarEl);
    sidebarEl.appendChild(buildSidebarContent(hash));
  }

  if (topbarEl) {
    clear(topbarEl);
    topbarEl.appendChild(buildLanguageSelect());
    topbarEl.appendChild(buildThemeToggle());
  }

  if (mobileTopbarEl) {
    clear(mobileTopbarEl);
    mobileTopbarEl.appendChild(
      el("div", { className: "brand" }, [
        el("div", { className: "brand-mark", text: "P" }),
        el("div", { className: "brand-name", text: t("app.name") }),
      ])
    );
    const controls = el("div", { className: "row gap-sm" }, [buildLanguageSelect(), buildThemeToggle()]);
    mobileTopbarEl.appendChild(controls);
  }

  if (mobileTabbarEl) {
    clear(mobileTabbarEl);
    const tabs = [
      { hash: "#/home", icon: "home", label: t("nav.home") },
      { hash: "#/image/create", icon: "image", label: t("nav.category.image") },
      { hash: "#/saved", icon: "saved", label: t("nav.saved") },
      { hash: "#/settings", icon: "settings", label: t("nav.settings") },
    ];
    for (const tab of tabs) {
      const active = hash === tab.hash || (tab.hash === "#/image/create" && hash.startsWith("#/image"));
      mobileTabbarEl.appendChild(
        el(
          "button",
          {
            type: "button",
            className: `mobile-tab${active ? " is-active" : ""}`,
            on: { click: () => navigate(tab.hash) },
          },
          [el("span", { className: "nav-icon", html: icon(tab.icon) }), el("span", { text: tab.label })]
        )
      );
    }
  }
}