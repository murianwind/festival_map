/**
 * 축제 이름으로 구글 검색 결과 페이지 주소를 만든다.
 * 브라우저(window.SearchLink)와 Node(require) 양쪽에서 쓴다.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SearchLink = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const GOOGLE_SEARCH = "https://www.google.com/search?q=";

  /** 앞뒤 공백을 떼고 URL 인코딩한다(&, +, # 같은 문자가 주소를 깨지 않게). */
  function googleSearchUrl(name) {
    return GOOGLE_SEARCH + encodeURIComponent(String(name).trim());
  }

  return { googleSearchUrl };
});
