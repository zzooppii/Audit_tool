# 01. CLI 기반 로컬 감사

## ✅ 목표
- 웹 업로드 없이 **로컬 폴더**를 직접 감사
- `.audit.yml` 설정으로 감사 범위/규칙 관리
- Git diff 기반으로 변경된 코드만 감사 가능

---

## 기능 요구사항

### 핵심 기능
- 로컬 폴더를 스캔하여 감사 대상 파일을 수집
- `.audit.yml`로 경로, 제외 패턴, 네트워크, 규칙 설정
- Git diff 모드 지원 (`--diff origin/main`)
- 출력 포맷: markdown, json, console
- 실패 조건: `--fail-on critical`

---

## CLI 예시

```bash
audit . 
audit ./contracts --config .audit.yml
audit ./contracts --diff origin/main --format json --output report.json
audit ./contracts --fail-on critical
```

---

## `.audit.yml` 예시

```yaml
version: "1.0"

paths:
  - "./contracts"
  - "./scripts"

tests:
  - "./test"

exclude:
  - "node_modules/**"
  - "**/*.t.sol"
  - "**/mock/**"

networks:
  - ethereum
  - optimism

rules:
  reentrancy:
    enabled: true
    severity: high
  access-control:
    enabled: true
    severity: critical

report:
  format: markdown
  output: "./reports/audit.md"
```

---

## 구현 가이드

### 1. 파일 수집 모듈
- glob 기반 파일 탐색
- exclude 패턴 적용
- 언어별 파일 분류 (solidity, ts, py 등)

### 2. Git diff 모듈
- `git diff --name-only <base>` 파일 목록 추출
- 변경 파일만 분석 파이프라인 전달

### 3. 리포트 모듈
- findings → markdown/json 변환
- 요약 통계 제공 (severity count)

---

## 핵심 데이터 구조 (예시)

```ts
interface AuditConfig {
  paths: string[];
  tests: string[];
  exclude: string[];
  networks: string[];
  rules: Record<string, { enabled: boolean; severity: string }>;
  report: { format: 'markdown'|'json'|'console'; output?: string };
}

interface Finding {
  id: string;
  title: string;
  severity: 'critical'|'high'|'medium'|'low'|'info';
  location: { file: string; line: number };
  description: string;
  recommendation: string;
}
```

---

## MVP 체크리스트
- [ ] CLI 실행 가능
- [ ] 폴더 탐색/필터링
- [ ] `.audit.yml` 파싱
- [ ] 기본 리포트 생성