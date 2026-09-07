# Supabase 모드 구현 가이드

## 개요

기존 로컬 모드는 유지하면서 명시적인 Supabase 모드를 추가했습니다. 로컬 모드와 Supabase 모드는 독립적으로 동작하며, 모드 전환은 앱 상단의 버튼을 통해 수행합니다.

## 아키텍처

### 1. 모드 전환 (`src/pages/App.tsx`)
- **로컬 모드**: 브라우저 localStorage 사용, 역할 수동 전환 가능
- **Supabase 모드**: Supabase Auth 기반 로그인, RPC 호출

### 2. 인증 (`src/components/AuthPanel.tsx`)
- Supabase Auth를 통한 이메일/비밀번호 로그인
- `user.user_metadata.role` 확인으로 관리자 판정
- auth 상태 변경 감지하여 자동 UI 업데이트

### 3. 데이터 접근
- **로컬**: `DatabaseManager` (localStorage 기반)
- **Supabase**: `SupabaseOperationManager` (RPC + Realtime Query)

### 4. RPC 호출 (`src/utils/supabaseOperations.ts`)
모든 쓰기 작업은 Supabase RPC를 통해 실행됩니다:
- `submit_request`: 고객 신청 제출
- `confirm_request`: 관리자 확정
- `resubmit_request`: 고객 재선택
- 읽기는 직접 쿼리 (SELECT)

## 사용 방법

### 1. 환경 변수 설정

`.env` 파일에서 Supabase 환경 변수 확인:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase 프로젝트 준비

1. Supabase 프로젝트 생성
2. SQL Editor에서 `sql/00_supabase.sql` 실행
3. 테스트 사용자 생성

### 3. 앱에서 Supabase 모드 전환

1. 브라우저에서 http://localhost:5187 접속
2. 상단의 **모드 선택**에서 "Supabase 모드" 클릭
3. 경고 메시지와 로그인 폼 표시
4. 이메일/비밀번호로 로그인

### 4. 테스트 사용자 생성

Supabase Auth에서 직접 또는 Sign Up 폼으로 생성:

**고객 (C01, C02)**:
- 이메일: `customer1@test.com`, `customer2@test.com`
- 비밀번호: 임의로 설정
- role: `customer` (기본값 또는 user_metadata에서 수정)

**관리자**:
- 이메일: `admin@test.com`
- 비밀번호: 임의로 설정
- role: `admin` (user_metadata에 `{"role":"admin"}` 설정)

## 공통 시나리오 테스트

### 테스트 케이스

#### 1단계: 고객 C01 신청 (9/9 오전, 9/9 오후)

1. C01로 로그인
2. 모드: Supabase
3. 역할 자동 감지: 고객
4. 슬롯 선택: 2026-09-09 오전(우선순위 1), 2026-09-09 오후(우선순위 2)
5. 제출

**예상 결과**:
- 신청 완료 메시지 표시
- 상태: "접수됨"
- 두 슬롯 모두 "가능" 상태

#### 2단계: 고객 C02 신청 (9/9 오전)

1. C02로 로그아웃 후 로그인
2. 슬롯 선택: 2026-09-09 오전
3. 제출

**예상 결과**:
- C02도 동일 슬롯 신청 가능 (대기 상태)
- C02 상태: "접수됨"

#### 3단계: 관리자 C01 확정 (9/9 오전)

1. 관리자로 로그인 (role='admin')
2. 역할 자동 감지: 관리자
3. 신청 목록에서 C01 선택
4. 9/9 오전 슬롯 선택 후 확정

**예상 결과**:
- 확정 완료 메시지
- C01 상태: "확정됨"
- C01의 9/9 오전: "마감"
- C02 상태: "재선택 필요" (자동 변경)
- 실행 기록: 확정 로그 기록

#### 4단계: 고객 C02 재선택 (9/10 오전)

1. C02로 로그인
2. "재선택하기" 버튼 클릭
3. 새 슬롯 선택: 2026-09-10 오전
4. 재선택 제출

**예상 결과**:
- 재선택 완료 메시지
- 요청 version: 2 (증가)
- 상태: "접수됨" (새 제출 순번 부여)
- 이전 선택 이력: 보존

#### 5단계: 관리자 C02 확정 (9/10 오전)

1. 관리자로 로그인
2. C02의 재선택된 신청 선택
3. 9/10 오전 확정

**예상 결과**:
- C02 상태: "확정됨"
- 2026-09-10 오전 슬롯: "마감"
- 실행 기록: 총 4건 (C01 제출, C02 제출, C01 확정, C02 재선택, C02 확정)

## 에러 처리

### 인증 실패
- **표시**: 빨간 경고 박스에 오류 메시지
- **폴백 없음**: 실패 시 로컬 모드로 자동 전환 안 함

### 쿼리 실패
- **조회 실패**: "슬롯 조회 실패: ..." 메시지 표시
- **제출 실패**: RPC 오류 메시지 화면에 표시
- **확정 실패**: 슬롯 마감, 권한 부족 등 명확한 오류 전달

### 권한 확인
- **고객**: 자신의 신청만 조회 가능 (RLS)
- **관리자**: 모든 신청 조회 가능 (app_metadata.role='admin')
- **권한 없는 확정**: "Not authorized" 오류

## 파일 구조

```
src/
├── components/
│   ├── AuthPanel.tsx           # Supabase 로그인/로그아웃
│   ├── CustomerPage.tsx        # 로컬/Supabase 모드 지원
│   └── AdminPage.tsx           # 로컬/Supabase 모드 지원
├── pages/
│   └── App.tsx                 # 모드 전환 로직
├── utils/
│   ├── supabaseClient.ts       # Supabase 클라이언트
│   ├── supabaseOperations.ts   # RPC 호출 + 쿼리
│   ├── operations.ts           # 로컬 모드 업무 로직
│   └── database.ts             # localStorage 관리
└── types.ts                    # 공통 타입 정의
```

## 테스트 결과 기록

### 환경
- Node.js: [버전]
- npm: [버전]
- Supabase 프로젝트: [URL]

### 테스트 일자
- 2026-09-07

### 실행 결과

#### 1단계: C01 신청
- [ ] 신청 성공
- [ ] 상태 표시: "접수됨"
- [ ] 슬롯 상태: "가능"

#### 2단계: C02 신청
- [ ] 같은 슬롯 신청 성공
- [ ] C02 상태: "접수됨"
- [ ] 신청 목록에 2건 표시

#### 3단계: 관리자 C01 확정
- [ ] 확정 성공
- [ ] C01 상태: "확정됨"
- [ ] C02 자동 "재선택 필요" 변경
- [ ] 실행 기록에 로그 표시

#### 4단계: C02 재선택
- [ ] 재선택 성공
- [ ] version 증가 (1 → 2)
- [ ] 상태: "접수됨"
- [ ] 이전 선택 보존

#### 5단계: 관리자 C02 확정
- [ ] 재선택된 신청 확정 성공
- [ ] C02 상태: "확정됨"
- [ ] 두 고객 모두 확정 상태

### 발견된 이슈

(테스트 후 작성)

### 통과 여부
- [ ] 모든 테스트 통과
