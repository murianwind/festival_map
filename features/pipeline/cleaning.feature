Feature: 수집 데이터 정리
  끝난 축제를 걸러내고 같은 축제를 하나로 합친다.

  Background:
    Given 오늘은 "2026-09-27"이다

  Scenario: 끝난 축제는 저장하지 않는다
    Given 다음 원본 축제들이 있다:
      | fstvlNm | fstvlStartDate | fstvlEndDate | insttCode |
      | 어제끝  | 2026-09-20     | 2026-09-26   | 1         |
      | 오늘끝  | 2026-09-20     | 2026-09-27   | 1         |
    When 데이터를 정리하면
    Then 남은 축제는 "오늘끝"이다

  Scenario: 두 날짜가 모두 지난 날짜 오류는 저장하지 않는다
    Given 다음 원본 축제들이 있다:
      | fstvlNm            | fstvlStartDate | fstvlEndDate | insttCode |
      | 여수밤바다 불꽃축제 | 2025-10-25     | 2024-10-01   | 1         |
      | 미래 오류          | 2026-12-01     | 2026-11-01   | 1         |
    When 데이터를 정리하면
    Then 남은 축제는 "미래 오류"이다

  Scenario: 날짜 미정은 저장한다
    Given 다음 원본 축제들이 있다:
      | fstvlNm   | fstvlStartDate | fstvlEndDate | insttCode |
      | 미정 축제 |                |              | 1         |
    When 데이터를 정리하면
    Then 남은 축제는 "미정 축제"이다

  Scenario: 연도와 회차만 다른 이름은 같은 축제로 합친다
    Given 다음 원본 축제들이 있다:
      | fstvlNm               | fstvlStartDate | fstvlEndDate | insttCode |
      | 2026 태화강마두희축제 | 2026-10-19     | 2026-10-21   | 3690000   |
      | 태화강마두희축제      | 2026-10-19     | 2026-10-21   | 6310000   |
      | 제5회 태화강 마두희축제 | 2026-10-19   | 2026-10-21   | B551011   |
    When 데이터를 정리하면
    Then 남은 축제는 1건이다

  Scenario: 이름이 같아도 날짜가 다르면 합치지 않는다
    Given 다음 원본 축제들이 있다:
      | fstvlNm       | fstvlStartDate | fstvlEndDate | insttCode |
      | 김천황금시장 황금포차 | 2026-10-23 | 2026-10-24 | 5060000 |
      | 김천황금시장 황금포차 | 2026-11-04 | 2026-11-05 | 5060000 |
    When 데이터를 정리하면
    Then 남은 축제는 2건이다

  Scenario: 합칠 때 지자체 등록 건을 우선하고 빈 필드는 다른 건에서 채운다
    Given 다음 원본 축제들이 있다:
      | fstvlNm          | fstvlStartDate | fstvlEndDate | insttCode | homepageUrl                   | opar                    |
      | 금산세계인삼축제 | 2026-10-02     | 2026-10-11   | B551011   | http://www.insamfestival.co.kr | 금산세계인삼엑스포 광장 |
      | 금산세계인삼축제 | 2026-10-02     | 2026-10-11   | 4550000   |                               | 금산인삼관 광장         |
    When 데이터를 정리하면
    Then 남은 축제는 1건이다
    And 남은 축제의 "insttCode"는 "4550000"이다
    And 남은 축제의 "opar"는 "금산인삼관 광장"이다
    And 남은 축제의 "homepageUrl"는 "http://www.insamfestival.co.kr"이다
