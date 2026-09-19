/**
 * templates/image-edit.js
 * -----------------------------------------------------------------------
 * "Image → Edit" flow. The first step ("actions") is a MULTI-select list:
 * a person can combine several edits in one prompt (e.g. "change the
 * lighting" AND "change the aspect ratio" at the same time), which is why
 * config.actions is an array rather than a single string.
 *
 * Because two different actions can ask a question with the same raw id
 * (e.g. both "change-lighting" and "replace-background" ask about
 * lighting), every follow-up step id is namespaced as
 * "<actionId>__<rawStepId>" when it's added to the step list. The raw id
 * is kept on `labelKey` so the UI can still look up its title/placeholder
 * in /locales under the shared, un-namespaced key.
 * -----------------------------------------------------------------------
 */

const ACTION_ICONS = {
  "remove-object": "removeObject",
  "replace-background": "replaceBg",
  "change-lighting": "lighting",
  "change-style": "style",
  "change-ratio": "cropRatio",
  "color-grade": "palette",
  "add-object": "addObject",
  "blur-background": "blurBg",
  "sharpen-denoise": "sharpen",
  colorize: "colorize",
  "extend-image": "extend",
  "restore-image": "restore",
  upscale: "upscale",
};

const ACTIONS = Object.keys(ACTION_ICONS);

/** Extra steps appended after an action is selected, keyed by action id.
 *  Ids here are the RAW (un-namespaced) ids — namespacing happens once,
 *  centrally, in getSteps() below. */
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
          options: [
            "natural",
            "golden-hour",
            "studio-softbox",
            "backlit",
            "low-key",
            "neon",
            "moonlight",
            "candlelight",
            "overcast",
            "hard-light",
            "rim-light",
            "volumetric",
          ],
        },
      ];
    case "change-style":
      return [
        {
          id: "style",
          kind: "icon-grid",
          icon: "style",
          required: true,
          options: [
            "photorealistic",
            "fantasy-art",
            "anime",
            "watercolor",
            "cyberpunk",
            "minimalist",
            "oil-painting",
            "pencil-sketch",
            "3d-render",
            "pixel-art",
            "pop-art",
            "comic-book",
          ],
        },
      ];
    case "change-ratio":
      return [
        {
          id: "aspectRatio",
          kind: "visual-grid",
          visual: "aspectRatio",
          required: true,
          options: ["1:1", "16:9", "9:16", "4:3", "3:2", "21:9", "2:3", "5:4"],
        },
      ];
    case "color-grade":
      return [
        {
          id: "colorPalette",
          kind: "icon-grid",
          icon: "palette",
          required: true,
          options: ["warm", "cool", "monochrome", "pastel", "vibrant", "earth-tones", "neon", "sepia"],
        },
      ];
    case "add-object":
      return [{ id: "newObject", kind: "text", required: true }];
    case "blur-background":
      return [
        {
          id: "blurIntensity",
          kind: "icon-grid",
          icon: "blurBg",
          required: true,
          options: ["subtle", "medium", "strong"],
        },
      ];
    case "colorize":
      return [
        {
          id: "colorizeTone",
          kind: "icon-grid",
          icon: "colorize",
          required: false,
          options: ["natural", "vivid", "sepia"],
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

/** Build one clause of the final prompt for a single selected action,
 *  reading its answers back out of the namespaced config keys. */
function buildActionPart(action, config, t) {
  const get = (rawId) => config[`${action}__${rawId}`];
  const label = (group, id) => (id ? t(`optionValues.${group}.${id}`).label : "");

  switch (action) {
    case "remove-object":
      return `${t("promptEngine.editVerbs.remove")} "${(get("targetObject") || "").trim()}"`;
    case "replace-background": {
      const parts = [`${t("promptEngine.editVerbs.replaceBackground")}: ${(get("newBackground") || "").trim()}`];
      const lighting = get("lighting");
      if (lighting) parts.push(label("lighting", lighting));
      return parts.join(", ");
    }
    case "change-lighting":
      return `${t("promptEngine.editVerbs.changeLighting")}: ${label("lighting", get("lighting"))}`;
    case "change-style":
      return `${t("promptEngine.editVerbs.changeStyle")}: ${label("style", get("style"))}`;
    case "change-ratio":
      return `${t("promptEngine.editVerbs.changeRatio")}: ${get("aspectRatio") || ""}`.trim();
    case "color-grade":
      return `${t("promptEngine.editVerbs.colorGrade")}: ${label("colorPalette", get("colorPalette"))}`;
    case "add-object":
      return `${t("promptEngine.editVerbs.addObject")}: ${(get("newObject") || "").trim()}`;
    case "blur-background":
      return `${t("promptEngine.editVerbs.blurBackground")}: ${label("blurIntensity", get("blurIntensity"))}`;
    case "sharpen-denoise":
      return t("promptEngine.editVerbs.sharpenDenoise");
    case "colorize": {
      const parts = [t("promptEngine.editVerbs.colorize")];
      const tone = get("colorizeTone");
      if (tone) parts.push(label("colorizeTone", tone));
      return parts.join(", ");
    }
    case "extend-image":
      return `${t("promptEngine.editVerbs.extend")} (${label("extendDirection", get("extendDirection"))})`;
    case "restore-image": {
      const parts = [t("promptEngine.editVerbs.restore")];
      const notes = get("restoreNotes");
      if (notes) parts.push(notes.trim());
      return parts.join(". ");
    }
    case "upscale":
      return `${t("promptEngine.editVerbs.upscale")} ${get("upscaleFactor") || ""}`.trim();
    default:
      return t(`optionValues.actions.${action}`).label;
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
        id: "actions",
        kind: "icon-list",
        multi: true,
        required: true,
        options: ACTIONS.map((id) => ({ id, icon: ACTION_ICONS[id] })),
      },
    ];
    const selected = Array.isArray(config.actions) ? config.actions : [];
    if (selected.length) {
      for (const action of selected) {
        for (const raw of followUpSteps(action)) {
          steps.push({
            ...raw,
            id: `${action}__${raw.id}`,
            labelKey: raw.id,
          });
        }
      }
      steps.push({ id: "additionalDetails", kind: "textarea", required: false });
    }
    return steps;
  },

  buildPrompt(config, t) {
    const selected = Array.isArray(config.actions) ? config.actions : [];
    if (!selected.length) return "";

    const parts = ACTIONS.filter((id) => selected.includes(id)).map((action) => buildActionPart(action, config, t));

    if (config.additionalDetails) parts.push(config.additionalDetails.trim());

    return parts.filter(Boolean).join(". ") + ".";
  },
};
