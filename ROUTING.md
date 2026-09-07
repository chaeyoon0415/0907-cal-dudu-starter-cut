# 라우트 구조 (React Router v6)

## 전체 구조

```
/ (ModeSelector)
├── /local (LocalMode)
│   ├── /local/customer (LocalCustomer)
│   └── /local/admin (LocalAdmin)
└── /supabase (SupabaseMode)
    ├── /supabase/auth (SupabaseAuth)
    ├── /supabase/customer (SupabaseCustomer)
    └── /supabase/admin (SupabaseAdmin)
```

## 페이지별 설명

### 1. ModeSelector (`/`)
**파일**: `src/pages/ModeSelector.tsx`

- 메인 페이지
- 로컬 모드 vs Supabase 모드 선택
- 각 모드로 진입하는 버튼

### 2. LocalMode (`/local`)
**파일**: `src/pages/LocalMode.tsx`

- 로컬 모드 메인 페이지
- 역할 선택 (고객 / 관리자)
- 데이터 초기화 버튼
- 돌아가기 버튼
- Header 제공

**Context**:
```typescript
{
  db: DatabaseManager,    // 로컬 데이터베이스
  mode: 'local'
}
```

### 3. LocalCustomer (`/local/customer`)
**파일**: `src/pages/LocalCustomer.tsx`

- 로컬 모드의 고객 페이지
- 기존 `CustomerPage` 컴포넌트 사용
- 슬롯 선택, 신청, 재선택 기능

### 4. LocalAdmin (`/local/admin`)
**파일**: `src/pages/LocalAdmin.tsx`

- 로컬 모드의 관리자 페이지
- 기존 `AdminPage` 컴포넌트 사용
- 신청 목록, 확정, 운영 기록 표시

### 5. SupabaseMode (`/supabase`)
**파일**: `src/pages/SupabaseMode.tsx`

- Supabase 모드 메인 페이지
- Supabase Auth 세션 확인
- 로그인 상태 표시
- 로그아웃 버튼
- 관리자 표시

**Context**:
```typescript
{
  userId: string,         // Supabase 사용자 ID
  isAdmin: boolean,       // app_metadata.role === 'admin'
  mode: 'supabase'
}
```

### 6. SupabaseAuth (`/supabase/auth`)
**파일**: `src/pages/SupabaseAuth.tsx`

- Supabase 로그인 페이지
- `AuthPanel` 컴포넌트 사용
- 로그인 후 역할에 따라 라우팅
  - 관리자 → `/supabase/admin`
  - 고객 → `/supabase/customer`

### 7. SupabaseCustomer (`/supabase/customer`)
**파일**: `src/pages/SupabaseCustomer.tsx`

- Supabase 모드의 고객 페이지
- `CustomerPage` 컴포넌트 사용
- Supabase RPC 호출

### 8. SupabaseAdmin (`/supabase/admin`)
**파일**: `src/pages/SupabaseAdmin.tsx`

- Supabase 모드의 관리자 페이지
- `AdminPage` 컴포넌트 사용
- Supabase RPC 호출

## 라우터 설정

**파일**: `src/routes.tsx`

```typescript
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <ModeSelector />,
  },
  {
    path: '/local',
    element: <LocalMode />,
    children: [
      { path: 'customer', element: <LocalCustomer /> },
      { path: 'admin', element: <LocalAdmin /> },
    ],
  },
  {
    path: '/supabase',
    element: <SupabaseMode />,
    children: [
      { path: 'auth', element: <SupabaseAuth /> },
      { path: 'customer', element: <SupabaseCustomer /> },
      { path: 'admin', element: <SupabaseAdmin /> },
    ],
  },
];
```

## useOutletContext 사용

### 로컬 모드
```typescript
const { db, mode } = useOutletContext<{
  db: DatabaseManager,
  mode: 'local'
}>();
```

### Supabase 모드
```typescript
const { userId, isAdmin, mode } = useOutletContext<{
  userId: string,
  isAdmin: boolean,
  mode: 'supabase'
}>();
```

## 네비게이션

