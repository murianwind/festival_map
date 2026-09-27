"""정리된 원본 행을 화면용 저장 레코드로 바꾼다."""
import hashlib

from festival_cleaner import normalize_name
from homepage_links import to_links

# 화면(팝업·사이드바)에 표시하는 필드
DISPLAY_FIELDS = ("name", "place", "content", "homepages")


def _stable_id(row):
    key = "|".join((normalize_name(row.get("fstvlNm")), row.get("fstvlStartDate") or "",
                    row.get("fstvlEndDate") or ""))
    return hashlib.sha1(key.encode("utf-8")).hexdigest()[:12]


def to_record(row, location, region):
    return {
        "id": _stable_id(row),
        "name": (row.get("fstvlNm") or "").strip(),
        "place": (row.get("opar") or "").strip(),
        "content": (row.get("fstvlCo") or "").strip(),
        "homepages": to_links(row.get("homepageUrl")),
        "start": (row.get("fstvlStartDate") or "").strip(),
        "end": (row.get("fstvlEndDate") or "").strip(),
        "dateStatus": row["dateStatus"],
        "lat": location.lat,
        "lon": location.lon,
        "locationSource": location.source,
        "region": region,
    }
