/** 월간 달력. 오늘 이전 날짜는 비활성, 축제가 있는 날에 개수를 표시한다. */
(function (root) {
  "use strict";
  const { escapeHtml } = root.FestivalFormat;
  const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

  function monthKey(day) {
    return day.slice(0, 7);
  }

  function shiftMonth(key, delta) {
    const [y, m] = key.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    return d.toISOString().slice(0, 7);
  }

  /** 칸이 좁아 '대체공휴일(개천절)' 같은 이름은 괄호 앞까지만 보여준다. */
  function shortHolidayName(name) {
    return name.replace(/\(.*\)$/, "").trim();
  }

  function monthTitle(key) {
    const [y, m] = key.split("-").map(Number);
    return `${y}년 ${m}월`;
  }

  /**
   * @param {HTMLElement} el
   * @param {{month:string, today:string, lastMonth:string, selected:string,
   *   counts:Map<string,number>, holidayNames:Object<string,string>, extraDays:Set<string>,
   *   onSelect:(day:string)=>void, onMonth:(month:string)=>void}} s
   */
  function renderCalendar(el, s) {
    const [y, m] = s.month.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const lead = first.getUTCDay();
    const canPrev = s.month > monthKey(s.today);
    const canNext = s.month < s.lastMonth;

    const cells = [];
    for (let i = 0; i < lead; i++) cells.push('<span class="cal-cell is-blank" aria-hidden="true"></span>');
    for (let d = 1; d <= daysInMonth; d++) {
      const day = `${s.month}-${String(d).padStart(2, "0")}`;
      const w = (lead + d - 1) % 7;
      const holiday = s.holidayNames[day];
      const count = s.counts.get(day) || 0;
      const past = day < s.today;
      const classes = ["cal-cell"];
      if (w === 0 || holiday) classes.push("is-red");
      else if (w === 6) classes.push("is-blue");
      if (past) classes.push("is-past");
      if (s.extraDays.has(day)) classes.push("is-extra");
      if (day === s.today) classes.push("is-today");
      if (day === s.selected) classes.push("is-selected");
      if (count) classes.push("has-festival");
      const label = `${m}월 ${d}일${holiday ? ` ${holiday}` : ""}, 축제 ${count}곳`;
      cells.push(`
        <button type="button" class="${classes.join(" ")}" data-day="${day}"
          ${past || !count ? "disabled" : ""} aria-pressed="${day === s.selected}"
          aria-label="${escapeHtml(label)}">
          <span class="cal-num">${d}</span>
          ${holiday ? `<span class="cal-holiday">${escapeHtml(shortHolidayName(holiday))}</span>` : ""}
          ${count && !past ? `<span class="cal-count">${count}</span>` : ""}
        </button>`);
    }

    el.innerHTML = `
      <div class="cal-head">
        <button type="button" class="cal-nav" data-nav="-1" ${canPrev ? "" : "disabled"} aria-label="이전 달">‹</button>
        <h2 class="cal-title">${monthTitle(s.month)}</h2>
        <button type="button" class="cal-nav" data-nav="1" ${canNext ? "" : "disabled"} aria-label="다음 달">›</button>
      </div>
      <div class="cal-week" aria-hidden="true">
        ${WEEKDAYS.map((w, i) => `<span class="${i === 0 ? "is-red" : i === 6 ? "is-blue" : ""}">${w}</span>`).join("")}
      </div>
      <div class="cal-grid">${cells.join("")}</div>`;

    el.querySelectorAll("[data-day]:not([disabled])").forEach((btn) =>
      btn.addEventListener("click", () => s.onSelect(btn.dataset.day)));
    el.querySelectorAll("[data-nav]:not([disabled])").forEach((btn) =>
      btn.addEventListener("click", () => s.onMonth(shiftMonth(s.month, Number(btn.dataset.nav)))));
  }

  root.FestivalCalendar = { renderCalendar, monthKey };
})(window);
