"""전국문화축제표준데이터 OpenAPI 수집."""
import json
import urllib.parse

API_URL = "https://api.data.go.kr/openapi/tn_pubr_public_cltur_fstvl_api"
PAGE_SIZE = 1000
_OK_CODES = {"00"}
_NO_DATA_CODES = {"03"}


class FestivalApiError(RuntimeError):
    pass


def build_url(service_key, page, page_size):
    # GitHub Secret에 이미 인코딩된 키를 넣은 경우 이중 인코딩되지 않게 한 번 풀었다가 인코딩
    key = urllib.parse.quote(urllib.parse.unquote(service_key), safe="")
    return f"{API_URL}?serviceKey={key}&pageNo={page}&numOfRows={page_size}&type=json"


def _parse_page(text):
    try:
        data = json.loads(text)
    except json.JSONDecodeError as error:
        raise FestivalApiError(f"JSON이 아닌 응답: {text[:200]}") from error
    data = data.get("response", data)
    header, body = data.get("header", {}), data.get("body", {})
    code = str(header.get("resultCode", ""))
    if code in _NO_DATA_CODES:
        return [], 0
    if code not in _OK_CODES:
        raise FestivalApiError(f"API 오류 {code}: {header.get('resultMsg', '')}")
    items = (body.get("items") or {}).get("item") or []
    if isinstance(items, dict):
        items = [items]
    return items, int(body.get("totalCount") or 0)


def fetch_all(service_key, get_text, page_size=PAGE_SIZE):
    """전체 페이지를 받아 원본 행 목록으로 돌려준다."""
    rows, page = [], 1
    while True:
        text = get_text(build_url(service_key, page, page_size), secrets=(service_key,))
        items, total = _parse_page(text)
        rows.extend(items)
        if not items or len(rows) >= total:
            return rows
        page += 1
