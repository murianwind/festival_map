"""카카오 로컬 API 주소 검색."""
import json
import urllib.parse

ADDRESS_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/address.json"


class KakaoGeocoder:
    def __init__(self, rest_api_key, get_text):
        self._key = rest_api_key
        self._get_text = get_text

    def search(self, query):
        """(위도, 경도) 또는 None."""
        url = f"{ADDRESS_SEARCH_URL}?query={urllib.parse.quote(query)}&size=1"
        text = self._get_text(
            url, headers={"Authorization": f"KakaoAK {self._key}"}, secrets=(self._key,)
        )
        documents = json.loads(text).get("documents") or []
        if not documents:
            return None
        return float(documents[0]["y"]), float(documents[0]["x"])
