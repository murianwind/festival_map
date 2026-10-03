/**
 * 브라우저 위치 정보를 받아 지도에 현재 위치를 표시하고, 버튼으로 그 위치로 이동한다.
 * 위치는 브라우저 안에서만 쓰며 어디로도 보내지 않는다.
 */
(function (root) {
  "use strict";
  const { messageFor } = root.GeoMessages;
  const NOTE_MS = 4000;
  const OPTIONS = { enableHighAccuracy: false, maximumAge: 30000, timeout: 15000 };

  /**
   * @param {{setMyLocation:(lat:number, lon:number)=>void, goToMyLocation:()=>void}} mapView
   * @param {HTMLElement} button  '내 위치로 이동' 버튼(처음엔 hidden)
   * @param {HTMLElement} note    안내 문구를 잠깐 보여줄 곳
   */
  function start(mapView, button, note) {
    const geo = root.navigator.geolocation;
    if (!geo) return; // 위치 기능이 없는 브라우저에서는 버튼을 숨긴 채로 둔다

    let watchId = null;
    let hasPosition = false;
    let wantsMove = false; // 버튼을 눌렀는데 아직 위치가 없으면, 위치를 받는 즉시 이동한다
    let noteTimer = null;

    function showNote(text) {
      note.textContent = text;
      note.hidden = false;
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => { note.hidden = true; }, NOTE_MS);
    }

    function setBusy(busy) {
      wantsMove = busy;
      button.setAttribute("aria-busy", String(busy));
    }

    function onPosition(position) {
      hasPosition = true;
      button.classList.add("is-on");
      mapView.setMyLocation(position.coords.latitude, position.coords.longitude);
      if (wantsMove) {
        setBusy(false);
        mapView.goToMyLocation();
      }
    }

    function onError(error) {
      hasPosition = false;
      button.classList.remove("is-on");
      if (wantsMove) {
        setBusy(false);
        showNote(messageFor(error.code));
      }
    }

    function begin() {
      if (watchId !== null) geo.clearWatch(watchId);
      watchId = geo.watchPosition(onPosition, onError, OPTIONS);
    }

    button.hidden = false;
    button.addEventListener("click", () => {
      if (hasPosition) {
        mapView.goToMyLocation();
        return;
      }
      setBusy(true);
      begin(); // 권한이 '묻기' 상태면 안내 창이 다시 뜬다
    });
    begin();
  }

  root.FestivalMyLocation = { start };
})(window);
