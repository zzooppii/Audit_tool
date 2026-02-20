# 06. 초기 스캐폴딩 코드 구조

## ✅ 목표
확장 가능한 구조로 시작 (CLI → 분석 → 리포트 → AI)

---

## 디렉토리 구조 제안

```
audit-tool/
├── bin/
│   └── audit                 # CLI 엔트리
├── src/
│   ├── cli/
│   │   ├── index.ts           # CLI 초기화
│   │   └── commands/
│   │       ├── audit.ts
│   │       └── init.ts
│   ├── config/
│   │   ├── loadConfig.ts      # .audit.yml 로드
│   │   └── defaults.ts
│   ├── scanner/
│   │   ├── fileScanner.ts     # 파일 수집
│   │   ├── gitDiff.ts         # diff 모드
│   │   └── classify.ts        # 언어 분류
│   ├── analyzers/
│   │   ├── index.ts           # orchestrator
│   │   ├── static.ts          # 정적 분석
│   │   ├── ai.ts              # AI 분석
│   │   └── test.ts            # 테스트 분석
│   ├── agents/
│   │   ├── staticAgent.ts
│   │   ├── logicAgent.ts
│   │   ├── testAgent.ts
│   │   └── infraAgent.ts
│   ├── consensus/
│   │   └── mergeFindings.ts
│   ├── reporters/
│   │   ├── markdown.ts
│   │   ├── json.ts
│   │   └── console.ts
│   ├── patch/
│   │   └── generator.ts
│   ├── plugins/
│   │   └── manager.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── logger.ts
│       └── errors.ts
├── templates/
│   └── report.md
├── docs/
│   └── ...
├── package.json
└── tsconfig.json
```

---

## 핵심 모듈 책임

### `cli/`
- CLI 인자 파싱
- config 로드
- orchestrator 호출

### `scanner/`
- 로컬 파일 수집
- git diff 기반 변경 파일 추출

### `analyzers/`
- 실제 분석 실행
- static + ai + test 통합 가능

### `agents/`
- 멀티 에이전트 역할 분리
- 병렬 실행 단위

### `consensus/`
- findings 병합/중복 제거
- severity 재조정

### `reporters/`
- 결과 출력 형식별 생성

### `patch/`
- before/after diff 생성

---

## 초기 MVP에서 필요한 최소 파일

- bin/audit
- src/cli/index.ts
- src/cli/commands/audit.ts
- src/config/loadConfig.ts
- src/scanner/fileScanner.ts
- src/reporters/console.ts