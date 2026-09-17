/**
 * storage.js
 * -----------------------------------------------------------------------
 * Thin wrapper around window.localStorage. Nothing here knows about
 * "prompts" or "settings" specifically — it just namespaces keys and
 * safely (de)serializes JSON. Feature modules build on top of this.
 * -----------------------------------------------------------------------
 */

const NAMESPACE = "promptStudioPro";

function nsKey(key) {
  return `${NAMESPACE}:${key}`;
}

/** Read a JSON value. Returns `fallback` if missing or malformed. */
export function readJSON(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(nsKey(key));
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[storage] failed to read "${key}"`, err);
    return fallback;
  }
}

/** Write a JSON-serializable value. Returns true on success. */
export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(nsKey(key), JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[storage] failed to write "${key}"`, err);
    return false;
  }
}

export function remove(key) {
  window.localStorage.removeItem(nsKey(key));
}

/** Every key this app owns, with the namespace prefix stripped. */
export function ownKeys() {
  const keys = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const full = window.localStorage.key(i);
    if (full && full.startsWith(`${NAMESPACE}:`)) {
      keys.push(full.slice(NAMESPACE.length + 1));
    }
  }
  return keys;
}

/** Export every value this app has stored, as one JSON-serializable object. */
export function exportAll() {
  const dump = {};
  for (const key of ownKeys()) {
    dump[key] = readJSON(key);
  }
  return { app: NAMESPACE, exportedAt: new Date().toISOString(), data: dump };
}

/** Import a bundle previously produced by exportAll(). Merges, doesn't wipe. */
export function importAll(bundle) {
  if (!bundle || typeof bundle !== "object" || !bundle.data) {
    throw new Error("Invalid import file");
  }
  for (const [key, value] of Object.entries(bundle.data)) {
    writeJSON(key, value);
  }
}