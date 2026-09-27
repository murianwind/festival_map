"""주소 문자열을 카카오 주소 검색용 검색어로 정리한다."""
import re

KIND_ROAD = "road"
KIND_JIBUN = "jibun"

_PARENS = re.compile(r"\(.*?\)")
_NOISE_WORDS = re.compile(r"번지|일원|일대")
_SPACES = re.compile(r"\s+")
_NUMBER_END = r"(?=$|[\s,])"
# 도로명: '...로 12' 또는 '...길 12-3' 까지 (뒤의 동/층/시설명은 버림)
_ROAD_TAIL = re.compile(r"^(.*?(?:로|길)\s*\d+(?:-\d+)?)" + _NUMBER_END)
# 지번: '...동 12-3', '...리 산 76-6', '...가 11-1' 까지
_JIBUN_TAIL = re.compile(r"^(.*?(?:동|리|가)\s*(?:산\s*)?\d+(?:-\d+)?)" + _NUMBER_END)

_MERGED_SIDO = "전남광주통합특별시"
_FORMER_JEONNAM = "전라남도"
_FORMER_GWANGJU = "광주광역시"


def _basic_cleanup(raw):
    text = (raw or "").split("+")[0]
    text = _PARENS.sub(" ", text)
    text = _NOISE_WORDS.sub(" ", text)
    return _SPACES.sub(" ", text).strip(" ,")


def normalize_address(raw, kind):
    """부가설명·여러 주소·건물 내 위치를 떼어낸 검색어. 빈 주소면 빈 문자열."""
    text = _basic_cleanup(raw)
    pattern = _ROAD_TAIL if kind == KIND_ROAD else _JIBUN_TAIL
    match = pattern.match(text)
    return match.group(1).strip() if match else text


def _former_name_variant(query):
    """통합특별시 주소를 옛 시도명으로 바꾼 검색어. 해당 없으면 None."""
    parts = query.split(" ", 2)
    if len(parts) < 2 or parts[0] != _MERGED_SIDO:
        return None
    # 옛 광주광역시는 자치구(○○구), 옛 전라남도는 시·군
    former = _FORMER_GWANGJU if parts[1].endswith("구") else _FORMER_JEONNAM
    return " ".join([former] + parts[1:])


def query_candidates(raw, kind):
    """검색 시도 순서대로의 검색어 목록."""
    query = normalize_address(raw, kind)
    if not query:
        return []
    candidates = [query]
    variant = _former_name_variant(query)
    if variant:
        candidates.append(variant)
    return candidates
