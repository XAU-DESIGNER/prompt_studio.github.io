import { el, mount } from "../dom.js";
import { t, getLocale, setLocale, LOCALES } from "../../i18n/i18n.js";
import { exportAll, importAll, writeJSON } from "../../storage/storage.js";
import { appStore } from "../../state/store.js";
import { renderShell } from "../app-shell.js";
import { showToast } from "./result.js";

function segmented(options, activeValue, onChange) {
  return el(
    "div",
    { className: "segmented" },
    options.map((opt) =>
      el(
        "button",
        {
          type: "button",
          className: opt.value === activeValue ? "is-active" : "",
          on: { click: () => onChange(opt.value) },
        },
        opt.label
      )
    )
  );
}

export function renderSettings(container) {
  const wrap = el("div", { className: "content-narrow" });
  wrap.appendChild(el("h1", { className: "text-display", style: "font-size:22px;margin-bottom:8px;", text: t("settings.title") }));

  const panel = el("div", { style: "background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:8px 20px;" });

  // Language
  panel.appendChild(
    el("div", { className: "settings-row" }, [
      el("div", {}, [el("div", { className: "settings-label", text: t("settings.language") })]),
      segmented(
        Object.entries(LOCALES).map(([code, meta]) => ({ value: code, label: meta.label })),
        getLocale(),
        async (value) => {
          await setLocale(value);
          renderShell();
          renderSettings(container);
        }
      ),
    ])
  );

  // Theme
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  panel.appendChild(
    el("div", { className: "settings-row" }, [
      el("div", {}, [el("div", { className: "settings-label", text: t("settings.theme") })]),
      segmented(
        [
          { value: "dark", label: t("settings.themeDark") },
          { value: "light", label: t("settings.themeLight") },
        ],
        currentTheme,
        (value) => {
          document.documentElement.setAttribute("data-theme", value);
          writeJSON("theme", value);
          appStore.set({ theme: value });
          renderShell();
          renderSettings(container);
        }
      ),
    ])
  );

  // Export
  panel.appendChild(
    el("div", { className: "settings-row" }, [
      el("div", {}, [
        el("div", { className: "settings-label", text: t("settings.exportTitle") }),
        el("div", { className: "settings-sub", text: t("settings.exportSub") }),
      ]),
      el(
        "button",
        {
          type: "button",
          className: "btn btn-secondary",
          on: {
            click: () => {
              const bundle = exportAll();
              const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "prompt-studio-pro-export.json";
              a.click();
              URL.revokeObjectURL(url);
            },
          },
        },
        t("settings.exportButton")
      ),
    ])
  );

  // Import
  const fileInput = el("input", { type: "file", accept: "application/json", style: "display:none" });
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      importAll(JSON.parse(text));
      showToast(t("settings.importSuccess"));
    } catch (err) {
      showToast(t("settings.importError"));
    }
  });
  panel.appendChild(
    el("div", { className: "settings-row" }, [
      el("div", {}, [
        el("div", { className: "settings-label", text: t("settings.importTitle") }),
        el("div", { className: "settings-sub", text: t("settings.importSub") }),
      ]),
      el(
        "button",
        { type: "button", className: "btn btn-secondary", on: { click: () => fileInput.click() } },
        t("settings.importButton")
      ),
    ])
  );
  panel.appendChild(fileInput);

  // About
  panel.appendChild(
    el("div", { className: "settings-row" }, [
      el("div", {}, [
        el("div", { className: "settings-label", text: t("app.name") }),
        el("div", { className: "settings-sub", text: t("settings.version") }),
      ]),
    ])
  );

  wrap.appendChild(panel);
  mount(container, wrap);
}