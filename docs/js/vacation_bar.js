/** 휴가 기간 입력. 값은 저장하지 않아 새로고침하면 사라진다. */
(function (root) {
  "use strict";

  function formatShort(day) {
    const [, m, d] = day.split("-").map(Number);
    return `${m}월 ${d}일`;
  }

  /**
   * @param {HTMLElement} el
   * @param {{pickerStartValue:()=>string, onApply:(start:string, end:string)=>void, onClear:()=>void}} s
   */
  function createVacationBar(el, s) {
    function renderEditing() {
      el.innerHTML = `
        <label class="vac-label" for="vacStart">휴가 기간</label>
        <div class="vac-row">
          <input id="vacStart" type="date" aria-label="휴가 시작일">
          <span aria-hidden="true">~</span>
          <input id="vacEnd" type="date" aria-label="휴가 종료일">
          <button type="button" class="vac-apply">적용</button>
        </div>
        <p class="vac-hint">이 기간에는 평일 축제도 보여줍니다. 새로고침하면 지워집니다.</p>`;
      const start = el.querySelector("#vacStart");
      const end = el.querySelector("#vacEnd");
      // 값이 없는 채로 열면 항상 오늘이 있는 달로 뜨므로, 보던 달의 날짜를 미리 채워둔다
      const openToViewedMonth = (input, fallback) => {
        if (!input.value) input.value = fallback();
      };
      start.addEventListener("focus", () => openToViewedMonth(start, s.pickerStartValue));
      end.addEventListener("focus", () => openToViewedMonth(end, () => start.value || s.pickerStartValue()));
      start.addEventListener("change", () => { if (!end.value) end.value = start.value; });
      el.querySelector(".vac-apply").addEventListener("click", () => {
        if (!start.value || !end.value) {
          (start.value ? end : start).focus();
          return;
        }
        const [from, to] = start.value <= end.value ? [start.value, end.value] : [end.value, start.value];
        renderActive(from, to);
        s.onApply(from, to);
      });
    }

    function renderActive(from, to) {
      const range = from === to ? formatShort(from) : `${formatShort(from)} ~ ${formatShort(to)}`;
      el.innerHTML = `
        <div class="vac-row vac-active">
          <span class="vac-range">휴가 ${range}</span>
          <button type="button" class="vac-clear">해제</button>
        </div>`;
      el.querySelector(".vac-clear").addEventListener("click", () => {
        renderEditing();
        s.onClear();
      });
    }

    renderEditing();

    return {
      /** 아직 적용 전(입력 중)이면 값을 비운다. 이미 적용된 휴가 기간은 건드리지 않는다. */
      reset() {
        const start = el.querySelector("#vacStart");
        const end = el.querySelector("#vacEnd");
        if (start) start.value = "";
        if (end) end.value = "";
      },
    };
  }

  root.FestivalVacation = { createVacationBar };
})(window);
