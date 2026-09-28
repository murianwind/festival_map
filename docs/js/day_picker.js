/** 모바일에서 달력·휴가 기간을 담는 왼쪽 서랍. 날짜를 고르면 자동으로 닫힌다. */
(function (root) {
  "use strict";
  const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

  function buttonLabel(day, holidayName) {
    if (!day) return "날짜 선택";
    const d = new Date(day + "T00:00:00Z");
    const holiday = holidayName ? ` ${holidayName}` : "";
    return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${WEEKDAYS[d.getUTCDay()]}${holiday}`;
  }

  /**
   * @param {HTMLElement} sheet   달력+휴가 기간을 담은 '.panel-fixed' (서랍 내용으로 재사용)
   * @param {HTMLElement} backdrop  '#dayPicker' 반투명 배경
   */
  function createDayPicker(sheet, backdrop) {
    const toggle = document.getElementById("dayPickerToggle");
    const root = document.body;

    function open() {
      root.classList.add("day-picker-open");
      backdrop.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
    }

    function close() {
      root.classList.remove("day-picker-open");
      backdrop.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
    }

    function isOpen() {
      return root.classList.contains("day-picker-open");
    }

    toggle.addEventListener("click", () => (isOpen() ? close() : open()));
    backdrop.addEventListener("click", close);

    return {
      open, close, isOpen,
      setButtonLabel: (day, holidayName) => {
        toggle.textContent = buttonLabel(day, holidayName); // textContent라 별도 escape 불필요
      },
    };
  }

  root.FestivalDayPicker = { createDayPicker };
})(window);
