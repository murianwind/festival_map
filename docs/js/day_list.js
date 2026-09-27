/** 달력 아래 '선택한 날의 축제 목록'. */
(function (root) {
  "use strict";
  const { escapeHtml } = root.FestivalFormat;
  const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

  function dayTitle(day, holidayName, count) {
    if (!day) return "예정된 축제가 없습니다";
    const d = new Date(day + "T00:00:00Z");
    const holiday = holidayName ? ` ${holidayName}` : "";
    return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${WEEKDAYS[d.getUTCDay()]}요일${holiday}, 축제 ${count}곳`;
  }

  /**
   * @param {{titleEl:HTMLElement, listEl:HTMLElement, day:string|null, holidayName:string,
   *   festivals:object[], onPick:(festival)=>void}} s
   */
  function renderDayList(s) {
    const sorted = s.festivals.slice().sort((a, b) => a.name.localeCompare(b.name, "ko"));
    s.titleEl.textContent = dayTitle(s.day, s.holidayName, sorted.length);
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
