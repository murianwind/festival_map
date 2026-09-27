/** 지도 위 상세 카드. 같은 장소의 축제가 여러 개면 모두 보여준다. */
(function (root) {
  "use strict";
  const { escapeHtml, festivalBody } = root.FestivalFormat;

  function createDetailCard(el, onClose) {
    function hide() {
      el.hidden = true;
      el.innerHTML = "";
    }

    function show(festivals) {
      el.innerHTML = `
        <button type="button" class="detail-close" aria-label="닫기">×</button>
        <div class="detail-scroll">
          ${festivals.map((f) => `
            <article class="detail-item">
              <h3>${escapeHtml(f.name)}</h3>
              ${festivalBody(f)}
            </article>`).join("")}
        </div>`;
      el.hidden = false;
      el.querySelector(".detail-close").addEventListener("click", () => { hide(); onClose(); });
      el.querySelector(".detail-close").focus({ preventScroll: true });
    }

    return { show, hide };
  }

  root.FestivalDetail = { createDetailCard };
})(window);
