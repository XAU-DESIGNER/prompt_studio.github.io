/**
 * icons.js
 * -----------------------------------------------------------------------
 * A tiny hand-picked SVG icon set (stroke-based, currentColor) so the app
 * has zero icon-font / icon-library dependency. Each export is a raw SVG
 * string ready to drop into innerHTML.
 * -----------------------------------------------------------------------
 */

const wrap = (paths, viewBox = "0 0 24 24") =>
  `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;

export const icons = {
  home: wrap('<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/>'),
  image: wrap('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M20 15.5 15 11l-8.5 8"/>'),
  text: wrap('<path d="M5 5h14"/><path d="M5 10h14"/><path d="M5 15h9"/><path d="M5 20h6"/>'),
  code: wrap('<path d="m9 6-6 6 6 6"/><path d="m15 6 6 6-6 6"/>'),
  saved: wrap('<path d="M6 4h12v16l-6-4-6 4Z"/>'),
  settings: wrap(
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z"/>'
  ),
  chevronRight: wrap('<path d="m9 6 6 6-6 6"/>'),
  chevronLeft: wrap('<path d="m15 6-6 6 6 6"/>'),
  back: wrap('<path d="m15 6-6 6 6 6"/>'),
  check: wrap('<path d="M20 6 9 17l-5-5"/>'),
  copy: wrap('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
  save: wrap('<path d="M5 5h11l3 3v11H5z"/><path d="M9 5v5h6V5"/><path d="M9 19v-5h6v5"/>'),
  sun: wrap('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  moon: wrap('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>'),
  globe: wrap('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z"/>'),
  trash: wrap('<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>'),
  sparkle: wrap('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>'),
  removeObject: wrap('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="m9 9 6 6M15 9l-6 6"/>'),
  replaceBg: wrap('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 15 9 9.5l3 3 3.5-3.5L20.5 15"/>'),
  lighting: wrap('<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>'),
  style: wrap('<path d="M12 3 2 9l10 6 10-6-10-6Z"/><path d="m2 15 10 6 10-6"/>'),
  extend: wrap('<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M3 3v4M3 3h4M21 3v4M21 3h-4M3 21v-4M3 21h4M21 21v-4M21 21h-4"/>'),
  restore: wrap('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v5h5"/>'),
  upscale: wrap('<path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6"/>'),
  plus: wrap('<path d="M12 5v14M5 12h14"/>'),
  info: wrap('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>'),
};

export function icon(name, extraClass = "") {
  const svg = icons[name] || icons.info;
  if (!extraClass) return svg;
  return svg.replace("<svg ", `<svg class="${extraClass}" `);
}