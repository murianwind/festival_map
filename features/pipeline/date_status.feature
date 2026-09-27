Feature: 축제 날짜 상태 판정
  원본 날짜 값으로 정상/날짜 미정/날짜 오류를 구분한다.

  Scenario Outline: 날짜 상태 판정
    Given 원본 시작일 "<start>"와 종료일 "<end>"
    When 날짜 상태를 판정하면
    Then 날짜 상태는 "<status>"이다

    Examples:
      | start      | end        | status  |
      | 2026-10-03 | 2026-10-11 | ok      |
      | 2026-10-03 | 2026-10-03 | ok      |
      |            |            | missing |
      | 2026-10-03 |            | missing |
      |            | 2026-10-03 | missing |
      | 2025-10-25 | 2024-10-01 | invalid |
      | 2026-13-01 | 2026-12-01 | invalid |
      | 2026/10/03 | 2026-10-05 | invalid |
