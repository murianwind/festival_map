from pytest_bdd import given, parsers, scenarios, then, when

from festival_cleaner import clean_rows

scenarios("cleaning.feature")


@given("다음 원본 축제들이 있다:")
def given_rows(ctx, datatable):
    header, *body = datatable
    ctx["rows"] = [dict(zip(header, row)) for row in body]


@when("데이터를 정리하면")
def when_clean(ctx):
    ctx["result"] = clean_rows(ctx["rows"], ctx["today"])


@then(parsers.re(r'남은 축제는 "(?P<name>[^"]*)"이다'))
def then_only(ctx, name):
    assert [r["fstvlNm"] for r in ctx["result"]] == [name]


@then(parsers.re(r"남은 축제는 (?P<count>\d+)건이다"))
def then_count(ctx, count):
    assert len(ctx["result"]) == int(count)


@then(parsers.re(r'남은 축제의 "(?P<field>[^"]*)"는 "(?P<value>[^"]*)"이다'))
def then_field(ctx, field, value):
    assert ctx["result"][0][field] == value


@then(parsers.re(r"남은 축제의 원본 행은 (?P<count>\d+)개다"))
def then_members(ctx, count):
    assert len(ctx["result"][0]["_members"]) == int(count)
