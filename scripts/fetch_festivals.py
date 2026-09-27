"""축제 데이터 수집 진입점. GitHub Actions(self-hosted 러너)에서 매일 실행한다.

환경변수:
  DATA_GO_KR_SERVICE_KEY  (필수) data.go.kr 서비스키
  KAKAO_REST_API_KEY      (선택) 없으면 주소 검색 없이 원본 좌표만 사용
"""
import collections
import datetime as dt
import os
import sys

import http_client
from festival_api import fetch_all
from festival_cleaner import clean_rows
from festival_locator import FestivalLocator
from festival_record import to_record
from festival_store import is_suspicious_drop, load_json, save_json
from holiday_source import HOLIDAY_ICS_URL, holidays_from_year, parse_ics
from kakao_geocoder import KakaoGeocoder
from region_classifier import classify_region

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUTPUT_PATH = os.path.join(ROOT, "docs", "festivals.json")
CACHE_PATH = os.path.join(ROOT, "data", "geocode_cache.json")
SEOUL = dt.timezone(dt.timedelta(hours=9), "KST")  # 서머타임이 없어 고정 오프셋으로 충분 (tzdata 불필요)
HOLIDAY_WARN_DAYS = 365


class _NoGeocoder:
    def search(self, query):
        return None


def _load_holidays(fetch_holidays, previous, today):
    try:
        return holidays_from_year(fetch_holidays(), today.year), True
    except Exception as error:  # 공휴일은 없어도 주말로 동작하므로 수집 전체를 멈추지 않는다
        print(f"[경고] 공휴일 캘린더를 받지 못해 이전 값을 씁니다: {error}")
        return (previous or {}).get("holidays", {}), False


def run_pipeline(today, fetch_rows, fetch_holidays, geocoder, cache, previous, generated_at):
    """저장할 결과 dict. 결과가 의심스러우면 None."""
    rows = fetch_rows()
    previous_count = len((previous or {}).get("festivals", []))
    if is_suspicious_drop(len(rows), previous_count):
        print(f"[중단] 원본 {len(rows)}건 - 기존 파일을 유지합니다.")
        return None

    holidays, holidays_fresh = _load_holidays(fetch_holidays, previous, today)
    locator = FestivalLocator(geocoder, cache, today)
    records, unresolved = [], []
    for row in clean_rows(rows, today):
        locations = locator.locate_all(row["_members"])
        region = classify_region(row.get("rdnmadr"), row.get("lnmadr"), row.get("insttNm"))
        records.append(to_record(row, locations, region))
        if not locations:
            unresolved.append(f"{row.get('fstvlNm')} | {row.get('rdnmadr')} | {row.get('lnmadr')}")

    if is_suspicious_drop(len(records), previous_count):
        print(f"[중단] 정리 후 {len(records)}건(이전 {previous_count}건) - 기존 파일을 유지합니다.")
        return None

    for line in unresolved:
        print(f"[위치 미확인] {line}")
    coverage_end = max(holidays) if holidays else None
    if coverage_end and coverage_end < (today + dt.timedelta(days=HOLIDAY_WARN_DAYS)).isoformat():
        print(f"[경고] 공휴일 캘린더가 {coverage_end}까지만 있습니다.")

    return {
        "meta": {
            "generatedAt": generated_at,
            "sourceCount": len(rows),
            "festivalCount": len(records),
            "holidaysFresh": holidays_fresh,
            "holidayCoverageEnd": coverage_end,
            "locationSources": dict(collections.Counter(r["locationSource"] for r in records)),
        },
        "holidays": holidays,
        "festivals": records,
    }


def main():
    service_key = os.environ.get("DATA_GO_KR_SERVICE_KEY", "").strip()
    if not service_key:
        print("DATA_GO_KR_SERVICE_KEY가 없습니다.")
        return 1
    kakao_key = os.environ.get("KAKAO_REST_API_KEY", "").strip()
    geocoder = KakaoGeocoder(kakao_key, http_client.get_text) if kakao_key else _NoGeocoder()

    now = dt.datetime.now(SEOUL)
    cache = load_json(CACHE_PATH, {})
    output = run_pipeline(
        today=now.date(),
        fetch_rows=lambda: fetch_all(service_key, http_client.get_text),
        fetch_holidays=lambda: parse_ics(http_client.get_text(HOLIDAY_ICS_URL)),
        geocoder=geocoder,
        cache=cache,
        previous=load_json(OUTPUT_PATH, None),
        generated_at=now.isoformat(timespec="seconds"),
    )
    if kakao_key:
        save_json(CACHE_PATH, cache)  # 결과를 버리더라도 검색 비용은 아낀다
    if output is None:
        return 1
    save_json(OUTPUT_PATH, output)
    print(f"[완료] 축제 {output['meta']['festivalCount']}건, 위치 {output['meta']['locationSources']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
