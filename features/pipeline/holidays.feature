Feature: 공휴일 캘린더 읽기
  구글 캘린더 ICS에서 공휴일 날짜를 뽑는다.

  Scenario: 하루짜리 종일 일정
    Given ICS 내용이 다음과 같다:
      """
      BEGIN:VCALENDAR
      BEGIN:VEVENT
      DTSTART;VALUE=DATE:20261003
      DTEND;VALUE=DATE:20261004
      SUMMARY:개천절
      END:VEVENT
      BEGIN:VEVENT
      DTSTART;VALUE=DATE:20261005
      DTEND;VALUE=DATE:20261006
      SUMMARY:대체공휴일(개천절)
      END:VEVENT
      END:VCALENDAR
      """
    When 공휴일을 읽으면
    Then 공휴일은 "2026-10-03, 2026-10-05"이다
    And "2026-10-03"의 이름은 "개천절"이다

  Scenario: 여러 날에 걸친 일정은 모든 날짜가 공휴일이다
    Given ICS 내용이 다음과 같다:
      """
      BEGIN:VCALENDAR
      BEGIN:VEVENT
      DTSTART;VALUE=DATE:20260924
      DTEND;VALUE=DATE:20260927
      SUMMARY:추석 연휴
      END:VEVENT
      END:VCALENDAR
      """
    When 공휴일을 읽으면
    Then 공휴일은 "2026-09-24, 2026-09-25, 2026-09-26"이다

  Scenario: 지난 해 공휴일은 버린다
    Given ICS 내용이 다음과 같다:
      """
      BEGIN:VCALENDAR
      BEGIN:VEVENT
      DTSTART;VALUE=DATE:20251225
      DTEND;VALUE=DATE:20251226
      SUMMARY:기독탄신일
      END:VEVENT
      BEGIN:VEVENT
      DTSTART;VALUE=DATE:20261225
      DTEND;VALUE=DATE:20261226
      SUMMARY:기독탄신일
      END:VEVENT
      END:VCALENDAR
      """
    And 오늘은 "2026-09-27"이다
    When 올해 이후 공휴일만 읽으면
    Then 공휴일은 "2026-12-25"이다
