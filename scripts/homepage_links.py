"""원본 homepageUrl 값을 열 수 있는 링크 목록으로 바꾼다."""
import re

_SEPARATORS = re.compile(r"\s+/\s+|\s*,\s*|\s+")
_TRAILING_NOTE = re.compile(r"\(.*$")
_BROKEN_SCHEME = re.compile(r"^(https?):/+", re.IGNORECASE)
_HOST = re.compile(r"^https?://[^/\s]+\.[^/\s]+", re.IGNORECASE)


def _normalize(token):
    url = _TRAILING_NOTE.sub("", token).strip()
    if not url:
        return None
    if _BROKEN_SCHEME.match(url):
        url = _BROKEN_SCHEME.sub(lambda m: f"{m.group(1).lower()}://", url)
    else:
        url = "https://" + url
    return url if _HOST.match(url) else None


def to_links(raw):
    """여러 주소가 섞여 있으면 각각 링크로. 링크로 볼 수 없는 값은 버린다."""
    links = []
    for token in _SEPARATORS.split((raw or "").strip()):
        url = _normalize(token)
        if url and url not in links:
            links.append(url)
    return links
