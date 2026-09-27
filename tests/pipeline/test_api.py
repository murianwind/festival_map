import json
import urllib.parse

from pytest_bdd import given, parsers, scenarios, then, when

from festival_api import FestivalApiError, build_url, fetch_all

scenarios("api.feature")


def _body(items, total, code="00", wrap=False):
    payload = {
        "header": {"resultCode": code, "resultMsg": "msg"},
        "body": {"items": {"item": items}, "totalCount": total},
    }
    return json.dumps({"response": payload} if wrap else payload)


class FakeHttp:
    def __init__(self, pages):
        self.pages = pages
        self.calls = 0

    def __call__(self, url, **_):
        page = int(urllib.parse.parse_qs(urllib.parse.urlparse(url).query)["pageNo"][0])
        self.calls += 1
        return self.pages[page - 1]


@given("API 전체 건수가 3건이고 페이지 크기가 2이다")
def given_pages(ctx):
    ctx["page_size"] = 2
    ctx["http"] = FakeHttp([_body([{"a": 1}, {"a": 2}], 3), _body([{"a": 3}], 3)])


@given("API가 response 래퍼로 감싼 응답을 준다")
def given_wrapped(ctx):
    ctx["http"] = FakeHttp([_body([{"a": 1}], 1, wrap=True)])


@given(parsers.re(r'API가 결과코드 "(?P<code>[^"]*)"을 준다'))
def given_code(ctx, code):
    ctx["http"] = FakeHttp([_body([], 0, code=code)])


@when("축제를 모두 받으면")
def when_fetch(ctx):
    try:
        ctx["rows"] = fetch_all("key", ctx["http"], page_size=ctx.get("page_size", 1000))
    except FestivalApiError as error:
        ctx["error"] = error


@then(parsers.re(r"받은 축제는 (?P<count>\d+)건이다"))
def then_rows(ctx, count):
    assert len(ctx["rows"]) == int(count)


@then(parsers.re(r"API는 (?P<count>\d+)회 호출된다"))
def then_calls(ctx, count):
    assert ctx["http"].calls == int(count)


@then("수집 오류가 난다")
def then_error(ctx):
    assert "error" in ctx


@given(parsers.re(r'서비스키가 "(?P<key>[^"]*)"이다'))
def given_key(ctx, key):
    ctx["key"] = key


@when("요청 주소를 만들면")
def when_url(ctx):
    ctx["url"] = build_url(ctx["key"], page=1, page_size=1000)


@then(parsers.re(r'요청 주소의 serviceKey는 "(?P<key>[^"]*)"이다'))
def then_key(ctx, key):
    assert f"serviceKey={key}&" in ctx["url"]
