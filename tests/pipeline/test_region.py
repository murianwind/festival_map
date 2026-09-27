from pytest_bdd import given, parsers, scenarios, then, when

from region_classifier import classify_region

scenarios("region.feature")


@given(
    parsers.re(
        r'도로명주소 "(?P<rdnmadr>[^"]*)", 지번주소 "(?P<lnmadr>[^"]*)", '
        r'등록기관 "(?P<insttNm>[^"]*)"인 축제'
    )
)
def given_festival(ctx, rdnmadr, lnmadr, insttNm):
    ctx["row"] = {"rdnmadr": rdnmadr, "lnmadr": lnmadr, "insttNm": insttNm}


@when("지역을 판정하면")
def when_classify(ctx):
    row = ctx["row"]
    ctx["region"] = classify_region(row["rdnmadr"], row["lnmadr"], row["insttNm"])


@then(parsers.re(r'지역은 "(?P<region>[^"]*)"이다'))
def then_region(ctx, region):
    assert ctx["region"] == region
