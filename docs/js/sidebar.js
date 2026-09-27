/** 기타 축제(장기·날짜 오류·날짜 미정·위치 미확인) 사이드바. 시도별로 접고 편다. */
(function (root) {
  "use strict";
  const { escapeHtml, festivalBody } = root.FestivalFormat;
  const { hasLocation } = root.DisplayRules;

  function createSidebar(panel, list, labels) {
    function open() {
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      panel.querySelector(".drawer-close").focus({ preventScroll: true });
    }

    function close() {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    }

    function itemHtml({ festival, tags }) {
      const tagHtml = tags.map((t) => `<span class="tag tag-${t}">${escapeHtml(labels[t])}</span>`).join("");
      const located = hasLocation(festival);
      return `
        <li class="side-item">
          <button type="button" class="side-item-head" data-id="${escapeHtml(festival.id)}"
            ${located ? "" : 'aria-expanded="false"'}>
            <span class="side-item-name">${escapeHtml(festival.name)}</span>
            <span class="side-item-tags">${tagHtml}</span>
          </button>
          ${located ? "" : `<div class="side-item-body" hidden>${festivalBody(festival) || "<p>표시할 정보가 없습니다.</p>"}</div>`}
        </li>`;
    }

    /** @param {{region:string, items:{festival, tags}[]}[]} groups */
    function render(groups, onPick) {
      const byId = new Map();
      groups.forEach((g) => g.items.forEach((item) => byId.set(item.festival.id, item.festival)));
      list.innerHTML = groups.map((g) => `
        <section class="side-group">
          <button type="button" class="side-group-head" aria-expanded="false">
            <span>${escapeHtml(g.region)}</span><span class="side-group-count">${g.items.length}</span>
          </button>
          <ul class="side-items" hidden>${g.items.map(itemHtml).join("")}</ul>
        </section>`).join("") || '<p class="side-empty">해당하는 축제가 없습니다.</p>';

      list.querySelectorAll(".side-group-head").forEach((btn) => btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        btn.nextElementSibling.hidden = expanded;
      }));
      list.querySelectorAll(".side-item-head").forEach((btn) => btn.addEventListener("click", () => {
        const festival = byId.get(btn.dataset.id);
        const body = btn.nextElementSibling;
        if (body) {
          const expanded = btn.getAttribute("aria-expanded") === "true";
          btn.setAttribute("aria-expanded", String(!expanded));
          body.hidden = expanded;
        } else {
          onPick(festival);
        }
      }));
    }

    panel.querySelector(".drawer-close").addEventListener("click", close);
    return { open, close, render, isOpen: () => panel.classList.contains("is-open") };
  }

  root.FestivalSidebar = { createSidebar };
})(window);
