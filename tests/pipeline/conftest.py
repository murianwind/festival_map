import datetime as dt

import pytest
from pytest_bdd import given, parsers


@pytest.fixture
def ctx():
    return {"today": dt.date(2026, 9, 27)}


@given(parsers.re(r'오늘은 "(?P<day>[^"]*)"이다'))
def given_today(ctx, day):
    ctx["today"] = dt.date.fromisoformat(day)
