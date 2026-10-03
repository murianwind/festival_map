/** 화면 조립: 데이터 로드 → 표시 규칙 적용 → 달력·지도·목록·사이드바·휴가 기간 연결. */
(function (root) {
  "use strict";
  const Rules = root.DisplayRules;
  const { renderCalendar, monthKey } = root.FestivalCalendar;
  const { escapeHtml } = root.FestivalFormat;
  const MOBILE = window.matchMedia("(max-width: 899px)");
  const NO_DAYS = new Set();
  const ViewState = root.ViewState;

  const $ = (id) => document.getElementById(id);

  function formatUpdated(iso) {
    if (!iso) return "";
    const parts = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date(iso));
    return `${parts} 갱신`;
  }

  function showMapMessage(text) {
    $("map").innerHTML = `<p class="map-message">${escapeHtml(text)}</p>`;
  }

  async function createMap() {
    const key = (root.FESTIVAL_CONFIG || {}).kakaoJsKey;
    if (!key) {
      showMapMessage("config.js에 카카오 지도 JavaScript 키를 넣으면 지도가 표시됩니다.");
      return null;
    }
    try {
      await root.FestivalMap.loadKakao(key);
      return root.FestivalMap.createMapView($("map"));
    } catch (error) {
      showMapMessage(error.message);
      return null;
    }
  }

  async function start() {
    const response = await fetch("festivals.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("축제 데이터를 불러오지 못했습니다.");
    const data = await response.json();

    const today = Rules.todayInSeoul(new Date());
    const holidayNames = data.holidays || {};
    const publicHolidays = new Set(Object.keys(holidayNames));
    $("updated").textContent = formatUpdated(data.meta && data.meta.generatedAt);

    let mapView = null;
    const detail = root.FestivalDetail.createDetailCard($("detail"), () => mapView && mapView.clearActive());
    mapView = await createMap();
    if (mapView) root.FestivalMyLocation.start(mapView, $("myLocation"), $("mapNote"));
    const pick = (group) => detail.show(group);
    const sidebar = root.FestivalSidebar.createSidebar($("drawer"), $("drawerList"), Rules.TAG_LABELS);

    // 휴가 기간은 메모리에만 둔다(새로고침하면 사라짐)
    const state = { vacationDays: NO_DAYS, view: null, days: [], selected: null, month: monthKey(today), lastMonth: null };
    const dayPicker = MOBILE.matches
      ? root.FestivalDayPicker.createDayPicker(document.querySelector(".panel-fixed"), $("dayPicker"))
      : null;

    function showOne(festival) {
      if (mapView && Rules.hasLocation(festival)) mapView.focus(festival, pick);
      detail.show([festival]);
    }

    /** 휴일(주말·공휴일·휴가 기간) 기준으로 달력·사이드바 내용을 다시 계산한다. 보던 달은 유지한다. */
    function recompute() {
      const holidays = state.vacationDays.size
        ? new Set([...publicHolidays, ...state.vacationDays])
        : publicHolidays;
      state.view = Rules.buildView(data.festivals, today, holidays);
      state.days = [...state.view.byDate.keys()].sort();
      const next = ViewState.nextViewState({ days: state.days, today, month: state.month, selected: state.selected });
      state.month = next.month;
      state.lastMonth = next.lastMonth;

      $("otherCount").textContent = String(state.view.sidebar.length);
      sidebar.render(Rules.groupByRegion(state.view.sidebar), (festival) => {
        if (MOBILE.matches) sidebar.close();
        showOne(festival);
      });
      selectDay(next.selected, { closeDrawer: false });
    }

    function selectDay(day, { closeDrawer = true } = {}) {
      state.selected = day;
      detail.hide();
      renderPanel();
      if (mapView) mapView.show(day ? state.view.byDate.get(day) : [], pick);
      if (closeDrawer && dayPicker) dayPicker.close();
    }

    function renderPanel() {
      renderCalendar($("calendar"), {
        month: state.month, today, lastMonth: state.lastMonth, selected: state.selected,
        counts: new Map(state.days.map((d) => [d, state.view.byDate.get(d).length])),
        holidayNames, extraDays: state.vacationDays,
        onSelect: selectDay,
        onMonth: (month) => { state.month = month; vacationBar.reset(); renderPanel(); },
      });
      root.FestivalDayList.renderDayList({
        listEl: $("dayList"),
        festivals: state.selected ? state.view.byDate.get(state.selected) : [],
        onPick: showOne,
      });
      if (dayPicker) dayPicker.setButtonLabel(state.selected, holidayNames[state.selected]);
    }

    const vacationBar = root.FestivalVacation.createVacationBar($("vacation"), {
      pickerStartValue: () => ViewState.pickerStartValue(state.month, today),
      onApply: (from, to) => {
        state.vacationDays = Rules.withExtraDays(NO_DAYS, from, to);
        recompute();
      },
      onClear: () => {
        state.vacationDays = NO_DAYS;
        recompute();
      },
    });

    $("otherButton").addEventListener("click", () => (sidebar.isOpen() ? sidebar.close() : sidebar.open()));
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (dayPicker && dayPicker.isOpen()) dayPicker.close();
      else if (sidebar.isOpen()) sidebar.close();
      else detail.hide();
    });
    window.addEventListener("resize", () => mapView && mapView.relayout());

    recompute();
  }

  start().catch((error) => showMapMessage(error.message));
})(window);
