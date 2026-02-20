# 05. MVP 개발 로드맵

## ✅ 목표
가장 먼저 **CLI 기반 로컬 감사**가 동작하는 MVP를 만든다.  
이후 멀티에이전트, 자동 수정, 플러그인으로 확장한다.

---

## Phase 0 — 준비

- [ ] Node.js + TypeScript 프로젝트 초기화
- [ ] ESLint/Prettier 설정
- [ ] 기본 CLI 실행 구조 생성

---

## Phase 1 — CLI 기반 로컬 감사 (MVP 핵심)

### 필수 기능
- [ ] CLI 명령어: `audit <path>`
- [ ] `.audit.yml` 파싱
- [ ] 경로 스캔 + exclude 적용
- [ ] 파일 분류 (sol, ts, py 등)
- [ ] 기본 findings 출력 (더미/샘플)

### 출력
- [ ] console 출력
- [ ] markdown 출력
- [ ] json 출력

---

## Phase 2 — Git diff 감사

- [ ] `--diff <base>` 옵션 추가
- [ ] 변경 파일만 분석
- [ ] diff 기반 summary 제공

---

## Phase 3 — Multi-Agent Pipeline (병렬)

- [ ] Agent 역할 분리
- [ ] 병렬 분석 실행
- [ ] consensus 로직 도입

---

## Phase 4 — Auto Patch Generator

- [ ] finding → before/after 코드 생성
- [ ] diff/patch 파일 출력
- [ ] `--fix` 옵션 추가

---

## Phase 5 — Plugin Architecture

- [ ] 플러그인 인터페이스 정의
- [ ] 기본 플러그인 로딩
- [ ] config로 플러그인 제어

---

## MVP 완료 기준

- `audit ./path` 실행 가능
- `.audit.yml` 설정 반영
- markdown/json 보고서 출력 가능