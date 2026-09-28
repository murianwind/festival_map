/**
 * 화면 상태(보는 달, 선택한 날) 계산. 휴가 기간을 바꿔 축제 날짜가 달라져도 보던 달을 유지한다.
 * 브라우저(window.ViewState)와 Node(require) 양쪽에서 쓴다.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ViewState = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const monthOf = (day) => day.slice(0, 7);

  /**
   * @param {{days:string[], today:string, month:string, selected:string|null}} s
   *   days: 축제가 있는 날짜들, month: 보던 달, selected: 선택했던 날
   * @returns {{month:string, selected:string|null, lastMonth:string}}
   */
  function nextViewState(s) {
    const days = s.days.slice().sort();
    const firstMonth = monthOf(s.today);
    const lastMonth = days.length ? monthOf(days[days.length - 1]) : firstMonth;
    let month = s.month || firstMonth;
    if (month < firstMonth) month = firstMonth;
    if (month > lastMonth) month = lastMonth;

    const keep = s.selected && days.includes(s.selected) && monthOf(s.selected) === month;
    const selected = keep ? s.selected : days.find((d) => monthOf(d) === month) || null;
    return { month, selected, lastMonth };
  }

  /** 날짜 선택창을 보던 달로 열기 위한 초기값: 그 달 1일, 단 오늘보다 이르면 오늘. */
  function pickerStartValue(month, today) {
    const firstDay = `${month}-01`;
    return firstDay < today ? today : firstDay;
  }

  return { nextViewState, pickerStartValue };
});
