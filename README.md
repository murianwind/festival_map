# 전국 축제 지도

날짜를 고르면 그날 열리는 전국 축제를 카카오맵에 표시합니다.
데이터: 공공데이터포털 [전국문화축제표준데이터](https://www.data.go.kr/data/15013104/standard.do),
공휴일: 구글 캘린더 "대한민국의 공휴일"([holidays-kr](https://github.com/hyunbinseo/holidays-kr)).

## 표시 규칙 (접속한 날, 한국 시간 기준)

| 축제 | 표시 |
|---|---|
| 14일 미만 | 달력: 오늘 이후 남은 기간 중 휴일(토·일·공휴일)에만 |
| 14일 미만, 남은 기간에 휴일 없음 | 숨김 |
| 14일 이상 | 기타 축제(사이드바) - 장기 |
| 종료일 < 시작일, 형식 오류 | 기타 축제 - 날짜 오류 (두 날짜 모두 지났으면 숨김) |
| 시작일 또는 종료일 없음 | 기타 축제 - 날짜 미정 |
| 위치를 찾지 못함 | 기타 축제 - 위치 미확인 |
| 종료됨 | 숨김 |

위치: 원본 좌표 → 도로명주소(`rdnmadr`) → 지번주소(`lnmadr`) 순서로 카카오 주소 검색.
표시 필드: 축제명, 개최장소, 축제내용, 홈페이지.

## 구성

- `scripts/` 수집 파이프라인 (표준 라이브러리 + curl만 사용)
- `docs/` GitHub Pages 정적 페이지, `docs/festivals.json`은 수집 결과
- `data/geocode_cache.json` 주소 검색 캐시 (실패는 30일 후 재검색)
- 수집은 GitHub 클라우드 러너에서 매일 05:00 KST 자동 실행 (`update-festivals.yml`)
- `features/` BDD 시나리오 — `pipeline/`은 pytest-bdd, `web/`은 cucumber-js로 실행

## 테스트

```
pip install -r requirements-dev.txt && pytest
npm ci && npm test
```
