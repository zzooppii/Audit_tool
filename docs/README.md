# Audit Platform - Development Docs

이 문서는 AI 기반 보안 감사 플랫폼을 우선순위별로 개발하기 위한 설계 문서 모음입니다.

## ✅ 우선순위

1. **CLI 기반 로컬 감사**
   - 로컬 폴더 대상 감사
   - `.audit.yml` 설정 지원
   - Git diff 기반 변경만 감사

2. **Multi-Agent Pipeline**
   - 병렬 AI 분석
   - 역할 분리 (Static / Logic / Test / Infra)
   - Consensus 모듈

3. **Auto Patch Generator**
   - 수정안 자동 생성
   - diff/patch 형태 출력

4. **플러그인 아키텍처**
   - 언어/규칙 확장 가능
   - 분석기 모듈화

5. **MVP 개발 로드맵**
   - 단계별 개발 계획
   - MVP 완료 기준

6. **초기 스캐폴딩 구조**
   - 디렉토리 구조
   - 핵심 모듈 책임

---

## 📄 문서 목록

- [01-cli-local-audit.md](./01-cli-local-audit.md)
- [02-multi-agent-pipeline.md](./02-multi-agent-pipeline.md)
- [03-auto-patch-generator.md](./03-auto-patch-generator.md)
- [04-plugin-architecture.md](./04-plugin-architecture.md)
- [05-mvp-roadmap.md](./05-mvp-roadmap.md)
- [06-scaffolding-structure.md](./06-scaffolding-structure.md)
- [07-usage-guide.md](./07-usage-guide.md)
- [07-usage-guide.md](./07-usage-guide.md)
