import { el, mount } from "../dom.js";
import { icon } from "../icons.js";
import { t } from "../../i18n/i18n.js";
import { getTemplate } from "../../templates/registry.js";
import { renderOptionPicker } from "../components/option-picker.js";
import { renderStepRail, renderMobileProgress } from "../components/step-rail.js";
import { isStepValid, isStepAnswered, buildPrompt } from "../../prompt-engine/prompt-builder.js";
import { renderResultView } from "./result.js";
import { navigate } from "../router.js";

function renderTextField(step, config, category, task, onInput) {
  const field = el("div", { className: "field" });
  const value = config[step.id] || "";

  const isTextarea = step.kind === "textarea";
  const input = el(isTextarea ? "textarea" : "input", {
    className: isTextarea ? "textarea-input" : "text-input",
    placeholder: t(`templates.${category}.${task}.steps.${step.id}.placeholder`),
    on: {
      input: (e) => onInput(e.target.value),
    },
  });
  input.value = value;
  field.appendChild(input);

  if (step.suggestions && step.suggestions.length) {
    const row = el(
      "div",
      { className: "suggestion-row" },
      step.suggestions.map((key) =>
        el(
          "button",
          {
            type: "button",
            className: "suggestion-chip",
            on: {
              click: () => {
                input.value = t(`suggestions.${key}`);
                onInput(input.value);
              },
            },
          },
          t(`suggestions.${key}`)
        )
      )
    );
    field.appendChild(row);
  }

  return field;
}

export function renderWizard(container, { category, task }) {
  const template = getTemplate(category, task);

  if (!template) {
    mount(
      container,
      el("div", { className: "content-narrow empty-state" }, [
        el("p", { text: t("wizard.notFound") }),
      ])
    );
    return;
  }

  // Local, per-mount wizard state.
  let config = {};
  let stepIndex = 0;
  let phase = "form"; // "form" | "result"

  function currentSteps() {
    return template.getSteps(config);
  }

  function goResult() {
    phase = "result";
    render();
  }

  function render() {
    if (phase === "result") {
      const promptText = buildPrompt(template, config, t);
      renderResultView(container, {
        template,
        config,
        promptText,
        onBack: () => {
          phase = "form";
          render();
        },
      });
      return;
    }

    const steps = currentSteps();
    if (stepIndex >= steps.length) stepIndex = steps.length - 1;
    if (stepIndex < 0) stepIndex = 0;
    const step = steps[stepIndex];
    const answeredFlags = steps.map((s) => isStepAnswered(s, config));

    const wrap = el("div", { className: "content-narrow" });

    wrap.appendChild(renderMobileProgress(steps, stepIndex, t, category, task));

    const grid = el("div", { className: "wizard" });
    grid.appendChild(
      renderStepRail(steps, stepIndex, answeredFlags, t, category, task, (index) => {
        // Allow jumping back to any previous step, or forward only if
        // every step up to that point has been answered.
        const canJump = index <= stepIndex || steps.slice(0, index).every((s) => isStepAnswered(s, config));
        if (canJump) {
          stepIndex = index;
          render();
        }
      })
    );

    const panel = el("div", { className: "wizard-panel" });
    panel.appendChild(
      el("h2", { className: "wizard-step-title", text: t(`templates.${category}.${task}.steps.${step.id}.title`) })
    );
    const desc = t(`templates.${category}.${task}.steps.${step.id}.description`);
    if (desc && desc !== `templates.${category}.${task}.steps.${step.id}.description`) {
      panel.appendChild(el("p", { className: "wizard-step-desc", text: desc }));
    }

    const setValue = (value) => {
      config = { ...config, [step.id]: value };
      render();
    };

    if (step.kind === "text" || step.kind === "textarea") {
      panel.appendChild(renderTextField(step, config, category, task, setValue));
    } else {
      panel.appendChild(renderOptionPicker(step, config, t, setValue, template.accent));
    }

    const isLast = stepIndex === steps.length - 1;
    const canAdvance = isStepValid(step, config);

    const nav = el("div", { className: "wizard-nav" }, [
      stepIndex > 0
        ? el(
            "button",
            { type: "button", className: "btn btn-secondary", on: { click: () => (stepIndex--, render()) } },
            [el("span", { className: "icon-directional", html: icon("back") }), el("span", { text: t("wizard.back") })]
          )
        : el("button", { type: "button", className: "btn btn-ghost", on: { click: () => navigate("#/home") } }, [
            t("wizard.cancel"),
          ]),
      el(
        "button",
        {
          type: "button",
          className: "btn btn-primary",
          disabled: !canAdvance,
          on: {
            click: () => {
              if (isLast) {
                goResult();
              } else {
                stepIndex++;
                render();
              }
            },
          },
        },
        [
          el("span", { text: isLast ? t("wizard.reviewPrompt") : t("wizard.next") }),
          !isLast ? el("span", { className: "icon-directional", html: icon("chevronRight") }) : null,
        ]
      ),
    ]);
    panel.appendChild(nav);

    grid.appendChild(panel);
    wrap.appendChild(grid);
    mount(container, wrap);
  }

  render();
}