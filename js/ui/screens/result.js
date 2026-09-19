import { el, mount } from "../dom.js";
import { icon } from "../icons.js";
import { t } from "../../i18n/i18n.js";
import { aspectRatioVisual, compositionVisual } from "../visuals.js";
import { saveGeneratedPrompt } from "../../state/saved-prompts.js";
import { navigate } from "../router.js";

/** The "Image → Create" flow keeps aspectRatio at config.aspectRatio, but
 *  "Image → Edit" namespaces it under the selected action's key (e.g.
 *  "change-ratio__aspectRatio") since a person can combine multiple
 *  actions. Look in both places so the preview badge stays accurate. */
function findAspectRatio(config) {
  if (config.aspectRatio) return config.aspectRatio;
  const key = Object.keys(config).find((k) => k.endsWith("__aspectRatio"));
  return key ? config[key] : null;
}

function showToast(message) {
  const toast = el("div", { className: "toast", html: `${icon("check")}<span></span>` });
  toast.querySelector("span").textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 250);
  }, 2200);
}

/**
 * Renders the "your prompt is ready" panel.
 * @param {HTMLElement} container
 * @param {{template:object, config:object, promptText:string, onBack:()=>void}} opts
 */
export function renderResultView(container, { template, config, promptText, onBack }) {
  const wrap = el("div", { className: "content-narrow" });

  wrap.appendChild(
    el("div", { className: "row gap-sm", style: "margin-bottom:18px;" }, [
      el("button", { type: "button", className: "btn btn-ghost", on: { click: onBack } }, [
        el("span", { className: "icon-directional", html: icon("back") }),
        el("span", { text: t("wizard.back") }),
      ]),
    ])
  );

  const grid = el("div", { className: "result-grid" });

  // Prompt text panel
  const promptPanel = el("div", { className: "prompt-panel" }, [
    el("h2", { className: "section-title", text: t("result.title") }),
    el("p", { className: "text-muted", style: "font-size:13px;margin-bottom:14px;", text: t("result.subtitle") }),
    el("div", { className: "prompt-text", text: promptText || t("result.empty") }),
    el("div", { className: "row gap-sm" }, [
      el(
        "button",
        {
          type: "button",
          className: "btn btn-primary",
          on: {
            click: async () => {
              try {
                await navigator.clipboard.writeText(promptText);
              } catch {
                /* clipboard API may be unavailable; fall back silently */
              }
              showToast(t("result.copied"));
            },
          },
        },
        [el("span", { html: icon("copy") }), el("span", { text: t("result.copyPrompt") })]
      ),
      el(
        "button",
        {
          type: "button",
          className: "btn btn-secondary",
          on: {
            click: () => {
              saveGeneratedPrompt({
                category: template.category,
                task: template.task,
                title: config.subject || "",
                promptText,
                aspectRatio: findAspectRatio(config),
              });
              showToast(t("result.saved"));
            },
          },
        },
        [el("span", { html: icon("save") }), el("span", { text: t("result.save") })]
      ),
    ]),
    el("p", { className: "text-faint", style: "font-size:12px;margin-top:14px;", text: t("result.tip") }),
  ]);

  // Visual preview card — an illustrative diagram of the chosen framing,
  // not a rendered image (this tool has no image-generation backend).
  const aspectRatio = findAspectRatio(config);
  const previewSvg = config.composition
    ? compositionVisual(config.composition)
    : aspectRatioVisual(aspectRatio || "1:1");

  const previewCard = el("div", { className: "preview-card" }, [
    el("div", { className: "preview-visual", html: previewSvg }),
    el("div", { className: "preview-meta" }, [
      el("span", { text: t("result.previewLabel") }),
      el("span", { className: "badge", text: aspectRatio || "1:1" }),
    ]),
  ]);

  grid.appendChild(promptPanel);
  grid.appendChild(previewCard);
  wrap.appendChild(grid);

  mount(container, wrap);
}

export { showToast };