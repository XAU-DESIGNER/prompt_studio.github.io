/**
 * state/saved-prompts.js
 * -----------------------------------------------------------------------
 * Feature-specific persistence for user-saved prompts. Builds on the
 * generic storage.js wrapper rather than touching localStorage directly.
 * -----------------------------------------------------------------------
 */

import { readJSON, writeJSON } from "../storage/storage.js";

const KEY = "savedPrompts";

export function listSavedPrompts() {
  return readJSON(KEY, []);
}

export function saveGeneratedPrompt({ category, task, title, promptText, aspectRatio }) {
  const prompts = listSavedPrompts();
  const entry = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    category,
    task,
    title: title && title.trim() ? title.trim() : promptText.slice(0, 48),
    promptText,
    aspectRatio: aspectRatio || null,
    createdAt: new Date().toISOString(),
  };
  prompts.unshift(entry);
  writeJSON(KEY, prompts);
  return entry;
}

export function deleteSavedPrompt(id) {
  const prompts = listSavedPrompts().filter((p) => p.id !== id);
  writeJSON(KEY, prompts);
}