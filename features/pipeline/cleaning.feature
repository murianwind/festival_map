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

  Scenario: 이름이 조금 다른 같은 지역 축제는 합친다
    Given 다음 원본 축제들이 있다:
      | fstvlNm          | fstvlStartDate | fstvlEndDate | insttCode | rdnmadr                                |
      | 천안흥타령축제   | 2026-10-01     | 2026-10-05   | B551011   | 충청남도 천안시 서북구 번영로 208      |
      | 천안흥타령춤축제 | 2026-10-01     | 2026-10-05   | 4490000   | 충청남도 천안시 서북구 번영로 208      |
    When 데이터를 정리하면
    Then 남은 축제는 1건이다
    And 남은 축제의 "fstvlNm"는 "천안흥타령춤축제"이다

  Scenario: 시작일이 하루 다른 같은 축제는 합치고 기간을 넓힌다
    Given 다음 원본 축제들이 있다:
      | fstvlNm                | fstvlStartDate | fstvlEndDate | insttCode | rdnmadr                          |
      | 안동국제탈춤페스티벌   | 2026-10-01     | 2026-10-04   | B551011   | 경상북도 안동시 육사로 239       |
      | 안동국제탈춤페스티벌   | 2026-10-02     | 2026-10-05   | 5070000   | 경상북도 안동시 경동로 684       |
    When 데이터를 정리하면
    Then 남은 축제는 1건이다
    And 남은 축제의 "fstvlStartDate"는 "2026-10-01"이다
    And 남은 축제의 "fstvlEndDate"는 "2026-10-05"이다

  Scenario: 한 이름이 다른 이름을 포함하면 합친다
    Given 다음 원본 축제들이 있다:
      | fstvlNm                       | fstvlStartDate | fstvlEndDate | insttCode | rdnmadr                   |
      | 동구 여름축제                 | 2026-10-24     | 2026-10-25   | 3420000   | 대구광역시 동구 아양로 200 |
      | 2026년 동구 여름축제 두두썸동 | 2026-10-24     | 2026-10-25   | 6270000   | 대구광역시 동구 아양로 207 |
    When 데이터를 정리하면
    Then 남은 축제는 1건이다

  Scenario: 기간이 겹치지 않으면 합치지 않는다
    Given 다음 원본 축제들이 있다:
      | fstvlNm        | fstvlStartDate | fstvlEndDate | insttCode | rdnmadr                     |
      | 천안흥타령축제 | 2026-10-01     | 2026-10-05   | B551011   | 충청남도 천안시 번영로 208  |
      | 천안흥타령춤축제 | 2026-10-10   | 2026-10-12   | 4490000   | 충청남도 천안시 번영로 208  |
    When 데이터를 정리하면
    Then 남은 축제는 2건이다

  Scenario: 다른 시도의 비슷한 축제는 합치지 않는다
    Given 다음 원본 축제들이 있다:
      | fstvlNm          | fstvlStartDate | fstvlEndDate | insttCode | rdnmadr                                 |
      | 홍천 산나물축제  | 2026-10-10     | 2026-10-11   | 4251000   | 강원특별자치도 홍천군 홍천읍 산림공원1길 29 |
      | 양평 산나물축제  | 2026-10-10     | 2026-10-11   | 4170000   | 경기도 양평군 용문면 용문역길 21        |
    When 데이터를 정리하면
    Then 남은 축제는 2건이다

  Scenario: 이름이 많이 다르면 같은 지역·같은 기간이어도 합치지 않는다
    Given 다음 원본 축제들이 있다:
      | fstvlNm      | fstvlStartDate | fstvlEndDate | insttCode | rdnmadr                                   |
      | 광양매화축제 | 2026-10-10     | 2026-10-11   | 5800000   | 전라남도 광양시 다압면 지막1길 55         |
      | 광양전어축제 | 2026-10-10     | 2026-10-11   | 5800000   | 전라남도 광양시 진월면 망덕길 167         |
    When 데이터를 정리하면
    Then 남은 축제는 2건이다

  Scenario: 합친 축제는 원본 행을 모두 기억한다
    Given 다음 원본 축제들이 있다:
      | fstvlNm      | fstvlStartDate | fstvlEndDate | insttCode | rdnmadr                                  |
      | 명량대첩축제 | 2026-10-10     | 2026-10-12   | 5870000   | 전라남도 해남군 문내면 관광레저로 12     |
      | 명량대첩축제 | 2026-10-10     | 2026-10-12   | 5905000   | 전라남도 진도군 군내면 진도대로 8459-13  |
    When 데이터를 정리하면
    Then 남은 축제는 1건이다
    And 남은 축제의 원본 행은 2개다

  Scenario: 숫자만 다른 이름은 합치지 않는다
    Given 다음 원본 축제들이 있다:
      | fstvlNm                    | fstvlStartDate | fstvlEndDate | insttCode | rdnmadr                                  |
      | 2025 비엔날레 문화콘서트1  | 2026-10-10     | 2026-10-10   | 5820000   | 광주광역시 북구 비엔날레로 111           |
      | 2025 비엔날레 문화콘서트2  | 2026-10-10     | 2026-10-10   | 5820000   | 광주광역시 북구 비엔날레로 111           |
    When 데이터를 정리하면
    Then 남은 축제는 2건이다
