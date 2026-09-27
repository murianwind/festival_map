from pytest_bdd import given, parsers, scenarios, then, when

from festival_locator import FestivalLocator

scenarios("location.feature")


class FakeGeocoder:
    def __init__(self):
        self.results = {}
        self.calls = 0

    def search(self, query):
        self.calls += 1
        return self.results.get(query)


def _locator(ctx):
    geocoder = ctx.setdefault("geocoder", FakeGeocoder())
    cache = ctx.setdefault("cache", {})
    return FestivalLocator(geocoder, cache, ctx["today"])


def _row(ctx):
    return ctx.setdefault("row", {"latitude": "", "longitude": "", "rdnmadr": "", "lnmadr": ""})


@given("주소 검색 결과가 다음과 같다:")
def given_results(ctx, datatable):
    geocoder = ctx.setdefault("geocoder", FakeGeocoder())
    for query, lat, lon in datatable[1:]:
        geocoder.results[query] = (float(lat), float(lon))


@given(parsers.re(r'축제의 좌표는 "(?P<lat>[^"]*)", "(?P<lon>[^"]*)"이다'))
def given_coords(ctx, lat, lon):
    _row(ctx).update(latitude=lat, longitude=lon)


@given(parsers.re(r'축제의 도로명주소는 "(?P<addr>[^"]*)"이다'))
def given_road(ctx, addr):
    _row(ctx)["rdnmadr"] = addr


@given(parsers.re(r'축제의 지번주소는 "(?P<addr>[^"]*)"이다'))
def given_jibun(ctx, addr):
    _row(ctx)["lnmadr"] = addr


@given(parsers.re(r'좌표가 없고 도로명주소가 "(?P<addr>[^"]*)"인 축제가 (?P<count>\d+)개 있다'))
def given_many(ctx, addr, count):
    ctx["rows"] = [
        {"latitude": "", "longitude": "", "rdnmadr": addr, "lnmadr": ""} for _ in range(int(count))
    ]


@given(parsers.re(r'"(?P<query>[^"]*)" 검색이 "(?P<day>[^"]*)"에 실패한 기록이 캐시에 있다'))
def given_failed_cache(ctx, query, day):
    ctx.setdefault("cache", {})[query] = {"lat": None, "lon": None, "checkedAt": day}


@when("위치를 결정하면")
def when_locate(ctx):
    ctx["location"] = _locator(ctx).locate(_row(ctx))


@when("모든 축제의 위치를 결정하면")
def when_locate_all(ctx):
    locator = _locator(ctx)
    ctx["locations"] = [locator.locate(row) for row in ctx["rows"]]


@then(parsers.re(r"위치는 (?P<lat>[\d.]+), (?P<lon>[\d.]+)이다"))
def then_position(ctx, lat, lon):
    loc = ctx["location"]
    assert (loc.lat, loc.lon) == (float(lat), float(lon))


@then("위치는 없다")
def then_no_position(ctx):
    assert ctx["location"].lat is None and ctx["location"].lon is None


@then(parsers.re(r'위치 출처는 "(?P<source>[^"]*)"이다'))
def then_source(ctx, source):
    assert ctx["location"].source == source


@then(parsers.re(r"주소 검색은 (?P<count>\d+)회 호출된다"))
def then_calls(ctx, count):
    assert ctx.get("geocoder", FakeGeocoder()).calls == int(count)
