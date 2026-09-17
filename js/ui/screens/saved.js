import { el, mount } from "../dom.js";
import { icon } from "../icons.js";
import { t } from "../../i18n/i18n.js";
import { listSavedPrompts, deleteSavedPrompt } from "../../state/saved-prompts.js";
import { showToast } from "./result.js";

const CATEGORY_ICON = { image: "image", text: "text", code: "code" };
const ACCENT_CLASS = { image: "accent-image", text: "accent-text", code: "accent-code" };

function formatRelativeTime(iso, t) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return t("saved.justNow");
  if (mins < 60) return t("saved.minutesAgo", { count: mins });
  const hours = Math.round(mins / 60);
  if (hours < 24) return t("saved.hoursAgo", { count: hours });
  const days = Math.round(hours / 24);
  return t("saved.daysAgo", { count: days });
}

export function renderSaved(container) {
  const wrap = el("div", { className: "content-narrow" });
  wrap.appendChild(el("h1", { className: "text-display", style: "font-size:22px;margin-bottom:18px;", text: t("saved.title") }));

  const prompts = listSavedPrompts();

  if (!prompts.length) {
    wrap.appendChild(
      el("div", { className: "empty-state" }, [
        el("div", { html: icon("saved") }),
        el("p", { text: t("saved.emptyTitle") }),
        el("p", { className: "text-faint", text: t("saved.emptySub") }),
      ])
    );
    mount(container, wrap);
    return;
  }

  const list = el("div", { className: "stack gap-sm" });

  function refresh() {
    render();
  }

  function render() {
    list.innerHTML = "";
    for (const p of listSavedPrompts()) {
      list.appendChild(
        el("div", { className: "saved-item" }, [
          el("div", {
            className: `saved-item-icon ${ACCENT_CLASS[p.category] || "accent-image"}`,
            html: icon(CATEGORY_ICON[p.category] || "image"),
          }),
          el("div", { className: "saved-item-text" }, [
            el("div", { className: "saved-item-title", text: p.title }),
            el("div", {
              className: "saved-item-sub",
              text: `${t(`nav.category.${p.category}`)} · ${p.aspectRatio || "—"} · ${formatRelativeTime(p.createdAt, t)}`,
            }),
          ]),
          el(
            "button",
            {
              type: "button",
              className: "btn-icon",
              "aria-label": t("result.copyPrompt"),
              html: icon("copy"),
              on: {
                click: async () => {
                  try {
                    await navigator.clipboard.writeText(p.promptText);
                  } catch {
                    /* ignore */
                  }
                  showToast(t("result.copied"));
                },
              },
            },
            []
          ),
          el(
            "button",
            {
              type: "button",
              className: "btn-icon",
              "aria-label": t("saved.delete"),
              html: icon("trash"),
              on: {
                click: () => {
                  deleteSavedPrompt(p.id);
                  refresh();
                },
              },
            },
            []
          ),
        ])
      );
    }
  }

  render();
  wrap.appendChild(list);
  mount(container, wrap);
}