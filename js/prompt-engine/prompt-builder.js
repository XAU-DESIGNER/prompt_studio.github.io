/**
 * prompt-engine/prompt-builder.js
 * -----------------------------------------------------------------------
 * The only place the app turns a PromptConfiguration into text. UI code
 * never concatenates strings itself — it calls buildPrompt() here, which
 * delegates to the active template's own buildPrompt (each template knows
 * its own grammar) but centralizes validation so every flow behaves the
 * same way around required fields.
 * -----------------------------------------------------------------------
 */

/** Is a single step's answer present in the config? */
export function isStepAnswered(step, config) {
  const value = config[step.id];
  if (step.kind === "icon-list" || step.kind === "visual-grid" || step.kind === "icon-grid") {
    return value !== undefined && value !== null && value !== "";
  }
  if (step.kind === "text" || step.kind === "textarea") {
    return typeof value === "string" && value.trim().length > 0;
  }
  return Boolean(value);
}

export function isStepValid(step, config) {
  if (!step.required) return true;
  return isStepAnswered(step, config);
}

/** Whether every required step (given the current dynamic step list) is answered. */
export function isConfigComplete(steps, config) {
  return steps.every((step) => isStepValid(step, config));
}

/** Build the final prompt text via the template's own grammar. */
export function buildPrompt(template, config, t) {
  if (!template) return "";
  try {
    return template.buildPrompt(config, t).trim();
  } catch (err) {
    console.error("[prompt-engine] buildPrompt failed", err);
    return "";
  }
}