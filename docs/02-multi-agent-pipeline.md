# 02. Multi-Agent Pipeline

## ✅ 목표
여러 AI 모델이 동시에 감사 → **합의(Consensus)** 후 최종 리포트 생성

---

## 역할 분리 (Agent Roles)

| Agent | 역할 |
|------|------|
| Static | 정적 분석, 패턴 취약점 |
| Logic | 비즈니스 로직, 경제적 공격 |
| Test | 테스트/커버리지 분석 |
| Infra | CI/CD, Docker, IaC 보안 |

---

## 실행 흐름

1. 파일 수집
2. 각 에이전트가 병렬로 분석
3. 모든 findings 취합
4. Consensus 모듈이 중복 제거 & 심각도 조정
5. 최종 리포트 생성

---

## 에이전트 출력 포맷

```json
{
  "agent": "static",
  "findings": [
    {
      "id": "STATIC-1",
      "severity": "high",
      "title": "Reentrancy risk",
      "location": { "file": "Vault.sol", "line": 120 },
      "description": "...",
      "recommendation": "..."
    }
  ]
}
```

---

## Consensus 규칙 예시

- 동일 파일/라인에서 유사한 finding → 병합
- 심각도 충돌 시 **높은 쪽 우선**
- agent confidence 사용 가능

---

## 구현 가이드

### 1. 병렬 실행
- Promise.all 기반 병렬 분석
- timeout 관리

### 2. 결과 병합
- key: `${file}:${line}:${title}`

### 3. 합의 로직
- severity max 우선
- 중복 제거

---

## MVP 체크리스트
- [ ] 에이전트 병렬 실행
- [ ] 결과 병합
- [ ] 합의 로직 적용