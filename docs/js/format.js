/** 축제 표시 필드(축제명·개최장소·내용·홈페이지) HTML 생성. 팝업과 사이드바가 같이 쓴다. */
(function (root) {
  "use strict";
  const { googleSearchUrl } = root.SearchLink;

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

  /** place/content/homepages와 구글 검색 버튼. 축제명은 호출하는 쪽에서 제목으로 쓴다. */
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
    // 같은 카드에 축제가 여러 개일 수 있어, 읽어주는 이름에 축제명을 넣어 구분한다
    rows.push(`<a class="fb-search" href="${escapeHtml(googleSearchUrl(festival.name))}" target="_blank" rel="noopener noreferrer"
      aria-label="${escapeHtml(festival.name)} 구글에서 검색">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
      구글에서 검색</a>`);
    return rows.join("");
  }

  root.FestivalFormat = { escapeHtml, festivalBody };
})(window);
