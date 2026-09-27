Feature: 홈페이지 주소 정리
  원본 homepageUrl을 눌러서 열 수 있는 링크 목록으로 바꾼다.

  Scenario Outline: 링크 변환
    Given 원본 홈페이지 "<raw>"
    When 링크로 변환하면
    Then 링크 목록은 "<links>"이다

    Examples:
      | raw                                                  | links                                    |
      | yyg.go.kr                                            | https://yyg.go.kr                        |
      | https:/bhftf.or.kr                                   | https://bhftf.or.kr                      |
      | http://www.ayac.or.kr / www.aydf.kr                  | http://www.ayac.or.kr, https://www.aydf.kr |
      | https://www.hc.go.kr/06573/08250.web(개시전-작년자료) | https://www.hc.go.kr/06573/08250.web    |
      | 거창한마당축제.kr                                    | https://거창한마당축제.kr                |
      | http://www.울산공업축제.kr                           | http://www.울산공업축제.kr               |
      | https://www.gdsunsa.com/                             | https://www.gdsunsa.com/                 |
      |                                                      |                                          |
      | 홈페이지 없음                                        |                                          |
