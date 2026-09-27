"""수집한 원본 축제 행을 정리한다: 끝난 축제 제거, 같은 축제 병합.

병합은 두 단계다.
  1. 정확히 같은 축제: 정규화한 이름과 기간이 같으면 지역과 무관하게 합친다.
  2. 비슷한 축제: 같은 시도 + 기간 겹침 + 이름이 비슷하면(유사도 또는 포함) 합친다.
합친 행은 '_members'에 원본 행 전부를 담는다(위치를 원본마다 찾기 위해).
"""
import re
from difflib import SequenceMatcher

from date_status import STATUS_INVALID, STATUS_OK, date_status, parse_iso_date
from region_classifier import classify_region

TOURISM_ORG_CODE = "B551011"  # 한국관광공사 - 지자체 등록 건이 있으면 그쪽을 우선한다
_MERGE_FILL_FIELDS = (
    "opar", "fstvlCo", "homepageUrl", "rdnmadr", "lnmadr", "latitude", "longitude",
)
_YEAR = re.compile(r"(19|20)\d{2}\s*년?")
_ORDINAL = re.compile(r"제?\s*\d+\s*회")
_BRACKETS = re.compile(r"[\(\[<〈「].*?[\)\]>〉」]")
_NON_WORD = re.compile(r"[^0-9A-Za-z가-힣]")
_DIGITS = re.compile(r"\d+")

NAME_SIMILARITY = 0.8
MIN_CONTAINED_LENGTH = 4  # '축제'처럼 너무 짧은 이름이 포함 판정에 걸리지 않게


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


def _merge(members):
    """원본 행들을 대표 행 하나로. 빈 필드는 다른 행에서 채우고 기간은 모두를 덮게 넓힌다."""
    best = dict(max(members, key=_preference))
    for field in _MERGE_FILL_FIELDS:
        if not (best.get(field) or "").strip():
            for other in members:
                if (other.get(field) or "").strip():
                    best[field] = other[field]
                    break
    if all(m["dateStatus"] == STATUS_OK for m in members):
        best["fstvlStartDate"] = min(m["fstvlStartDate"] for m in members)
        best["fstvlEndDate"] = max(m["fstvlEndDate"] for m in members)
    best["_members"] = list(members)
    return best


def dedupe(rows):
    """이름(정규화)과 기간이 같은 행을 하나로 합친다. 원래 순서를 유지한다."""
    groups = {}
    for row in rows:
        key = (normalize_name(row.get("fstvlNm")), row.get("fstvlStartDate"), row.get("fstvlEndDate"))
        groups.setdefault(key, []).append(row)
    return [_merge(group) for group in groups.values()]


def similar_names(a, b):
    """정규화한 이름끼리 비교. 숫자만 다른 이름(콘서트1/콘서트2)은 다른 축제로 본다."""
    if not a or not b:
        return False
    if a != b and _DIGITS.sub("", a) == _DIGITS.sub("", b):
        return False
    shorter, longer = sorted((a, b), key=len)
    if len(shorter) >= MIN_CONTAINED_LENGTH and shorter in longer:
        return True
    return SequenceMatcher(None, a, b).ratio() >= NAME_SIMILARITY


def _region(row):
    return classify_region(row.get("rdnmadr"), row.get("lnmadr"), row.get("insttNm"))


def _periods_overlap(a, b):
    # ISO 날짜 문자열은 사전순 비교가 곧 날짜 비교다
    return a["fstvlStartDate"] <= b["fstvlEndDate"] and b["fstvlStartDate"] <= a["fstvlEndDate"]


def is_same_festival(a, b):
    return (
        a["dateStatus"] == STATUS_OK
        and b["dateStatus"] == STATUS_OK
        and _region(a) == _region(b)
        and _periods_overlap(a, b)
        and similar_names(normalize_name(a.get("fstvlNm")), normalize_name(b.get("fstvlNm")))
    )


def merge_similar(rows):
    """dedupe 결과를 한 번 더 훑어 비슷한 축제를 합친다."""
    merged = []
    for row in rows:
        for index, existing in enumerate(merged):
            if is_same_festival(existing, row):
                merged[index] = _merge(existing["_members"] + row["_members"])
                break
        else:
            merged.append(row)
    return merged


def clean_rows(rows, today):
    """날짜 상태를 붙이고, 끝난 축제를 빼고, 중복을 합친다."""
    tagged = []
    for row in rows:
        row = dict(row)
        row["dateStatus"] = date_status(row.get("fstvlStartDate"), row.get("fstvlEndDate"))
        if not is_expired(row, today):
            tagged.append(row)
    return merge_similar(dedupe(tagged))
