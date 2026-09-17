/**
 * templates/registry.js
 * -----------------------------------------------------------------------
 * The single lookup table mapping "category → task → template". This is
 * the ONLY file that needs a new line when a new template ships; nothing
 * in ui/ or prompt-engine/ hard-codes template ids.
 *
 * To add a brand-new template (say Text → Rewrite):
 *   1. Create js/templates/text-rewrite.js exporting { id, category,
 *      task, accent, icon, getSteps(config), buildPrompt(config, t) }.
 *   2. Import it below and add it to TEMPLATES.
 *   3. Add its copy (step titles, option labels) to locales/en.json and
 *      locales/fa.json under templates.<category>.<task>.
 * The wizard, prompt engine, and saved-prompts screen all work generically
 * off this registry and never need to change.
 * -----------------------------------------------------------------------
 */

import { imageCreateTemplate } from "./image-create.js";
import { imageEditTemplate } from "./image-edit.js";

const TEMPLATES = [imageCreateTemplate, imageEditTemplate];

/** Categories shown on the home screen / sidebar, in display order.
 *  `tasks` lists task ids that exist as real templates; `plannedTasks`
 *  are shown as disabled/"coming soon" so the nav shape doesn't jump
 *  around as new templates land. */
export const CATEGORIES = [
  { id: "image", icon: "image", accent: "image", tasks: ["create", "edit"], plannedTasks: [] },
  { id: "text", icon: "text", accent: "text", tasks: [], plannedTasks: ["write", "rewrite", "summarize"] },
  { id: "code", icon: "code", accent: "code", tasks: [], plannedTasks: ["generate", "debug", "review"] },
];

export function getTemplate(category, task) {
  return TEMPLATES.find((tpl) => tpl.category === category && tpl.task === task) || null;
}

export function getCategory(categoryId) {
  return CATEGORIES.find((c) => c.id === categoryId) || null;
}

export function allTemplates() {
  return TEMPLATES;
}