/** 카카오맵 위에 축제 위치 핀을 그린다. 핀 묶기 규칙은 DisplayRules.groupPins. */
(function (root) {
  "use strict";
  const { groupPins, pinKey } = root.DisplayRules;
  const KOREA_CENTER = [36.4, 127.8];
  const KOREA_LEVEL = 13;
  const SINGLE_LEVEL = 6;
  const MY_LOCATION_LEVEL = 7;

  function createMapView(container) {
    const kakao = root.kakao;
    const map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(...KOREA_CENTER),
      level: KOREA_LEVEL,
    });
    let overlays = [];
    let pins = new Map(); // pinKey -> 핀 버튼
    let myOverlay = null; // 현재 위치 점. 핀과 따로 두어 날짜를 바꿔도 지워지지 않는다
    let myPosition = null;

    function clear() {
      overlays.forEach((o) => o.setMap(null));
      overlays = [];
      pins = new Map();
    }

    function setActive(keys) {
      pins.forEach((btn, k) => btn.classList.toggle("is-active", keys.includes(k)));
    }

    function makePin(group, onClick) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pin";
      btn.textContent = group.length > 1 ? String(group.length) : "";
      btn.setAttribute("aria-label", group.map((f) => f.name).join(", "));
      btn.addEventListener("click", onClick);
      return btn;
    }

    function fit(positions) {
      if (positions.length === 1) {
        map.setLevel(SINGLE_LEVEL);
        map.setCenter(positions[0]);
        return;
      }
      const bounds = new kakao.maps.LatLngBounds();
      positions.forEach((p) => bounds.extend(p));
      map.setBounds(bounds, 48, 48, 48, 48);
    }

    /** 축제 목록을 핀으로 표시하고 전부 보이게 지도를 맞춘다. */
    function show(festivals, onPick) {
      clear();
      const positions = [];
      for (const pin of groupPins(festivals)) {
        const position = new kakao.maps.LatLng(pin.lat, pin.lon);
        const button = makePin(pin.festivals, () => { setActive([pin.key]); onPick(pin.festivals); });
        const overlay = new kakao.maps.CustomOverlay({
          position, content: button, yAnchor: 1, clickable: true,
        });
        overlay.setMap(map);
        overlays.push(overlay);
        pins.set(pin.key, button);
        positions.push(position);
      }
      if (positions.length === 0) {
        map.setLevel(KOREA_LEVEL);
        map.setCenter(new kakao.maps.LatLng(...KOREA_CENTER));
      } else {
        fit(positions);
      }
    }

    /** 축제의 모든 위치를 강조하고 보이게 맞춘다. 지금 없는 핀이면 그 축제 핀만 새로 그린다. */
    function focus(festival, onPick) {
      const keys = festival.locations.map(pinKey);
      if (!keys.every((k) => pins.has(k))) show([festival], onPick);
      setActive(keys);
      fit(festival.locations.map((l) => new kakao.maps.LatLng(l.lat, l.lon)));
    }

    /** 현재 위치 점을 표시하거나 옮긴다. */
    function setMyLocation(lat, lon) {
      myPosition = new kakao.maps.LatLng(lat, lon);
      if (myOverlay) {
        myOverlay.setPosition(myPosition);
        return;
      }
      const dot = document.createElement("div");
      dot.className = "me-dot";
      dot.setAttribute("role", "img");
      dot.setAttribute("aria-label", "현재 위치");
      myOverlay = new kakao.maps.CustomOverlay({
        position: myPosition, content: dot, xAnchor: 0.5, yAnchor: 0.5, zIndex: 1,
      });
      myOverlay.setMap(map);
    }

    /** 현재 위치로 지도를 옮긴다. 너무 멀리 보고 있으면 동네가 보이는 정도로 확대한다. */
    function goToMyLocation() {
      if (!myPosition) return;
      if (map.getLevel() > MY_LOCATION_LEVEL) map.setLevel(MY_LOCATION_LEVEL);
      map.panTo(myPosition);
    }

    return {
      show,
      focus,
      setMyLocation,
      goToMyLocation,
      clearActive: () => setActive([]),
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
