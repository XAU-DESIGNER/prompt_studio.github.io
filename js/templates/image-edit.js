/**
 * templates/image-edit.js
 * -----------------------------------------------------------------------
 * "Image → Edit" flow. Unlike Create, the questions genuinely change
 * depending on the chosen action (remove object vs. upscale ask for very
 * different information), which is why getSteps() takes the current
 * config and returns a different tail of steps per action.
 * -----------------------------------------------------------------------
 */

const ACTION_ICONS = {
  "remove-object": "removeObject",
  "replace-background": "replaceBg",
  "change-lighting": "lighting",
  "change-style": "style",
  "extend-image": "extend",
  "restore-image": "restore",
  upscale: "upscale",
};

const ACTIONS = Object.keys(ACTION_ICONS);

/** Extra steps appended after the action is chosen, keyed by action id. */
function followUpSteps(action) {
  switch (action) {
    case "remove-object":
      return [{ id: "targetObject", kind: "text", required: true }];
    case "replace-background":
      return [
        { id: "newBackground", kind: "text", required: true },
        {
          id: "lighting",
          kind: "visual-grid",
          visual: "lighting",
          required: false,
          options: ["natural", "golden-hour", "studio-softbox", "backlit", "low-key", "neon"],
        },
      ];
    case "change-lighting":
      return [
        {
          id: "lighting",
          kind: "visual-grid",
          visual: "lighting",
          required: true,
          options: ["natural", "golden-hour", "studio-softbox", "backlit", "low-key", "neon"],
        },
      ];
    case "change-style":
      return [
        {
          id: "style",
          kind: "icon-grid",
          icon: "style",
          required: true,
          options: ["photorealistic", "fantasy-art", "anime", "watercolor", "cyberpunk", "minimalist"],
        },
      ];
    case "extend-image":
      return [
        {
          id: "extendDirection",
          kind: "icon-grid",
          icon: "extend",
          required: true,
          options: ["up", "down", "left", "right", "all-sides"],
        },
      ];
    case "restore-image":
      return [{ id: "restoreNotes", kind: "textarea", required: false }];
    case "upscale":
      return [
        {
          id: "upscaleFactor",
          kind: "icon-grid",
          icon: "upscale",
          required: true,
          options: ["2x", "4x", "8x"],
        },
      ];
    default:
      return [];
  }
}

export const imageEditTemplate = {
  id: "image-edit",
  category: "image",
  task: "edit",
  accent: "image",
  icon: "image",

  getSteps(config = {}) {
    const steps = [
      {
        id: "action",
        kind: "icon-list",
        required: true,
        options: ACTIONS.map((id) => ({ id, icon: ACTION_ICONS[id] })),
      },
    ];
    if (config.action) {
      steps.push(...followUpSteps(config.action));
      steps.push({ id: "additionalDetails", kind: "textarea", required: false });
    }
    return steps;
  },

  buildPrompt(config, t) {
    if (!config.action) return "";
    const action = t(`optionValues.action.${config.action}`);
    const parts = [];

    switch (config.action) {
      case "remove-object":
        parts.push(`${t("promptEngine.editVerbs.remove")} "${(config.targetObject || "").trim()}"`);
        break;
      case "replace-background":
        parts.push(`${t("promptEngine.editVerbs.replaceBackground")}: ${(config.newBackground || "").trim()}`);
        if (config.lighting) parts.push(t(`optionValues.lighting.${config.lighting}`));
        break;
      case "change-lighting":
        parts.push(`${t("promptEngine.editVerbs.changeLighting")}: ${t(`optionValues.lighting.${config.lighting}`)}`);
        break;
      case "change-style":
        parts.push(`${t("promptEngine.editVerbs.changeStyle")}: ${t(`optionValues.style.${config.style}`)}`);
        break;
      case "extend-image":
        parts.push(`${t("promptEngine.editVerbs.extend")} (${t(`optionValues.extendDirection.${config.extendDirection}`)})`);
        break;
      case "restore-image":
        parts.push(t("promptEngine.editVerbs.restore"));
        if (config.restoreNotes) parts.push(config.restoreNotes.trim());
        break;
      case "upscale":
        parts.push(`${t("promptEngine.editVerbs.upscale")} ${config.upscaleFactor || ""}`.trim());
        break;
      default:
        parts.push(action);
    }

    if (config.additionalDetails) parts.push(config.additionalDetails.trim());

    return parts.filter(Boolean).join(". ") + ".";
  },
};