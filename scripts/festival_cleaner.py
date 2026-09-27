"""수집한 원본 축제 행을 정리한다: 끝난 축제 제거, 같은 축제 병합."""
import re

from date_status import STATUS_INVALID, STATUS_OK, date_status, parse_iso_date

TOURISM_ORG_CODE = "B551011"  # 한국관광공사 - 지자체 등록 건이 있으면 그쪽을 우선한다
_MERGE_FILL_FIELDS = (
    "opar", "fstvlCo", "homepageUrl", "rdnmadr", "lnmadr", "latitude", "longitude",
)
_YEAR = re.compile(r"(19|20)\d{2}\s*년?")
_ORDINAL = re.compile(r"제?\s*\d+\s*회")
_BRACKETS = re.compile(r"[\(\[<〈「].*?[\)\]>〉」]")
_NON_WORD = re.compile(r"[^0-9A-Za-z가-힣]")


def normalize_name(name):
    """연도·회차·괄호·공백·기호를 뺀 비교용 축제명."""
    text = _BRACKETS.sub("", name or "")
    text = _YEAR.sub("", text)
    text = _ORDINAL.sub("", text)
    return _NON_WORD.sub("", text)


def is_expired(row, today):
    """오늘 이전에 확실히 끝난 축제인지. 날짜 미정은 끝났다고 볼 수 없다."""
    status = row["dateStatus"]
    start, end = parse_iso_date(row.get("fstvlStartDate")), parse_iso_date(row.get("fstvlEndDate"))
    if status == STATUS_OK:
        return end < today
    if status == STATUS_INVALID:
        # 두 날짜가 모두 읽히고 모두 지났다면 어느 쪽이 맞든 이미 끝난 축제다
        return start is not None and end is not None and start < today and end < today
    return False


def _preference(row):
    """병합 시 대표로 삼을 우선순위. 지자체 등록 > 좌표 있음 > 홈페이지 있음."""
    return (
        row.get("insttCode") != TOURISM_ORG_CODE,
        bool((row.get("latitude") or "").strip()),
        bool((row.get("homepageUrl") or "").strip()),
    )


def _merge(group):
    best = dict(max(group, key=_preference))
    for field in _MERGE_FILL_FIELDS:
        if not (best.get(field) or "").strip():
            for other in group:
                if (other.get(field) or "").strip():
                    best[field] = other[field]
                    break
    return best


def dedupe(rows):
    """이름(정규화)과 기간이 같은 행을 하나로 합친다. 원래 순서를 유지한다."""
    groups = {}
    for row in rows:
        key = (normalize_name(row.get("fstvlNm")), row.get("fstvlStartDate"), row.get("fstvlEndDate"))
        groups.setdefault(key, []).append(row)
    return [_merge(group) for group in groups.values()]


def clean_rows(rows, today):
    """날짜 상태를 붙이고, 끝난 축제를 빼고, 중복을 합친다."""
    tagged = []
    for row in rows:
        row = dict(row)
        row["dateStatus"] = date_status(row.get("fstvlStartDate"), row.get("fstvlEndDate"))
        if not is_expired(row, today):
            tagged.append(row)
    return dedupe(tagged)
