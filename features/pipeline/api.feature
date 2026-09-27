Feature: 축제 API 수집
  표준데이터 API를 페이지 끝까지 받는다.

  Scenario: 여러 페이지를 모두 받는다
    Given API 전체 건수가 3건이고 페이지 크기가 2이다
    When 축제를 모두 받으면
    Then 받은 축제는 3건이다
    And API는 2회 호출된다

  Scenario: response 래퍼가 있어도 읽는다
    Given API가 response 래퍼로 감싼 응답을 준다
    When 축제를 모두 받으면
    Then 받은 축제는 1건이다

  Scenario: 데이터 없음 응답은 빈 목록이다
    Given API가 결과코드 "03"을 준다
    When 축제를 모두 받으면
    Then 받은 축제는 0건이다

  Scenario: 오류 응답이면 실패한다
    Given API가 결과코드 "30"을 준다
    When 축제를 모두 받으면
    Then 수집 오류가 난다

  Scenario: 이미 인코딩된 서비스키도 한 번만 인코딩한다
    Given 서비스키가 "abc%2Bdef%3D%3D"이다
    When 요청 주소를 만들면
    Then 요청 주소의 serviceKey는 "abc%2Bdef%3D%3D"이다
