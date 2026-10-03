/**
 * 브라우저 위치 오류 코드(GeolocationPositionError.code)를 사용자 안내 문구로 바꾼다.
 * 브라우저(window.GeoMessages)와 Node(require) 양쪽에서 쓴다.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.GeoMessages = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const PERMISSION_DENIED = 1;
  const TIMEOUT = 3;

  function messageFor(code) {
    if (code === PERMISSION_DENIED) return "위치 권한이 꺼져 있습니다. 주소창의 자물쇠에서 허용해 주세요.";
    if (code === TIMEOUT) return "위치 확인이 지연되고 있습니다. 잠시 후 다시 눌러 주세요.";
    return "현재 위치를 확인할 수 없습니다.";
  }

  return { messageFor };
});
