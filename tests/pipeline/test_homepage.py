from pytest_bdd import given, parsers, scenarios, then, when

from homepage_links import to_links

scenarios("homepage.feature")


@given(parsers.re(r'원본 홈페이지 "(?P<raw>[^"]*)"'))
def given_raw(ctx, raw):
    ctx["raw"] = raw


@when("링크로 변환하면")
def when_convert(ctx):
    ctx["links"] = to_links(ctx["raw"])


@then(parsers.re(r'링크 목록은 "(?P<links>[^"]*)"이다'))
def then_links(ctx, links):
    expected = [s.strip() for s in links.split(",")] if links else []
    assert ctx["links"] == expected
