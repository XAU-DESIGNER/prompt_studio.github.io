import { initI18n, onLocaleChange } from "./i18n/i18n.js";
import { readJSON } from "./storage/storage.js";
import { appStore } from "./state/store.js";
import { route, notFound, startRouter, navigate, currentHash } from "./ui/router.js";
import { mountShell, renderShell } from "./ui/app-shell.js";
import { renderHome } from "./ui/screens/home.js";
import { renderWizard } from "./ui/screens/wizard.js";
import { renderSaved } from "./ui/screens/saved.js";
import { renderSettings } from "./ui/screens/settings.js";
import { qs } from "./ui/dom.js";

async function bootstrap() {
  // Theme: saved preference > OS preference > dark default.
  const savedTheme = readJSON("theme");
  const theme = savedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.setAttribute("data-theme", theme);
  appStore.set({ theme });

  await initI18n();

  const view = qs("#view");

  route("#/home", () => renderHome(view));
  route("#/saved", () => renderSaved(view));
  route("#/settings", () => renderSettings(view));
  route("#/:category/:task", ({ category, task }) => renderWizard(view, { category, task }));
  notFound(() => renderHome(view));

  mountShell({
    sidebar: qs("#sidebar"),
    topbar: qs("#topbar-controls"),
    mobileTopbar: qs("#mobile-topbar"),
    mobileTabbar: qs("#mobile-tabbar"),
  });

  // Re-render the shell (nav labels) and the current screen whenever the
  // language changes — this is the only place that needs to know that.
  onLocaleChange(() => {
    renderShell();
    navigate(currentHash());
  });

  window.addEventListener("hashchange", renderShell);

  startRouter();
}

bootstrap();