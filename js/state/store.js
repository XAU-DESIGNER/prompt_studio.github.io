/**
 * store.js
 * -----------------------------------------------------------------------
 * A minimal, dependency-free observable store. Not Redux — just enough
 * structure to keep "application state" out of the DOM and out of
 * scattered globals, per the project's architecture goals.
 *
 * Usage:
 *   const store = createStore({ count: 0 });
 *   const unsubscribe = store.subscribe((state) => render(state));
 *   store.set({ count: 1 });
 *   store.update((state) => ({ count: state.count + 1 }));
 * -----------------------------------------------------------------------
 */

export function createStore(initialState = {}) {
  let state = { ...initialState };
  const listeners = new Set();

  function get() {
    return state;
  }

  function set(patch) {
    state = { ...state, ...patch };
    listeners.forEach((fn) => fn(state));
  }

  /** Functional update: updater(prevState) => patch */
  function update(updater) {
    const patch = updater(state);
    set(patch);
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return { get, set, update, subscribe };
}

/** The single app-wide store instance. */
export const appStore = createStore({
  locale: "en",
  theme: "dark",
  route: "#/home",
  // The prompt currently being built. Reset whenever a new wizard starts.
  draft: null, // { templateId, category, task, config, stepIndex }
});