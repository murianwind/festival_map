from pytest_bdd import given, parsers, scenarios, then, when

from date_status import date_status

scenarios("date_status.feature")


@given(parsers.re(r'원본 시작일 "(?P<start>[^"]*)"와 종료일 "(?P<end>[^"]*)"'))
def given_dates(ctx, start, end):
    ctx["start"], ctx["end"] = start, end


@when("날짜 상태를 판정하면")
def when_judge(ctx):
    ctx["status"] = date_status(ctx["start"], ctx["end"])


@then(parsers.re(r'날짜 상태는 "(?P<status>[^"]*)"이다'))
def then_status(ctx, status):
    assert ctx["status"] == status
