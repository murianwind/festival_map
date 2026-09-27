/** 달력 아래 '선택한 날의 축제 목록'. */
(function (root) {
  "use strict";
  const { escapeHtml } = root.FestivalFormat;

  /** @param {{listEl:HTMLElement, festivals:object[], onPick:(festival)=>void}} s */
  function renderDayList(s) {
    const sorted = s.festivals.slice().sort((a, b) => a.name.localeCompare(b.name, "ko"));
    s.listEl.innerHTML = sorted.map((f) => `
      <li><button type="button" data-id="${escapeHtml(f.id)}">
        <span class="day-name">${escapeHtml(f.name)}</span>
        <span class="day-place">${escapeHtml(f.place)}</span>
      </button></li>`).join("");
    s.listEl.querySelectorAll("button").forEach((btn) => btn.addEventListener("click", () =>
      s.onPick(sorted.find((f) => f.id === btn.dataset.id))));
  }

  root.FestivalDayList = { renderDayList };
})(window);
