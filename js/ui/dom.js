/**
 * dom.js
 * -----------------------------------------------------------------------
 * A handful of tiny helpers so screen modules don't repeat
 * document.createElement boilerplate. Deliberately not a virtual DOM —
 * the app is small enough that direct DOM manipulation stays readable.
 * -----------------------------------------------------------------------
 */

/** Create an element. `attrs` may include `className`, `html`, `text`,
 *  `on: { click: fn }`, and any other attribute (set via setAttribute). */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  const { className, html, text, on, dataset, ...rest } = attrs;

  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  if (text !== undefined) node.textContent = text;
  if (dataset) Object.entries(dataset).forEach(([k, v]) => (node.dataset[k] = v));
  if (on) Object.entries(on).forEach(([evt, fn]) => node.addEventListener(evt, fn));
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== false) node.setAttribute(key, value);
  });

  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function mount(container, node) {
  clear(container);
  container.appendChild(node);
}

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}