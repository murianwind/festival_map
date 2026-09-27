from pytest_bdd import given, parsers, scenarios, then, when

from holiday_source import holidays_from_year, parse_ics

scenarios("holidays.feature")


@given("ICS 내용이 다음과 같다:")
def given_ics(ctx, docstring):
    ctx["ics"] = docstring


@when("공휴일을 읽으면")
def when_parse(ctx):
    ctx["holidays"] = parse_ics(ctx["ics"])


@when("올해 이후 공휴일만 읽으면")
def when_parse_from_year(ctx):
    ctx["holidays"] = holidays_from_year(parse_ics(ctx["ics"]), ctx["today"].year)


@then(parsers.re(r'공휴일은 "(?P<days>[^"]*)"이다'))
def then_days(ctx, days):
    assert sorted(ctx["holidays"]) == [d.strip() for d in days.split(",")]


@then(parsers.re(r'"(?P<day>[^"]*)"의 이름은 "(?P<name>[^"]*)"이다'))
def then_name(ctx, day, name):
    assert ctx["holidays"][day] == name