### 프로그래매틱 네비게이션
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// ModeSelector로 이동
navigate('/');

// 로컬 모드로 이동
navigate('/local/customer');  // 고객
navigate('/local/admin');     // 관리자

// Supabase 모드로 이동
navigate('/supabase/auth');       // 로그인
navigate('/supabase/customer');   // 고객 (로그인 후)
navigate('/supabase/admin');      // 관리자 (로그인 후)
```

### 링크 사용
```typescript
import { Link } from 'react-router-dom';

<Link to="/local/customer">로컬 고객 모드</Link>
<Link to="/supabase/auth">Supabase 로그인</Link>
```

## 사용자 흐름

### 로컬 모드
```
ModeSelector (/)
    ↓
  [로컬 모드 선택]
    ↓
LocalMode (/local)
    ↓
  [고객/관리자 선택]
    ↓
LocalCustomer (/local/customer) 또는 LocalAdmin (/local/admin)
    ↓
  [역할 전환] → LocalMode 재방문
```

### Supabase 모드
```
ModeSelector (/)
    ↓
  [Supabase 모드 선택]
    ↓
SupabaseAuth (/supabase/auth)
    ↓
  [로그인]
    ↓
SupabaseMode (/supabase)
    ↓
  [역할 자동 감지]
    ↓
SupabaseCustomer (/supabase/customer) 또는 SupabaseAdmin (/supabase/admin)
    ↓
  [로그아웃] → SupabaseAuth 재방문
```

## 파일 구조

```
src/
├── pages/
│   ├── ModeSelector.tsx      ← 모드 선택 페이지
│   ├── LocalMode.tsx         ← 로컬 모드 레이아웃
│   ├── LocalCustomer.tsx     ← 로컬 고객 페이지
│   ├── LocalAdmin.tsx        ← 로컬 관리자 페이지
│   ├── SupabaseMode.tsx      ← Supabase 모드 레이아웃
│   ├── SupabaseAuth.tsx      ← Supabase 로그인 페이지
│   ├── SupabaseCustomer.tsx  ← Supabase 고객 페이지
│   ├── SupabaseAdmin.tsx     ← Supabase 관리자 페이지
│   └── App.tsx               ← (이전 구조, 이제 사용 안 함)
├── components/
│   ├── CustomerPage.tsx      ← 고객 페이지 컴포넌트 (재사용)
│   ├── AdminPage.tsx         ← 관리자 페이지 컴포넌트 (재사용)
│   └── AuthPanel.tsx         ← Supabase 인증 UI
├── routes.tsx                ← 라우터 설정 (NEW)
└── main.tsx                  ← RouterProvider 설정 (수정)
```

## 주요 변경사항

### main.tsx
```typescript
// Before
<App />

// After
<RouterProvider router={router} />
```

### package.json
```json
{
  "dependencies": {
    "react-router-dom": "6.20.1"
  }
}
```

## 라우트 보호 (선택사항)

Supabase 모드에서 로그인하지 않으면 `/supabase/auth`로 리다이렉트할 수 있습니다:

```typescript
// SupabaseMode.tsx
if (!user && !loading) {
  return <Navigate to="/supabase/auth" replace />;
}
```

## 성능 최적화

- Lazy Loading:
```typescript
import { lazy, Suspense } from 'react';

const LocalCustomer = lazy(() => 
  import('./pages/LocalCustomer').then(m => ({ default: m.LocalCustomer }))
);
```

- Code Splitting: React Router는 자동으로 각 라우트를 번들 분할합니다.

## 문제 해결

### 페이지 새로고침 시 404
- Vite 개발 서버는 모든 경로를 `index.html`로 라우팅하도록 설정됨
- 배포 시 웹 서버 설정 필요 (모든 경로 → `index.html`)

### Context 데이터 손실
- 페이지 새로고침 시 context 데이터 손실 (일시적)
- Supabase 세션은 자동 복원됨
- 로컬 데이터는 localStorage에서 복원됨

---

**라우트 구조**: React Router v6  
**업데이트**: 2026-09-07  
**상태**: ✅ 완성
