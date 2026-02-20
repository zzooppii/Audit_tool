# 03. Auto Patch Generator

## ✅ 목표
취약점 리포트에 **수정안(diff/patch)** 자동 생성

---

## 기능 요구사항

- Finding 단위 수정안 생성
- diff 출력 지원 (`.patch` 또는 `git diff` 형식)
- `--fix` 옵션으로 patch 파일 생성

---

## 출력 예시

```diff
- require(msg.sender == owner, "not owner");
+ if (msg.sender != owner) revert Unauthorized();
```

---

## 구현 가이드

1. Finding에 `beforeCode`, `afterCode` 생성
2. diff 라이브러리 사용 (`diff` or `git diff`)
3. 파일별 patch 묶음 생성

---

## MVP 체크리스트
- [ ] finding → before/after 코드 생성
- [ ] patch 파일 출력
- [ ] CLI 옵션 추가 (--fix)