/**
 * 축제를 캘린더/사이드바/숨김 중 어디에 둘지 정하는 순수 함수 모음.
 * 브라우저(window.DisplayRules)와 Node(require) 양쪽에서 쓴다.
 * 날짜는 모두 'YYYY-MM-DD' 문자열로 다룬다(문자열 비교 = 날짜 비교).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.DisplayRules = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const LONG_EVENT_DAYS = 14;
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

  const TAG_LABELS = {
    long: "장기",
    invalid: "날짜 오류",
    missing: "날짜 미정",
    nolocation: "위치 미확인",
  };

  const REGION_ORDER = [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시", "대전광역시", "울산광역시",
    "세종특별자치시", "경기도", "강원특별자치도", "충청북도", "충청남도", "전북특별자치도",
    "전남광주통합특별시", "경상북도", "경상남도", "제주특별자치도", "기타",
  ];

  function isValidDate(text) {
    if (!ISO_DATE.test(text || "")) return false;
    const d = new Date(text + "T00:00:00Z");
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === text;
  }

  function addDays(day, count) {
    const d = new Date(day + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + count);
    return d.toISOString().slice(0, 10);
  }

  function daysInclusive(start, end) {
    const ms = new Date(end + "T00:00:00Z") - new Date(start + "T00:00:00Z");
    return Math.round(ms / 86400000) + 1;
  }

  function weekday(day) {
    return new Date(day + "T00:00:00Z").getUTCDay(); // 0=일 ... 6=토
  }

  function isHoliday(day, holidaySet) {
    const w = weekday(day);
    return w === 0 || w === 6 || holidaySet.has(day);
  }

  /** 한국 시간 기준 오늘 날짜. */
  function todayInSeoul(now) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(now);
    const get = (type) => parts.find((p) => p.type === type).value;
    return `${get("year")}-${get("month")}-${get("day")}`;
  }

  function datesBetween(from, to) {
    const result = [];
    for (let d = from; d <= to; d = addDays(d, 1)) result.push(d);
    return result;
  }

  function hasLocation(festival) {
    return typeof festival.lat === "number" && typeof festival.lon === "number";
  }

  /** 정상 날짜 축제가 캘린더에 올라갈 날짜: 오늘 이후 남은 기간 중 휴일만. */
  function calendarDatesFor(start, end, today, holidaySet) {
    const from = start > today ? start : today;
    return datesBetween(from, end).filter((d) => isHoliday(d, holidaySet));
  }

  /** 날짜 오류 축제가 사이드바에 올라갈지: 두 날짜가 모두 지났으면 숨긴다. */
  function invalidStillRelevant(festival, today) {
    const bothPast = [festival.start, festival.end].every((d) => isValidDate(d) && d < today);
    return !bothPast;
  }

  /**
   * @returns {{calendarDates: string[], sidebarTags: string[]}}
   *   둘 다 비어 있으면 숨김.
   */
  function classifyFestival(festival, today, holidaySet) {
    const hidden = { calendarDates: [], sidebarTags: [] };
    const locationTags = hasLocation(festival) ? [] : ["nolocation"];

    if (festival.dateStatus === "missing") {
      return { calendarDates: [], sidebarTags: ["missing", ...locationTags] };
    }
    if (festival.dateStatus === "invalid") {
      if (!invalidStillRelevant(festival, today)) return hidden;
      return { calendarDates: [], sidebarTags: ["invalid", ...locationTags] };
    }

    const { start, end } = festival;
    if (end < today) return hidden;
    if (daysInclusive(start, end) >= LONG_EVENT_DAYS) {
      return { calendarDates: [], sidebarTags: ["long", ...locationTags] };
    }
    const dates = calendarDatesFor(start, end, today, holidaySet);
    if (dates.length === 0) return hidden;
    if (locationTags.length) return { calendarDates: [], sidebarTags: locationTags };
    return { calendarDates: dates, sidebarTags: [] };
  }

  /** 모든 축제를 분류해 날짜별 목록과 사이드바 목록을 만든다. */
  function buildView(festivals, today, holidaySet) {
    const byDate = new Map();
    const sidebar = [];
    for (const festival of festivals) {
      const { calendarDates, sidebarTags } = classifyFestival(festival, today, holidaySet);
      for (const day of calendarDates) {
        if (!byDate.has(day)) byDate.set(day, []);
        byDate.get(day).push(festival);
      }
      if (sidebarTags.length) sidebar.push({ festival, tags: sidebarTags });
    }
    return { byDate, sidebar };
  }

  /** 사이드바 항목을 정해진 시도 순서로 묶는다. 목록에 없는 지역은 기타 앞에 이름순. */
  function groupByRegion(items) {
    const groups = new Map();
    for (const item of items) {
      const region = item.festival.region || "기타";
      if (!groups.has(region)) groups.set(region, []);
      groups.get(region).push(item);
    }
    const rank = (region) => {
      const i = REGION_ORDER.indexOf(region);
      if (region === "기타") return REGION_ORDER.length + 1;
      return i === -1 ? REGION_ORDER.length : i;
    };
    return [...groups.entries()]
      .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b, "ko"))
      .map(([region, regionItems]) => ({
        region,
        items: regionItems.sort((x, y) => x.festival.name.localeCompare(y.festival.name, "ko")),
      }));
  }

  return {
    TAG_LABELS,
    addDays, todayInSeoul,
    classifyFestival, buildView, groupByRegion,
  };
});
