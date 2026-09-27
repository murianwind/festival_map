"""구글 캘린더 '대한민국의 공휴일' ICS에서 공휴일 날짜를 읽는다."""
import datetime as dt
import re

HOLIDAY_ICS_URL = (
    "https://calendar.google.com/calendar/ical/"
    "l9ijikc83v1ne5s61er6tava4iplm8id%40import.calendar.google.com/public/basic.ics"
)

_EVENT = re.compile(r"BEGIN:VEVENT(.*?)END:VEVENT", re.S)
_START = re.compile(r"^DTSTART;VALUE=DATE:(\d{8})", re.M)
_END = re.compile(r"^DTEND;VALUE=DATE:(\d{8})", re.M)
_SUMMARY = re.compile(r"^SUMMARY:(.*)$", re.M)


def _to_date(yyyymmdd):
    return dt.datetime.strptime(yyyymmdd, "%Y%m%d").date()


def parse_ics(text):
    """{'YYYY-MM-DD': 이름}. 종일 일정만 읽으며 DTEND는 그날을 포함하지 않는다."""
    unfolded = text.replace("\r\n", "\n").replace("\n ", "").replace("\n\t", "")
    holidays = {}
    for body in _EVENT.findall(unfolded):
        start_match, summary_match = _START.search(body), _SUMMARY.search(body)
        if not start_match:
            continue
        start = _to_date(start_match.group(1))
        end_match = _END.search(body)
        end = _to_date(end_match.group(1)) if end_match else start + dt.timedelta(days=1)
        name = summary_match.group(1).strip() if summary_match else ""
        day = start
        while day < end:
            holidays[day.isoformat()] = name
            day += dt.timedelta(days=1)
    return holidays


def holidays_from_year(holidays, year):
    """year년 1월 1일 이후 공휴일만 남긴다."""
    first_day = f"{year:04d}-01-01"
    return {day: name for day, name in holidays.items() if day >= first_day}
