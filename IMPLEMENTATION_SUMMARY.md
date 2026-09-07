# Supabase 모드 구현 완료

## 작업 요약

기존 로컬 모드를 유지하면서 명시적인 Supabase 모드를 추가했습니다. 두 모드는 독립적으로 동작하며, 사용자가 앱 상단에서 전환할 수 있습니다.

## 구현 내용

### 1. 새로운 파일

#### `src/utils/supabaseClient.ts`
- Supabase 클라이언트 초기화
- 환경 변수 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)로부터 설정

#### `src/utils/supabaseOperations.ts`
- `SupabaseOperationManager` 클래스
- RPC 호출:
  - `submitRequest()`: submit_request RPC 호출
  - `confirmRequest()`: confirm_request RPC 호출
  - `resubmitRequest()`: resubmit_request RPC 호출
- 데이터 조회:
  - `getSlots()`: 모든 슬롯 조회
  - `getCustomerRequests()`: 고객의 신청 조회
  - `getAllRequests()`: 모든 신청 조회 (어드민)
  - `getOperationLogs()`: 실행 로그 조회

#### `src/components/AuthPanel.tsx`
- Supabase Auth 기반 로그인/로그아웃 UI
- 이메일/비밀번호 입력 폼
- 가입 기능
- auth 상태 변경 자동 감지
- `app_metadata.role`에서 관리자 판정

### 2. 수정된 파일

#### `src/pages/App.tsx`
- 모드 선택 UI 추가 (로컬 ↔ Supabase)
- 로컬 모드: 역할 수동 전환 가능
- Supabase 모드: 인증 필수, 자동 역할 감지
- `AuthPanel` 통합
- 모드별 `onAuthChange` 콜백

#### `src/components/CustomerPage.tsx`
- 모드별 데이터 로드 로직:
  - 로컬: `DatabaseManager` + `OperationManager`
  - Supabase: `SupabaseOperationManager`
- `submitRequest()`, `resubmitRequest()` 모드 분기
- userId 자동 설정 (Supabase 로그인 사용자)

#### `src/components/AdminPage.tsx`
- 모드별 데이터 로드 로직:
  - 로컬: `DatabaseManager` + `OperationManager`
  - Supabase: `SupabaseOperationManager`
- `confirmRequest()` 모드 분기
- 운영 로그 조회 (Supabase에서 operation_logs 테이블)

#### `tsconfig.json`
- Vite 타입 추가 (`types: ["vite/client"]`)
- `import.meta.env` TypeScript 지원

## 기능 특징

### 1. 모드 독립성
- 로컬 모드와 Supabase 모드 완전 분리
- 모드 전환 시 상태 초기화 (보안)
- localStorage 데이터는 로컬 모드에서만 사용

### 2. 인증 보안
- Supabase Auth의 JWT 기반 인증
- RLS (Row Level Security) 정책 활용
- 관리자 판정: 서버의 `app_metadata.role` 검증
- 클라이언트의 user_metadata는 신뢰하지 않음

### 3. 에러 처리
- 인증 실패: 화면에 오류 메시지 표시
- 조회 실패: "슬롯 조회 실패: ..." 등 구체적 오류
- 제출 실패: RPC 오류 메시지 전달
- 폴백 없음: Supabase 모드에서 로컬 모드로 몰래 전환 안 함

### 4. 데이터 일관성
- RPC로 트랜잭션 처리 (SQL)
- operationId 기반 중복 방지
- 슬롯 마감과 요청 상태 변경 원자성 보장

## 테스트 준비

### 1. 환경 변수
`.env` 파일에 이미 설정됨:
```env
VITE_SUPABASE_URL=https://jxhaeaayirmufkbtepdq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Supabase 프로젝트
- SQL 스크립트: `sql/00_supabase.sql`
- 테이블: slots, requests, candidates, confirmations, operation_logs
- RPC: submit_request, confirm_request, resubmit_request

### 3. 테스트 사용자
Supabase Auth에서 생성 필요:
- C01: customer1@test.com (role: customer)
- C02: customer2@test.com (role: customer)
- ADMIN: admin@test.com (role: admin)

## 실행 방법

```bash
# 1. 의존성 설치 (이미 설치됨)
npm ci

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 http://localhost:5187 접속

# 4. 모드 전환 (상단 버튼)
# - 로컬 모드: 역할 선택 후 바로 사용
# - Supabase 모드: 로그인 필수

# 5. 테스트 시나리오 실행
# SUPABASE_MODE.md 참고
```

## 현재 상태

### 완료된 것
- ✅ Supabase 클라이언트 설정
- ✅ 인증 UI 구현
- ✅ RPC 호출 래퍼 구현
- ✅ 모드 전환 로직
- ✅ 고객/관리자 모드 통합
- ✅ 에러 처리 및 표시
- ✅ TypeScript 타입 안전성
- ✅ 개발 서버 실행 확인

### 남은 것
- ⏳ 실제 테스트 사용자로 테스트 (별도 진행)
- ⏳ 테스트 결과 기록
- ⏳ 배포 (별도)

## 주요 주의사항

1. **SQL 수정 금지**: `sql/00_supabase.sql`은 고정 파일입니다. 슬롯, 판정 함수는 수정하지 마세요.

2. **RPC만 사용**: 클라이언트에서 직접 테이블을 쓰지 않습니다. 모든 쓰기는 RPC를 통해 수행됩니다.

3. **환경 변수**: `.env`의 공개 키만 사용합니다. service_role 키는 절대 클라이언트에 노출하지 마세요.

4. **인증**: 로컬 모드의 역할 전환은 데모용입니다. Supabase 모드에서는 실제 인증이 적용됩니다.

5. **폴백 없음**: Supabase 모드에서 연결 오류 시 로컬 모드로 자동 전환하지 않습니다.

## 파일 변경 목록

```
생성:
  src/utils/supabaseClient.ts
  src/utils/supabaseOperations.ts
  src/components/AuthPanel.tsx
  SUPABASE_MODE.md
  IMPLEMENTATION_SUMMARY.md (이 파일)

수정:
  src/pages/App.tsx
  src/components/CustomerPage.tsx
  src/components/AdminPage.tsx
  tsconfig.json

변경 없음:
  sql/00_supabase.sql (고정)
  src/utils/constants.ts (고정)
  src/utils/decide.ts (고정)
  src/utils/database.ts (로컬 모드용, 유지)
  src/utils/operations.ts (로컬 모드용, 유지)
```

## 다음 단계

1. Supabase 프로젝트에서 테스트 사용자 생성
2. 공통 시나리오 실행 및 결과 기록
3. 에러 케이스 테스트
4. 배포 준비 (별도)
