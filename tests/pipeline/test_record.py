from pytest_bdd import given, parsers, scenarios, then, when

from festival_record import DISPLAY_FIELDS, to_record
from festival_locator import Location

scenarios("record.feature")


@given(parsers.re(r'원본 축제 "(?P<name>[^"]*)"가 모든 필드를 가지고 있다'))
def given_full_row(ctx, name):
    ctx["row"] = {
        "fstvlNm": name,
        "opar": "서울 암사동 유적",
        "fstvlStartDate": "2026-10-16",
        "fstvlEndDate": "2026-10-18",
        "fstvlCo": "개폐막식+축하공연",
        "mnnstNm": "서울특별시 강동구",
        "auspcInsttNm": "서울특별시 강동구",
        "suprtInsttNm": "",
        "phoneNumber": "02-3425-5240",
        "homepageUrl": "https://www.gdsunsa.com/",
        "relateInfo": "",
        "rdnmadr": "서울특별시 강동구 올림픽로 875",
        "lnmadr": "서울특별시 강동구 암사동 139-2",
        "latitude": "37.55985381",
        "longitude": "127.1308316",
        "referenceDate": "2026-06-16",
        "insttCode": "B551011",
        "insttNm": "한국관광공사",
        "dateStatus": "ok",
    }


@when("저장 레코드로 변환하면")
def when_convert(ctx):
    location = Location(37.55985381, 127.1308316, "coords")
    ctx["record"] = to_record(ctx["row"], [location], "서울특별시")


@when(parsers.re(r"위치 (?P<count>\d+)곳으로 저장 레코드를 만들면"))
def when_convert_many(ctx, count):
    locations = [Location(34.5 + i, 126.3, "coords") for i in range(int(count))]
    ctx["record"] = to_record(ctx["row"], locations, "전남광주통합특별시")


@then(parsers.re(r"레코드의 위치는 (?P<count>\d+)개다"))
def then_record_locations(ctx, count):
    assert len(ctx["record"]["locations"]) == int(count)


@then(parsers.re(r'레코드의 표시 필드는 "(?P<fields>[^"]*)"이다'))
def then_display_fields(ctx, fields):
    expected = [f.strip() for f in fields.split(",")]
    assert list(DISPLAY_FIELDS) == expected
    for field in expected:
        assert field in ctx["record"]


@then("레코드에는 전화번호와 주관기관이 없다")
def then_no_extra(ctx):
    serialized = str(ctx["record"])
    assert "02-3425-5240" not in serialized
    assert "mnnstNm" not in ctx["record"] and "phoneNumber" not in ctx["record"]
