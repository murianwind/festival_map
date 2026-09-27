Feature: 저장 레코드 형식
  화면에 필요한 필드만 저장한다.

  Scenario: 표시 필드는 축제명·개최장소·내용·홈페이지 네 가지다
    Given 원본 축제 "강동선사문화축제"가 모든 필드를 가지고 있다
    When 저장 레코드로 변환하면
    Then 레코드의 표시 필드는 "name, place, content, homepages"이다
    And 레코드에는 전화번호와 주관기관이 없다
