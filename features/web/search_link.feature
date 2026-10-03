Feature: 축제 이름 구글 검색 주소
  축제 이름으로 구글 검색 결과 페이지 주소를 만든다.

  Scenario Outline: 이름을 검색어로 넣는다
    Given 축제 이름 "<name>"
    When 구글 검색 주소를 만들면
    Then 검색 주소는 "<url>"이다

    Examples:
      | name                      | url                                                                                   |
      | 제72회 백제문화제         | https://www.google.com/search?q=%EC%A0%9C72%ED%9A%8C%20%EB%B0%B1%EC%A0%9C%EB%AC%B8%ED%99%94%EC%A0%9C |
      | 안산서머페스타&여르미오    | https://www.google.com/search?q=%EC%95%88%EC%82%B0%EC%84%9C%EB%A8%B8%ED%8E%98%EC%8A%A4%ED%83%80%26%EC%97%AC%EB%A5%B4%EB%AF%B8%EC%98%A4 |
      | K-분식페스티벌 &나루터영화제 | https://www.google.com/search?q=K-%EB%B6%84%EC%8B%9D%ED%8E%98%EC%8A%A4%ED%8B%B0%EB%B2%8C%20%26%EB%82%98%EB%A3%A8%ED%84%B0%EC%98%81%ED%99%94%EC%A0%9C |
      | 2026 C++ 축제             | https://www.google.com/search?q=2026%20C%2B%2B%20%EC%B6%95%EC%A0%9C                    |
      |   앞뒤 공백 축제   | https://www.google.com/search?q=%EC%95%9E%EB%92%A4%20%EA%B3%B5%EB%B0%B1%20%EC%B6%95%EC%A0%9C |
