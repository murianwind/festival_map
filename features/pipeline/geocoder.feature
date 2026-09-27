Feature: 카카오 주소 검색
  Scenario: 첫 번째 검색 결과의 좌표를 쓴다
    Given 카카오 응답 문서가 x "127.4901", y "36.4622"이다
    When "충청북도 청주시 상당구 문의면 청남대길 646"을 검색하면
    Then 검색 결과는 36.4622, 127.4901이다
    And 요청 헤더에 "KakaoAK test-key"가 들어간다

  Scenario: 결과가 없으면 없음이다
    Given 카카오 응답 문서가 비어 있다
    When "없는 주소"를 검색하면
    Then 검색 결과는 없다
