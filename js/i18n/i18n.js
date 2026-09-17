/**
 * i18n.js
 * -----------------------------------------------------------------------
 * Loads /locales/<lang>.json files and exposes a t(key, vars) lookup.
 * No UI string should ever be hard-coded in HTML or JS — everything
 * user-facing is resolved through this module, which makes adding a new
 * language a matter of dropping in one more JSON file (see LOCALES below
 * and locales/README.md).
 * -----------------------------------------------------------------------
 */

import { readJSON, writeJSON } from "../storage/storage.js";

/** Registry of supported languages. Add a new entry here + a JSON file
 *  under /locales to support another language — no other code changes
 *  are required for the UI text itself. */
export const LOCALES = {
  en: { label: "English", dir: "ltr", file: "locales/en.json" },
  fa: { label: "فارسی", dir: "rtl", file: "locales/fa.json" },
};

const DEFAULT_LOCALE = "en";
const cache = new Map();

let currentLocale = DEFAULT_LOCALE;
let currentDict = {};
const listeners = new Set();

function detectInitialLocale() {
  const saved = readJSON("locale");
  if (saved && LOCALES[saved]) return saved;
  const nav = (navigator.language || "en").slice(0, 2);
  if (LOCALES[nav]) return nav;
  return DEFAULT_LOCALE;
}

async function loadDict(locale) {
  if (cache.has(locale)) return cache.get(locale);
  const meta = LOCALES[locale] || LOCALES[DEFAULT_LOCALE];
  const res = await fetch(meta.file);
  if (!res.ok) throw new Error(`Could not load locale file: ${meta.file}`);
  const dict = await res.json();
  cache.set(locale, dict);
  return dict;
}

/** Resolve a dotted path like "wizard.next" against a nested object. */
function resolve(dict, path) {
  return path.split(".").reduce((node, part) => (node && typeof node === "object" ? node[part] : undefined), dict);
}

/** Simple {placeholder} interpolation. */
function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : `{${key}}`));
}

/**
 * Translate a key. Falls back to the English string, then to the key
 * itself, so missing translations never crash the UI — they just stand
 * out visibly, which is the right failure mode for a translation gap.
 */
export function t(key, vars) {
  let value = resolve(currentDict, key);
  if (value === undefined) {
    const fallbackDict = cache.get(DEFAULT_LOCALE);
    value = fallbackDict ? resolve(fallbackDict, key) : undefined;
  }
  if (value === undefined) return key;
  return typeof value === "string" ? interpolate(value, vars) : value;
}

export function getLocale() {
  return currentLocale;
}

export function getDir() {
  return (LOCALES[currentLocale] || LOCALES[DEFAULT_LOCALE]).dir;
}

export function onLocaleChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function applyDocumentAttributes() {
  const dir = getDir();
  document.documentElement.setAttribute("lang", currentLocale);
  document.documentElement.setAttribute("dir", dir);
}

/** Load and activate a locale. Persists the choice for next visit. */
export async function setLocale(locale) {
  if (!LOCALES[locale]) locale = DEFAULT_LOCALE;
  currentDict = await loadDict(locale);
  // Always keep an English fallback warm so resolve() above can use it.
  if (locale !== DEFAULT_LOCALE && !cache.has(DEFAULT_LOCALE)) {
    await loadDict(DEFAULT_LOCALE);
  }
  currentLocale = locale;
  writeJSON("locale", locale);
  applyDocumentAttributes();
  listeners.forEach((fn) => fn(currentLocale));
}

/** Call once at startup. */
export async function initI18n() {
  await setLocale(detectInitialLocale());
}