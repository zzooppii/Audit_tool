# 04. 플러그인 아키텍처

## ✅ 목표
언어/룰 확장을 쉽게 하기 위한 플러그인 구조

---

## 플러그인 구조 예시

```
plugins/
  solidity/
    index.ts
    detectors/
  typescript/
    index.ts
```

---

## Plugin Interface

```ts
interface AuditPlugin {
  id: string;
  languages: string[];
  detect(files: string[]): Promise<Finding[]>;
}
```

---

## 로딩 방식
- config에서 사용 플러그인 지정
- 동적 import로 로딩

---

## MVP 체크리스트
- [ ] 플러그인 인터페이스 정의
- [ ] 기본 플러그인 등록