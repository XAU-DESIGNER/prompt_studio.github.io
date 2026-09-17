import { el, mount } from "../dom.js";
import { icon } from "../icons.js";
import { t } from "../../i18n/i18n.js";
import { CATEGORIES } from "../../templates/registry.js";
import { navigate } from "../router.js";

export function renderHome(container) {
  const wrap = el("div", { className: "content-narrow" });

  wrap.appendChild(
    el("div", { className: "hero" }, [
      el("h1", { className: "text-display hero-title" }, [
        document.createTextNode(`${t("home.heroTitlePart1")} `),
        el("span", { className: "accent", text: t("home.heroTitleAccent") }),
      ]),
      el("p", { className: "hero-sub", text: t("home.heroSubtitle") }),
    ])
  );

  const cards = el("div", { className: "stack gap-md", style: "max-width:560px;margin:0 auto;" });

  for (const cat of CATEGORIES) {
    const hasWork = cat.tasks.length > 0;
    const defaultTask = cat.tasks[0];
    cards.appendChild(
      el(
        "button",
        {
          type: "button",
          className: "category-card",
          disabled: !hasWork,
          on: { click: () => hasWork && navigate(`#/${cat.id}/${defaultTask}`) },
        },
        [
          el("div", { className: `category-icon accent-${cat.accent}`, html: icon(cat.icon) }),
          el("div", {}, [
            el("div", { className: "category-title", text: t(`nav.category.${cat.id}`) }),
            el("div", {
              className: "category-sub",
              text: hasWork ? t(`home.categorySub.${cat.id}`) : t("nav.comingSoon"),
            }),
          ]),
          hasWork ? el("span", { className: "category-arrow", html: icon("chevronRight") }) : null,
        ]
      )
    );
  }

  wrap.appendChild(cards);
  mount(container, wrap);
}