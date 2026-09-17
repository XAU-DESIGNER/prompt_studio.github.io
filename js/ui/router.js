/**
 * router.js
 * -----------------------------------------------------------------------
 * Tiny hash router. Routes are registered as `pattern -> handler(params)`.
 * Patterns use `:name` segments, e.g. "#/image/:task".
 * -----------------------------------------------------------------------
 */

const routes = [];
let notFoundHandler = null;

export function route(pattern, handler) {
  const paramNames = [];
  const regex = new RegExp(
    "^" +
      pattern.replace(/:[^/]+/g, (match) => {
        paramNames.push(match.slice(1));
        return "([^/]+)";
      }) +
      "$"
  );
  routes.push({ regex, paramNames, handler });
}

export function notFound(handler) {
  notFoundHandler = handler;
}

export function navigate(hash) {
  if (window.location.hash === hash) {
    dispatch();
  } else {
    window.location.hash = hash;
  }
}

function dispatch() {
  const hash = window.location.hash || "#/home";
  for (const r of routes) {
    const match = hash.match(r.regex);
    if (match) {
      const params = {};
      r.paramNames.forEach((name, i) => (params[name] = decodeURIComponent(match[i + 1])));
      r.handler(params);
      return;
    }
  }
  if (notFoundHandler) notFoundHandler();
}

export function startRouter() {
  window.addEventListener("hashchange", dispatch);
  if (!window.location.hash) window.location.hash = "#/home";
  dispatch();
}

export function currentHash() {
  return window.location.hash || "#/home";
}