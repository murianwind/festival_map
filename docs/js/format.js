/** 축제 표시 필드(축제명·개최장소·내용·홈페이지) HTML 생성. 팝업과 사이드바가 같이 쓴다. */
(function (root) {
  "use strict";

  function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  function linkLabel(url) {
    try {
      const u = new URL(url);
      return decodeURIComponent(u.hostname.replace(/^www\./, ""));
    } catch {
      return url;
    }
  }

  /** place/content/homepages 부분. 축제명은 호출하는 쪽에서 제목으로 쓴다. */
  function festivalBody(festival) {
    const rows = [];
    if (festival.place) rows.push(`<p class="fb-place">${escapeHtml(festival.place)}</p>`);
    if (festival.content) rows.push(`<p class="fb-content">${escapeHtml(festival.content)}</p>`);
    if (festival.homepages && festival.homepages.length) {
      const links = festival.homepages
        .map((url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(linkLabel(url))}</a>`)
        .join("");
      rows.push(`<p class="fb-links">${links}</p>`);
    }
    return rows.join("");
  }

  root.FestivalFormat = { escapeHtml, festivalBody };
})(window);
