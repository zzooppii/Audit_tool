# Auto-Audit

로컬 환경에서 코드 보안 감사를 수행하는 CLI 도구입니다.  
`.audit.yml` 설정을 기반으로 파일 스캔과 규칙 기반 분석을 수행하며, 결과를 콘솔/JSON/Markdown으로 출력합니다.

---

## ✅ 설치 및 빌드

```bash
npm install
npm run build
```

---

## ✅ 기본 실행

```bash
audit .
# 또는
node dist/cli/index.js .
```

---

## ✅ 글로벌 설치 (권장)

```bash
npm install -g .
```

설치 후 어디서든 다음과 같이 실행할 수 있습니다:

```bash
audit .
```

또는 로컬 개발 중에는:

```bash
npm link
audit .
```

---

## ✅ CLI 옵션

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
audit ./contracts --format markdown --output ./reports/audit.md
audit ./contracts --fail-on critical
```

---

## ✅ .audit.yml 예시

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
  solidity-delegatecall:
    enabled: true
    severity: high
  js-eval:
    enabled: true
    severity: high

accessControl:
  modifiers:
    - onlyOwner
    - onlyRole
    - adminOnly

report:
  format: markdown
  output: "./reports/audit.md"
```

---

## ✅ 지원 룰 목록 (현재 Phase 1)

> Solidity 파일은 **AST 기반 정적 분석**으로 탐지됩니다.
> (파싱 실패 시 Regex 기반으로 fallback)

### Solidity
- `solidity-tx-origin`
- `solidity-delegatecall`
- `solidity-selfdestruct`
- `solidity-low-level-call`
- `solidity-send-transfer`
- `solidity-block-timestamp`
- `solidity-blockhash-randomness`
- `solidity-assembly`
- `solidity-reentrancy`
- `solidity-unchecked-return`
- `solidity-access-control`

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

## ✅ 리포트 요약/통계

출력 리포트에는 다음 정보가 포함됩니다.

- 총 Finding 수
- 심각도별 개수 (Critical/High/Medium/Low/Info)
- **탐지된 코드 스니펫 (기본 전/후 2줄 포함)**

예시:
```
🎯 Found 3 issue(s)
   Critical: 1 | High: 1 | Medium: 1 | Low: 0 | Info: 0
```

---

## ✅ 플러그인 구조

언어별 분석기는 플러그인으로 분리되어 있습니다:
- Solidity: AST 기반 분석 + REGEX 폴백
- JavaScript/TypeScript: REGEX 기반 패턴 탐지
- Python: REGEX 기반 패턴 탐지

새로운 언어/룰 추가는 `src/plugins/`에 플러그인 추가만으로 가능합니다.


## 📄 문서
더 자세한 설계 문서는 `docs/` 폴더를 참고하세요.
