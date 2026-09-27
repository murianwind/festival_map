from pytest_bdd import given, parsers, scenarios, then, when

from fetch_festivals import run_pipeline

scenarios("pipeline.feature")


def _raw(i):
    return {
        "fstvlNm": f"축제{i}", "fstvlStartDate": "2026-10-10", "fstvlEndDate": "2026-10-11",
        "latitude": "37.5", "longitude": "127.0", "rdnmadr": "서울특별시 중구 세종대로 110",
        "lnmadr": "", "insttNm": "서울특별시", "insttCode": "1",
    }


class NoGeocoder:
    def search(self, query):
        return None


@given(parsers.re(r"이전 저장 파일에 축제가 (?P<count>\d+)건 있다"))
def given_previous(ctx, count):
    ctx["previous"] = {"festivals": [{}] * int(count), "holidays": {}}


@given(parsers.re(r'이전 저장 파일의 공휴일이 "(?P<day>[^"]*)"이다'))
def given_previous_holidays(ctx, day):
    ctx["previous"] = {"festivals": [], "holidays": {day: "개천절"}}


@given("이번 수집 원본이 0건이다")
def given_empty(ctx):
    ctx["rows"] = []


@given(parsers.re(r"이번 수집 결과 축제가 (?P<count>\d+)건이다"))
def given_rows(ctx, count):
    ctx["rows"] = [_raw(i) for i in range(int(count))]


@given("공휴일 캘린더 받기가 실패한다")
def given_holiday_fail(ctx):
    ctx["holiday_fails"] = True


@when("수집을 실행하면")
def when_run(ctx):
    def fetch_holidays():
        if ctx.get("holiday_fails"):
            raise RuntimeError("down")
        return {"2026-12-25": "기독탄신일"}

    ctx["output"] = run_pipeline(
        today=ctx["today"],
        fetch_rows=lambda: ctx["rows"],
        fetch_holidays=fetch_holidays,
        geocoder=NoGeocoder(),
        cache={},
        previous=ctx.get("previous"),
        generated_at="2026-09-27T05:00:00+09:00",
    )


@then("저장하지 않는다")
def then_not_saved(ctx):
    assert ctx["output"] is None


@then("저장한다")
def then_saved(ctx):
    assert ctx["output"] is not None


@then(parsers.re(r'저장한 공휴일은 "(?P<day>[^"]*)"이다'))
def then_holidays(ctx, day):
    assert list(ctx["output"]["holidays"]) == [day]


@then(parsers.re(r'저장한 요약의 위치 출처 "(?P<source>[^"]*)" 건수는 (?P<count>\d+)이다'))
def then_stats(ctx, source, count):
    assert ctx["output"]["meta"]["locationSources"][source] == int(count)
