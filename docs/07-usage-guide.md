# 07. 사용 가이드 (Usage Guide)

이 문서는 현재 구현된 Phase 1 기능을 기준으로 **CLI 사용법**, **설정 방법**, **룰 커스터마이징**, **리포트 출력**을 설명합니다.

---

## ✅ 설치 및 실행

### 1) 빌드
```bash
npm install
npm run build
```

### 2) 실행
```bash
audit .
# 또는
node dist/cli/index.js .
```

---

## ✅ 기본 CLI 옵션

```bash
audit <path> [options]
```

옵션:
- `-c, --config <path>`: 설정 파일 경로 (기본: `.audit.yml`)
- `-f, --format <format>`: 출력 포맷 (`console|json|markdown`)
- `-o, --output <path>`: 리포트 출력 파일 경로
- `--fail-on <level>`: 특정 심각도 이상 발견 시 종료 (`info|low|medium|high|critical`)

예시:
```bash
audit ./contracts --format json --output report.json
audit ./contracts --fail-on critical
```

---

## ✅ .audit.yml 설정 예시

```yaml
version: "1.0"

paths:
  - "."

exclude:
  - "node_modules/**"
  - "dist/**"

rules:
  solidity-tx-origin:
    enabled: true
    severity: critical
  js-eval:
    enabled: true
    severity: high
  python-subprocess-shell:
    enabled: true
    severity: high

report:
  format: markdown
  output: "./reports/audit.md"
```

---

## ✅ 룰 커스터마이징

각 룰은 `.audit.yml`에서 활성/심각도를 조정할 수 있습니다.

```yaml
rules:
  js-eval:
    enabled: false     # 룰 비활성화
  python-exec:
    enabled: true
    severity: medium   # 심각도 재정의
```

---

## ✅ 리포트 요약/통계

현재 리포트에는 다음과 같은 요약 통계가 포함됩니다.

- 총 Finding 수
- 심각도별 개수 (Critical/High/Medium/Low/Info)

### 콘솔 출력 예시
```
🎯 Found 3 issue(s)
   Critical: 1 | High: 1 | Medium: 1 | Low: 0 | Info: 0
```

### JSON 출력 예시
```json
{
  "summary": {
    "total": 3,
    "bySeverity": { "critical": 1, "high": 1, "medium": 1, "low": 0, "info": 0 }
  },
  "findings": [...]
}
```

---

## ✅ 현재 제공 룰 목록 (Phase 1)

### Solidity
- `solidity-tx-origin`
- `solidity-delegatecall`
- `solidity-selfdestruct`
- `solidity-low-level-call`
- `solidity-assembly`

### JavaScript / TypeScript
- `js-eval`
- `js-child-process`
- `js-innerhtml`
- `js-math-random`

### Python
- `python-exec`
- `python-subprocess-shell`
- `python-pickle`

---

## ✅ 다음 단계
Phase 2에서는 `--diff <base>`를 통해 Git diff 기반 감사가 추가됩니다.
```