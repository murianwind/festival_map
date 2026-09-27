"""축제 원본 날짜 값의 상태(정상/미정/오류)를 판정한다."""
import datetime as dt
import re

_ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

STATUS_OK = "ok"
STATUS_MISSING = "missing"
STATUS_INVALID = "invalid"


def parse_iso_date(value):
    """'YYYY-MM-DD' 문자열을 date로 바꾼다. 형식이 틀리거나 없는 날짜면 None."""
    text = (value or "").strip()
    if not _ISO_DATE.match(text):
        return None
    try:
        return dt.date.fromisoformat(text)
    except ValueError:
        return None


def date_status(start, end):
    """시작/종료일 중 하나라도 비어 있으면 미정, 형식 오류나 역전이면 오류."""
    if not (start or "").strip() or not (end or "").strip():
        return STATUS_MISSING
    start_date, end_date = parse_iso_date(start), parse_iso_date(end)
    if start_date is None or end_date is None or end_date < start_date:
        return STATUS_INVALID
    return STATUS_OK
