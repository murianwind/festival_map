"""축제 위치를 좌표 → 도로명주소 → 지번주소 순서로 정한다."""
import datetime as dt
import math
from dataclasses import dataclass

from address_normalizer import KIND_JIBUN, KIND_ROAD, query_candidates

# 한국 본토·제주·울릉도를 넉넉히 포함하는 범위. 0,0 같은 빈 좌표를 걸러내는 용도
LAT_RANGE = (33.0, 39.0)
LON_RANGE = (124.0, 132.0)
FAILED_RETRY_DAYS = 30
SAME_PLACE_KM = 1.0  # 기관마다 같은 장소를 조금씩 다른 좌표로 등록하는 경우를 한 곳으로 본다

SOURCE_COORDS = "coords"
SOURCE_ROAD = "rdnmadr"
SOURCE_JIBUN = "lnmadr"
SOURCE_NONE = "none"


@dataclass(frozen=True)
class Location:
    lat: float | None
    lon: float | None
    source: str


def distance_km(a, b):
    """두 Location 사이 거리(하버사인)."""
    lat1, lat2 = math.radians(a.lat), math.radians(b.lat)
    d_lat, d_lon = lat2 - lat1, math.radians(b.lon - a.lon)
    h = math.sin(d_lat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(d_lon / 2) ** 2
    return 6371.0 * 2 * math.asin(math.sqrt(h))


def parse_coords(lat_text, lon_text):
    """원본 좌표 문자열을 읽는다. 비었거나 한국 범위 밖이면 None."""
    try:
        lat, lon = float(lat_text), float(lon_text)
    except (TypeError, ValueError):
        return None
    if LAT_RANGE[0] <= lat <= LAT_RANGE[1] and LON_RANGE[0] <= lon <= LON_RANGE[1]:
        return lat, lon
    return None


class FestivalLocator:
    """geocoder.search(query) -> (lat, lon) | None 를 캐시와 함께 사용한다.

    cache 형식: {query: {"lat": float|None, "lon": float|None, "checkedAt": "YYYY-MM-DD"}}
    성공 결과는 계속 쓰고, 실패 결과는 FAILED_RETRY_DAYS가 지나면 다시 검색한다.
    """

    def __init__(self, geocoder, cache, today):
        self._geocoder = geocoder
        self._cache = cache
        self._today = today

    def _cached(self, query):
        entry = self._cache.get(query)
        if entry is None:
            return None, False
        if entry.get("lat") is not None:
            return (entry["lat"], entry["lon"]), True
        checked = dt.date.fromisoformat(entry.get("checkedAt", "1970-01-01"))
        still_fresh = (self._today - checked).days < FAILED_RETRY_DAYS
        return None, still_fresh

    def _search(self, query):
        result, hit = self._cached(query)
        if hit:
            return result
        result = self._geocoder.search(query)
        lat, lon = result if result else (None, None)
        self._cache[query] = {"lat": lat, "lon": lon, "checkedAt": self._today.isoformat()}
        return result

    def _search_address(self, raw, kind):
        for query in query_candidates(raw, kind):
            result = self._search(query)
            if result:
                return result
        return None

    def locate(self, row):
        coords = parse_coords(row.get("latitude"), row.get("longitude"))
        if coords:
            return Location(coords[0], coords[1], SOURCE_COORDS)
        for field, kind, source in (
            ("rdnmadr", KIND_ROAD, SOURCE_ROAD),
            ("lnmadr", KIND_JIBUN, SOURCE_JIBUN),
        ):
            found = self._search_address(row.get(field), kind)
            if found:
                return Location(found[0], found[1], source)
        return Location(None, None, SOURCE_NONE)

    def locate_all(self, rows):
        """합친 축제의 원본 행마다 위치를 찾아, 1km 안의 위치는 하나로 모은다."""
        found = []
        for row in rows:
            location = self.locate(row)
            if location.lat is None:
                continue
            if all(distance_km(location, known) > SAME_PLACE_KM for known in found):
                found.append(location)
        return found
