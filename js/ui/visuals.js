/**
 * visuals.js
 * -----------------------------------------------------------------------
 * Instead of plain dropdowns, several wizard steps show the *effect* of a
 * choice: what a 16:9 frame looks like next to a 9:16 one, where the
 * subject sits for "close up" vs "wide shot", which way the light falls.
 *
 * These are small, deterministic SVG generators — no image assets, so the
 * app stays a handful of static files. Each function takes an option id
 * and returns a self-contained <svg> string sized to fill its container
 * (see .option-card-visual in components.css).
 * -----------------------------------------------------------------------
 */

const FRAME = { stroke: "var(--primary-2)", fill: "var(--primary-soft)", scene: "var(--border)" };

function frameBox(w, h, cx = 50, cy = 50) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${FRAME.fill}" stroke="${FRAME.stroke}" stroke-width="2"/>`;
}

const ASPECT_RATIOS = {
  "1:1": [56, 56],
  "16:9": [76, 43],
  "9:16": [38, 68],
  "4:3": [68, 51],
  "3:2": [72, 48],
  "21:9": [80, 34],
};

export function aspectRatioVisual(id) {
  const [w, h] = ASPECT_RATIOS[id] || [56, 56];
  return `<svg viewBox="0 0 100 100">${frameBox(w, h)}</svg>`;
}

// Composition: where the "subject" (circle) sits and how large it is,
// inside a fixed scene frame.
const COMPOSITIONS = {
  "close-up": { w: 82, h: 60, r: 20, cx: 50, cy: 52 },
  "medium-shot": { w: 82, h: 60, r: 12, cx: 50, cy: 58 },
  "wide-shot": { w: 82, h: 60, r: 5, cx: 50, cy: 62 },
  centered: { w: 82, h: 60, r: 11, cx: 50, cy: 39 },
  "negative-space": { w: 82, h: 60, r: 7, cx: 26, cy: 50 },
  "rule-of-thirds": { w: 82, h: 60, r: 9, cx: 66, cy: 38 },
};

export function compositionVisual(id) {
  const c = COMPOSITIONS[id] || COMPOSITIONS["medium-shot"];
  const x = 50 - c.w / 2;
  const y = 50 - c.h / 2;
  let grid = "";
  if (id === "rule-of-thirds") {
    const x1 = x + c.w / 3;
    const x2 = x + (c.w * 2) / 3;
    const y1 = y + c.h / 3;
    const y2 = y + (c.h * 2) / 3;
    grid = `
      <line x1="${x1}" y1="${y}" x2="${x1}" y2="${y + c.h}" stroke="${FRAME.stroke}" stroke-width="0.8" stroke-dasharray="2 2"/>
      <line x1="${x2}" y1="${y}" x2="${x2}" y2="${y + c.h}" stroke="${FRAME.stroke}" stroke-width="0.8" stroke-dasharray="2 2"/>
      <line x1="${x}" y1="${y1}" x2="${x + c.w}" y2="${y1}" stroke="${FRAME.stroke}" stroke-width="0.8" stroke-dasharray="2 2"/>
      <line x1="${x}" y1="${y2}" x2="${x + c.w}" y2="${y2}" stroke="${FRAME.stroke}" stroke-width="0.8" stroke-dasharray="2 2"/>
    `;
  }
  return `<svg viewBox="0 0 100 100">
    <rect x="${x}" y="${y}" width="${c.w}" height="${c.h}" rx="3" fill="${FRAME.fill}" stroke="${FRAME.stroke}" stroke-width="2"/>
    ${grid}
    <circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="${FRAME.stroke}" opacity="0.85"/>
  </svg>`;
}

// Camera angle: a simple scene (ground line + subject triangle) tilted /
// shifted to suggest the vantage point.
const CAMERA_ANGLES = {
  eye: { rotate: 0, dy: 0 },
  "low-angle": { rotate: 0, dy: 10, big: true },
  "high-angle": { rotate: 0, dy: -6, small: true },
  "dutch-angle": { rotate: 12, dy: 0 },
  overhead: { rotate: 0, dy: 0, overhead: true },
  "close-up-angle": { rotate: 0, dy: 0, big: true },
};

export function cameraAngleVisual(id) {
  const c = CAMERA_ANGLES[id] || CAMERA_ANGLES.eye;
  if (c.overhead) {
    return `<svg viewBox="0 0 100 100">
      <rect x="9" y="9" width="82" height="60" rx="3" fill="${FRAME.fill}" stroke="${FRAME.stroke}" stroke-width="2"/>
      <circle cx="50" cy="39" r="16" fill="none" stroke="${FRAME.stroke}" stroke-width="2"/>
      <circle cx="50" cy="39" r="4" fill="${FRAME.stroke}"/>
    </svg>`;
  }
  const scale = c.big ? 1.3 : c.small ? 0.7 : 1;
  return `<svg viewBox="0 0 100 100">
    <rect x="9" y="9" width="82" height="60" rx="3" fill="${FRAME.fill}" stroke="${FRAME.stroke}" stroke-width="2"/>
    <g transform="rotate(${c.rotate} 50 39) translate(0 ${c.dy})">
      <path d="M50 ${52 - 22 * scale} L${50 - 14 * scale} ${52 + 6 * scale} L${50 + 14 * scale} ${52 + 6 * scale} Z"
        fill="${FRAME.stroke}" opacity="0.85"/>
    </g>
    <line x1="9" y1="58" x2="91" y2="58" stroke="${FRAME.stroke}" stroke-width="1.5" opacity="0.5"/>
  </svg>`;
}

// Lighting: a scene with a light source and a gradient suggesting the
// direction / softness of light.
const LIGHTING = {
  natural: { deg: 45, color: "#ffd98a" },
  "golden-hour": { deg: 25, color: "#ff9d5c" },
  "studio-softbox": { deg: 90, color: "#dfe6ff" },
  backlit: { deg: 180, color: "#ffe6b0" },
  "low-key": { deg: 60, color: "#7d8bff", dark: true },
  neon: { deg: 300, color: "#ff5cd0" },
};

export function lightingVisual(id) {
  const l = LIGHTING[id] || LIGHTING.natural;
  const gid = `lg-${id}`;
  return `<svg viewBox="0 0 100 100">
    <defs>
      <linearGradient id="${gid}" gradientTransform="rotate(${l.deg})">
        <stop offset="0%" stop-color="${l.color}" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="${l.dark ? "#0a0d1a" : "#171d38"}" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    <rect x="9" y="9" width="82" height="60" rx="3" fill="url(#${gid})" stroke="${FRAME.stroke}" stroke-width="2"/>
    <circle cx="50" cy="45" r="13" fill="none" stroke="#0a0d1a" stroke-width="2" opacity="0.55"/>
  </svg>`;
}

/** Dispatch helper used by the option-card component. */
export function visualFor(kind, id) {
  switch (kind) {
    case "aspectRatio":
      return aspectRatioVisual(id);
    case "composition":
      return compositionVisual(id);
    case "cameraAngle":
      return cameraAngleVisual(id);
    case "lighting":
      return lightingVisual(id);
    default:
      return "";
  }
}