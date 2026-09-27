from pytest_bdd import given, parsers, scenarios, then, when

from address_normalizer import normalize_address, query_candidates

scenarios("address.feature")


@given(parsers.re(r'도로명주소 "(?P<raw>[^"]*)"'))
def given_road(ctx, raw):
    ctx["raw"], ctx["kind"] = raw, "road"


@given(parsers.re(r'지번주소 "(?P<raw>[^"]*)"'))
def given_jibun(ctx, raw):
    ctx["raw"], ctx["kind"] = raw, "jibun"


@when("검색어로 정리하면")
def when_normalize(ctx):
    ctx["query"] = normalize_address(ctx["raw"], ctx["kind"])


@when("검색어 후보를 만들면")
def when_candidates(ctx):
    ctx["candidates"] = query_candidates(ctx["raw"], ctx["kind"])


@then(parsers.re(r'검색어는 "(?P<query>[^"]*)"이다'))
def then_query(ctx, query):
    assert ctx["query"] == query


@then(parsers.re(r'검색어 후보는 "(?P<expected>[^"]*)"이다'))
def then_candidates(ctx, expected):
    assert ctx["candidates"] == [s.strip() for s in expected.split(",")]
