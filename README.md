# 미니 방명록 (Guestbook)

이름, 메시지, 작성 시각이 쌓이는 미니 방명록. 로그인 없이, 글 작성 시 입력한 비밀번호로 본인 글의 수정·삭제 권한만 확인합니다.

- **작성**: 이름 · 메시지 · 비밀번호를 입력해 새 글 작성
- **조회**: 전체 글 목록을 최신순으로 표시
- **수정 / 삭제**: 비밀번호가 일치해야 허용, 불일치 시 오류 표시

## 기술 스택

- Next.js (App Router) + TypeScript
- Neon Postgres (`@neondatabase/serverless`)
- Vercel 배포

비밀번호는 평문 저장하지 않고 `scrypt` 해시(`lib/password.ts`)로 저장합니다.

## 개발

```bash
npm install
npm run dev
```

`.env.local`에 `DATABASE_URL`(Neon 연결 문자열)이 필요합니다. 스키마는 `db/schema.sql`, 적용 스크립트는 `scripts/apply-schema.mjs`.

허재형 · 202204160
