/** 카카오맵 위에 축제 위치 핀을 그린다. 같은 좌표의 축제는 핀 하나로 묶는다. */
(function (root) {
  "use strict";
  const KOREA_CENTER = [36.4, 127.8];
  const KOREA_LEVEL = 13;
  const SINGLE_LEVEL = 6;

  function locationKey(f) {
    return `${f.lat.toFixed(5)},${f.lon.toFixed(5)}`;
  }

  function groupByLocation(festivals) {
    const groups = new Map();
    for (const f of festivals) {
      const key = locationKey(f);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(f);
    }
    return groups;
  }

  function createMapView(container) {
    const kakao = root.kakao;
    const map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(...KOREA_CENTER),
      level: KOREA_LEVEL,
    });
    let overlays = [];
    let pins = new Map(); // locationKey -> button

    function clear() {
      overlays.forEach((o) => o.setMap(null));
      overlays = [];
      pins = new Map();
    }

    function setActive(key) {
      pins.forEach((btn, k) => btn.classList.toggle("is-active", k === key));
    }

    function makePin(group, onPick) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pin";
      btn.textContent = group.length > 1 ? String(group.length) : "";
      btn.setAttribute("aria-label", group.map((f) => f.name).join(", "));
      btn.addEventListener("click", () => onPick(group));
      return btn;
    }

    /** 축제 목록을 핀으로 표시하고 전부 보이게 지도를 맞춘다. */
    function show(festivals, onPick) {
      clear();
      const bounds = new kakao.maps.LatLngBounds();
      for (const [key, group] of groupByLocation(festivals)) {
        const position = new kakao.maps.LatLng(group[0].lat, group[0].lon);
        const pin = makePin(group, (g) => { setActive(key); onPick(g); });
        const overlay = new kakao.maps.CustomOverlay({
          position, content: pin, yAnchor: 1, clickable: true,
        });
        overlay.setMap(map);
        overlays.push(overlay);
        pins.set(key, pin);
        bounds.extend(position);
      }
      if (pins.size === 0) {
        map.setLevel(KOREA_LEVEL);
        map.setCenter(new kakao.maps.LatLng(...KOREA_CENTER));
      } else if (pins.size === 1) {
        map.setLevel(SINGLE_LEVEL);
        map.setCenter(bounds.getSouthWest());
      } else {
        map.setBounds(bounds, 48, 48, 48, 48);
      }
    }

    /** 특정 축제 위치로 이동한다. 지금 그려진 핀이 아니면 그 축제 핀만 새로 그린다. */
    function focus(festival, onPick) {
      const key = locationKey(festival);
      if (!pins.has(key)) show([festival], onPick);
      setActive(key);
      if (map.getLevel() > SINGLE_LEVEL) map.setLevel(SINGLE_LEVEL);
      map.panTo(new kakao.maps.LatLng(festival.lat, festival.lon));
    }

    return {
      show,
      focus,
      clearActive: () => setActive(null),
      relayout: () => map.relayout(),
    };
  }

  function loadKakao(appKey) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
      script.onload = () => root.kakao.maps.load(resolve);
      script.onerror = () => reject(new Error("카카오 지도 스크립트를 불러오지 못했습니다."));
      document.head.appendChild(script);
    });
  }

  root.FestivalMap = { createMapView, loadKakao };
})(window);
