import { el } from "../dom.js";
import { icon } from "../icons.js";

/**
 * Renders the vertical numbered step list (desktop) and returns the node.
 * `onJump` is called with a step index when the user clicks a completed
 * or current step (jumping ahead to unanswered steps is not allowed).
 */
export function renderStepRail(steps, currentIndex, answeredFlags, t, category, task, onJump) {
  const rail = el("nav", { className: "step-rail", "aria-label": t("wizard.stepsLabel") });

  steps.forEach((step, index) => {
    const isDone = answeredFlags[index] && index < currentIndex;
    const isCurrent = index === currentIndex;
    const canJump = index <= currentIndex || answeredFlags.slice(0, index).every(Boolean);

    const bullet = isDone ? icon("check") : String(index + 1);
    const labelId = step.labelKey || step.id;
    const item = el(
      "button",
      {
        type: "button",
        className: `step-rail-item${isCurrent ? " is-current" : ""}${isDone ? " is-done" : ""}`,
        disabled: index > currentIndex && !canJump,
        on: { click: () => onJump(index) },
      },
      [
        el("span", { className: "step-rail-bullet", html: bullet }),
        el("span", {}, [
          el("span", { className: "step-rail-title", text: t(`templates.${category}.${task}.steps.${labelId}.title`) }),
        ]),
      ]
    );
    rail.appendChild(item);
  });

  return rail;
}

/** Mobile progress bar (fraction complete, current step label). */
export function renderMobileProgress(steps, currentIndex, t, category, task) {
  const pct = Math.round(((currentIndex + 1) / steps.length) * 100);
  return el("div", { className: "progress-bar-mobile" }, [
    el("div", { className: "progress-bar-track" }, [el("div", { className: "progress-bar-fill", style: `width:${pct}%` })]),
    el("div", {
      className: "progress-bar-label",
      text: t("wizard.stepOf", { current: currentIndex + 1, total: steps.length }),
    }),
  ]);
}