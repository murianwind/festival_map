import json

from pytest_bdd import given, parsers, scenarios, then, when

from kakao_geocoder import KakaoGeocoder

scenarios("geocoder.feature")


class FakeHttp:
    def __init__(self, documents):
        self.documents = documents
        self.headers = None

    def __call__(self, url, headers=None, **_):
        self.headers = headers
        return json.dumps({"documents": self.documents})


@given(parsers.re(r'카카오 응답 문서가 x "(?P<x>[^"]*)", y "(?P<y>[^"]*)"이다'))
def given_doc(ctx, x, y):
    ctx["http"] = FakeHttp([{"x": x, "y": y}])


@given("카카오 응답 문서가 비어 있다")
def given_empty(ctx):
    ctx["http"] = FakeHttp([])


@when(parsers.re(r'"(?P<query>[^"]*)"(을|를) 검색하면'))
def when_search(ctx, query):
    ctx["result"] = KakaoGeocoder("test-key", ctx["http"]).search(query)


@then(parsers.re(r"검색 결과는 (?P<lat>[\d.]+), (?P<lon>[\d.]+)이다"))
def then_result(ctx, lat, lon):
    assert ctx["result"] == (float(lat), float(lon))


@then("검색 결과는 없다")
def then_none(ctx):
    assert ctx["result"] is None


@then(parsers.re(r'요청 헤더에 "(?P<value>[^"]*)"가 들어간다'))
def then_header(ctx, value):
    assert value in ctx["http"].headers.values()
