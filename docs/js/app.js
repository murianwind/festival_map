/** 화면 조립: 데이터 로드 → 표시 규칙 적용 → 달력·지도·사이드바 연결. */
(function (root) {
  "use strict";
  const Rules = root.DisplayRules;
  const { renderCalendar, monthKey } = root.FestivalCalendar;
  const { escapeHtml } = root.FestivalFormat;
  const MOBILE = window.matchMedia("(max-width: 899px)");

  const $ = (id) => document.getElementById(id);

  function formatUpdated(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const parts = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(d);
    return `${parts} 갱신`;
  }

  function showMapMessage(text) {
    $("map").innerHTML = `<p class="map-message">${escapeHtml(text)}</p>`;
  }

  async function start() {
    const response = await fetch("festivals.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("축제 데이터를 불러오지 못했습니다.");
    const data = await response.json();

    const today = Rules.todayInSeoul(new Date());
    const holidayNames = data.holidays || {};
    const view = Rules.buildView(data.festivals, today, new Set(Object.keys(holidayNames)));
    const days = [...view.byDate.keys()].sort();
    const counts = new Map(days.map((d) => [d, view.byDate.get(d).length]));

    $("updated").textContent = formatUpdated(data.meta && data.meta.generatedAt);
    $("otherCount").textContent = String(view.sidebar.length);

    const initialDay = days.includes(today) ? today : days[0] || null;
    const state = {
      selected: initialDay,
      month: monthKey(initialDay || today),
      lastMonth: monthKey(days[days.length - 1] || today),
    };

    // 지도 (키가 없거나 SDK 로드 실패여도 달력과 사이드바는 동작한다)
    let mapView = null;
    const detail = root.FestivalDetail.createDetailCard($("detail"), () => mapView && mapView.clearActive());
    const key = (root.FESTIVAL_CONFIG || {}).kakaoJsKey;
    if (!key) {
      showMapMessage("config.js에 카카오 지도 JavaScript 키를 넣으면 지도가 표시됩니다.");
    } else {
      try {
        await root.FestivalMap.loadKakao(key);
        mapView = root.FestivalMap.createMapView($("map"));
      } catch (error) {
        showMapMessage(error.message);
      }
    }

    const pick = (group) => detail.show(group);

    function showOne(festival) {
      if (mapView && Rules.hasLocation(festival)) mapView.focus(festival, pick);
      detail.show([festival]);
    }

    function selectDay(day) {
      state.selected = day;
      detail.hide();
      renderAll();
      if (mapView) mapView.show(day ? view.byDate.get(day) : [], pick);
    }

    function renderAll() {
      renderCalendar($("calendar"), {
        month: state.month, today, lastMonth: state.lastMonth, selected: state.selected,
        counts, holidayNames,
        onSelect: selectDay,
        onMonth: (month) => { state.month = month; renderAll(); },
      });
      root.FestivalDayList.renderDayList({
        titleEl: $("dayTitle"), listEl: $("dayList"), day: state.selected,
        holidayName: holidayNames[state.selected],
        festivals: state.selected ? view.byDate.get(state.selected) : [],
        onPick: showOne,
      });
    }

    // 사이드바
    const sidebar = root.FestivalSidebar.createSidebar($("drawer"), $("drawerList"), Rules.TAG_LABELS);
    sidebar.render(Rules.groupByRegion(view.sidebar), (festival) => {
      if (MOBILE.matches) sidebar.close();
      showOne(festival);
    });
    $("otherButton").addEventListener("click", sidebar.open);

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (sidebar.isOpen()) sidebar.close();
      else detail.hide();
    });
    window.addEventListener("resize", () => mapView && mapView.relayout());

    selectDay(state.selected);
  }

  start().catch((error) => showMapMessage(error.message));
})(window);
