import { el } from "../dom.js";
import { icon } from "../icons.js";
import { visualFor } from "../visuals.js";

const ACCENT_COLORS = {
  image: ["var(--accent-image)", "var(--accent-image-2)"],
  text: ["var(--accent-text)", "var(--accent-text-2)"],
  code: ["var(--accent-code)", "var(--accent-code-2)"],
};

function checkBadge() {
  return el("span", { className: "option-card-check", html: icon("check") });
}

function rowCheckBadge() {
  return el("span", { className: "option-row-check", html: icon("check") });
}

/**
 * Render an option-picker for one wizard step.
 * @param {object} step - step definition (see templates/*)
 * @param {object} config - current PromptConfiguration
 * @param {(t:string)=>string} t - translator
 * @param {(value:string)=>void} onSelect
 * @param {string} accent - category accent id ("image" | "text" | "code")
 */
export function renderOptionPicker(step, config, t, onSelect, accent = "image") {
  if (step.kind === "icon-list") {
    return renderIconList(step, config, t, onSelect, accent);
  }
  // visual-grid and icon-grid share the same card layout; only the
  // contents of the "visual" box differ.
  return renderGrid(step, config, t, onSelect, accent);
}

function renderGrid(step, config, t, onSelect, accent) {
  const selected = config[step.id];
  const grid = el("div", { className: "option-grid" });

  for (const optionId of step.options) {
    const isSelected = selected === optionId;
    const visualHtml =
      step.kind === "visual-grid" ? visualFor(step.visual, optionId) : renderIconGlyph(step.icon, accent);

    const label = t(`optionValues.${step.id}.${optionId}.label`);
    const sub = t(`optionValues.${step.id}.${optionId}.sub`);

    const card = el(
      "button",
      {
        type: "button",
        className: `option-card${isSelected ? " is-selected" : ""}`,
        "aria-pressed": String(isSelected),
        on: { click: () => onSelect(optionId) },
      },
      [
        el("div", { className: "option-card-visual", html: visualHtml }),
        el("span", { className: "option-card-label", text: label }),
        sub && sub !== `optionValues.${step.id}.${optionId}.sub`
          ? el("span", { className: "option-card-sub", text: sub })
          : null,
        checkBadge(),
      ]
    );
    grid.appendChild(card);
  }
  return grid;
}

function renderIconGlyph(iconName, accent) {
  const [c1, c2] = ACCENT_COLORS[accent] || ACCENT_COLORS.image;
  return `<div style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg, ${c1}, ${c2});color:white;">${icon(
    iconName
  )}</div>`;
}

function renderIconList(step, config, t, onSelect, accent) {
  const selected = config[step.id];
  const list = el("div", { className: "option-list" });
  const [c1, c2] = ACCENT_COLORS[accent] || ACCENT_COLORS.image;

  for (const opt of step.options) {
    const optionId = typeof opt === "string" ? opt : opt.id;
    const iconName = typeof opt === "string" ? "sparkle" : opt.icon;
    const isSelected = selected === optionId;
    const label = t(`optionValues.${step.id}.${optionId}.label`);
    const sub = t(`optionValues.${step.id}.${optionId}.sub`);

    const row = el(
      "button",
      {
        type: "button",
        className: `option-row${isSelected ? " is-selected" : ""}`,
        "aria-pressed": String(isSelected),
        on: { click: () => onSelect(optionId) },
      },
      [
        el("span", {
          className: "option-row-icon",
          style: `background:linear-gradient(135deg, ${c1}, ${c2})`,
          html: icon(iconName),
        }),
        el("span", { className: "option-row-text" }, [
          el("span", { className: "option-row-title", text: label }),
          el("span", { className: "option-row-sub", text: sub }),
        ]),
        rowCheckBadge(),
      ]
    );
    list.appendChild(row);
  }
  return list;
}