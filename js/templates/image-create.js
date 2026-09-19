/**
 * templates/image-create.js
 * -----------------------------------------------------------------------
 * Defines the "Image → Create" flow. This file owns ONLY:
 *   1. what steps exist and in what order (getSteps)
 *   2. how the structured config becomes a final prompt (buildPrompt)
 *
 * It knows nothing about rendering (that's ui/screens/wizard.js) and
 * nothing about labels (those live in /locales, looked up by key).
 * Adding a brand-new field to this flow means editing this file only.
 * -----------------------------------------------------------------------
 */

export const imageCreateTemplate = {
  id: "image-create",
  category: "image",
  task: "create",
  accent: "image",
  icon: "image",

  // Steps are a function of the current config so future flows can branch
  // conditionally; this one is a fixed sequence.
  getSteps() {
    return [
      {
        id: "subject",
        kind: "text",
        required: true,
        suggestions: ["fantasyCastle", "peacefulForest", "cyberpunkCity", "cozyRoom"],
      },
      {
        id: "aspectRatio",
        kind: "visual-grid",
        visual: "aspectRatio",
        required: true,
        options: ["1:1", "16:9", "9:16", "4:3", "3:2", "21:9", "2:3", "5:4"],
      },
      {
        id: "composition",
        kind: "visual-grid",
        visual: "composition",
        required: false,
        options: [
          "close-up",
          "medium-shot",
          "wide-shot",
          "centered",
          "negative-space",
          "rule-of-thirds",
          "silhouette",
          "symmetry",
          "framed",
          "leading-lines",
        ],
      },
      {
        id: "cameraAngle",
        kind: "visual-grid",
        visual: "cameraAngle",
        required: false,
        options: [
          "eye",
          "low-angle",
          "high-angle",
          "dutch-angle",
          "overhead",
          "close-up-angle",
          "worms-eye",
          "front-view",
          "profile-view",
        ],
      },
      {
        id: "lighting",
        kind: "visual-grid",
        visual: "lighting",
        required: false,
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
      {
        id: "style",
        kind: "icon-grid",
        icon: "style",
        required: false,
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
          "steampunk",
          "vaporwave",
          "comic-book",
          "impressionist",
          "low-poly",
        ],
      },
      {
        id: "colorPalette",
        kind: "icon-grid",
        icon: "palette",
        required: false,
        options: ["warm", "cool", "monochrome", "pastel", "vibrant", "earth-tones", "neon", "sepia"],
      },
      {
        id: "mood",
        kind: "icon-grid",
        icon: "sparkle",
        required: false,
        options: [
          "serene",
          "dramatic",
          "whimsical",
          "eerie",
          "epic",
          "cozy",
          "mysterious",
          "romantic",
          "melancholic",
          "triumphant",
          "nostalgic",
          "playful",
          "peaceful",
          "ominous",
        ],
      },
      {
        id: "environment",
        kind: "icon-grid",
        icon: "globe",
        required: false,
        options: [
          "mountains",
          "urban",
          "underwater",
          "space",
          "desert",
          "interior",
          "beach",
          "forest",
          "castle",
          "market",
          "ruins",
          "arctic",
          "jungle",
          "cave",
          "rooftop",
          "temple",
        ],
      },
      {
        id: "timeOfDay",
        kind: "icon-grid",
        icon: "sun",
        required: false,
        options: ["dawn", "morning", "midday", "afternoon", "dusk", "night", "blue-hour"],
      },
      {
        id: "weather",
        kind: "icon-grid",
        icon: "globe",
        required: false,
        options: ["clear", "cloudy", "rainy", "stormy", "foggy", "snowy", "windy"],
      },
      {
        id: "additionalDetails",
        kind: "textarea",
        required: false,
      },
    ];
  },

  /**
   * Turn the structured config into a single prompt string. Kept as one
   * pure function — no string concatenation happens in UI event handlers
   * anywhere else in the app.
   */
  buildPrompt(config, t) {
    const parts = [];

    if (config.subject) {
      parts.push(config.subject.trim());
    }

    const descriptors = [];

    if (config.composition) {
      descriptors.push(
        t(`optionValues.composition.${config.composition}`).label
      );
    }

    if (config.cameraAngle) {
      descriptors.push(
        t(`optionValues.cameraAngle.${config.cameraAngle}`).label
      );
    }

    if (config.lighting) {
      descriptors.push(
        t(`optionValues.lighting.${config.lighting}`).label
      );
    }

    if (config.style) {
      descriptors.push(
        t(`optionValues.style.${config.style}`).label
      );
    }

    if (config.colorPalette) {
      descriptors.push(
        `${t("promptEngine.paletteLabel")} ${t(`optionValues.colorPalette.${config.colorPalette}`).label}`
      );
    }

    if (config.mood) {
      descriptors.push(
        `${t("promptEngine.moodPrefix")} ${t(`optionValues.mood.${config.mood}`).label
        }`
      );
    }

    if (config.environment) {
      descriptors.push(
        `${t("promptEngine.setIn")} ${t(`optionValues.environment.${config.environment}`).label
        }`
      );
    }

    if (config.timeOfDay) {
      descriptors.push(
        t(`optionValues.timeOfDay.${config.timeOfDay}`).label
      );
    }

    if (config.weather) {
      descriptors.push(
        t(`optionValues.weather.${config.weather}`).label
      );
    }

    if (descriptors.length) {
      parts.push(descriptors.join(", "));
    }

    if (config.aspectRatio) {
      parts.push(
        `${t("promptEngine.aspectRatioLabel")} ${config.aspectRatio}`
      );
    }

    if (config.additionalDetails) {
      parts.push(config.additionalDetails.trim());
    }

    return parts.filter(Boolean).join(". ").replace(/\.\.$/, ".") +
      (parts.length ? "." : "");
  }
};
