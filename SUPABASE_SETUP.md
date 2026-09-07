# Supabase 모드 완전 설정 가이드

## 1단계: Supabase 프로젝트 생성

### 1.1 가입 및 프로젝트 생성
```
1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 또는 이메일로 가입
4. 새 프로젝트 생성
   - 프로젝트 이름: cal-dudu (또는 원하는 이름)
   - 지역: 서울 (ap-southeast-1) 권장
   - 데이터베이스 비밀번호 설정 (복잡하게)
   - "Create new project" 클릭
```

### 1.2 프로젝트 대기
- 데이터베이스 생성 중 (1-2분)
- 완료되면 Supabase Dashboard 열림

## 2단계: SQL 스크립트 실행

### 2.1 SQL Editor 열기
```
Supabase Dashboard
├── 좌측 메뉴 "SQL Editor" 클릭
└── "New query" 클릭
```

### 2.2 SQL 스크립트 실행
```
1. `sql/00_supabase.sql` 파일 전체 내용 복사
2. SQL Editor의 쿼리 창에 붙여넣기
3. "Run" 버튼 클릭 (또는 Ctrl+Enter)
```

### 2.3 실행 확인
```sql
-- SQL Editor에서 다음 명령 실행
SELECT count(*) as slots, min(date) as first_day, max(date) as last_day 
FROM public.slots;
```

**예상 결과**:
```
 count | first_day  | last_day
-------+------------+-----------
    42 | 2026-09-09 | 2026-09-22
```

## 3단계: 환경 변수 설정

### 3.1 Supabase 키 복사
```
Supabase Dashboard
├── 좌측 메뉴 "Settings" → "API"
├── 아래 정보 복사:
│   ├── Project URL (VITE_SUPABASE_URL)
│   └── anon public (VITE_SUPABASE_ANON_KEY)
└── ※ service_role은 복사하지 않음
```

### 3.2 .env 파일 업데이트
```bash
cd /Users/chaeyoon/dev/0907-cal-dudu-starter-cut
```

**기존 .env 확인**:
```env
VITE_SUPABASE_URL=https://jxhaeaayirmufkbtepdq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**테스트용 프로젝트가 있으면 업데이트**:
```bash
# .env 파일 편집
# 기존 값을 새 프로젝트의 값으로 교체
```

### 3.3 변경 사항 적용
```bash
# 개발 서버 재시작
npm run dev
# 브라우저 새로고침
```

## 4단계: 테스트 사용자 생성

### 4.1 Supabase Auth로 사용자 생성
```
Supabase Dashboard
├── 좌측 메뉴 "Authentication"
├── "Users" 탭 클릭
└── "Add user" 클릭
```

### 4.2 사용자 1: 고객 C01
```
Email: c01@test.com
Password: Password123!
Confirm password: Password123!
User metadata (JSON):
{
  "role": "customer"
}
[Create user] 클릭
```

### 4.3 사용자 2: 고객 C02
```
Email: c02@test.com
Password: Password123!
Confirm password: Password123!
User metadata (JSON):
{
  "role": "customer"
}
[Create user] 클릭
```

### 4.4 사용자 3: 관리자
```
Email: admin@test.com
Password: Password123!
Confirm password: Password123!
User metadata (JSON):
{
  "role": "admin"
}
[Create user] 클릭
```

### 4.5 사용자 확인
```
Supabase Dashboard → Authentication → Users
┌─────────────┬──────────────┬──────────┐
│ Email       │ Created      │ Metadata │
├─────────────┼──────────────┼──────────┤
│ c01@test... │ just now     │ role:... │
│ c02@test... │ just now     │ role:... │
│ admin@te... │ just now     │ role:... │
└─────────────┴──────────────┴──────────┘
```

## 5단계: 앱에서 Supabase 모드 테스트

### 5.1 개발 서버 확인
```bash
# 터미널에서 확인
npm run dev
# → http://localhost:5187 실행 중
```

### 5.2 브라우저에서 접속
```
1. http://localhost:5187 접속
2. ModeSelector 페이지 표시
3. "🔐 Supabase 모드" 클릭
   → /supabase/auth로 이동
4. SupabaseAuth 페이지 (로그인 폼)
```

### 5.3 로그인 테스트
```
이메일: c01@test.com
비밀번호: Password123!
[로그인] 클릭
↓
SupabaseCustomer 페이지 표시
(자동으로 /supabase/customer로 이동)
```

### 5.4 관리자 로그인 테스트
```
1. 로그아웃
   → /supabase/auth로 복귀
2. 다시 로그인
   이메일: admin@test.com
   비밀번호: Password123!
3. [로그인] 클릭
   → SupabaseAdmin 페이지 표시
   → 우측 상단에 "관리자" 표시
```

## 6단계: 공통 시나리오 테스트

### 6.1 시나리오 흐름
**두 개의 브라우저 탭 또는 시크릿 모드 사용**

**탭 1: 고객 C01**
```
1. c01@test.com으로 로그인
2. "로컬 모드에서처럼" 슬롯 선택
3. 9/9 오전, 오후 선택
4. 신청 완료
   → "신청이 완료되었습니다!" 메시지
   → 상태: "접수됨"
```

**탭 2: 고객 C02**
```
1. 새 탭에서 http://localhost:5187 접속
2. c02@test.com으로 로그인
3. 동일한 슬롯 선택
4. 9/9 오전 선택
5. 신청 완료
   → "신청이 완료되었습니다!" 메시지
   → 상태: "접수됨"
```

**탭 3: 관리자**
```
1. 또 다른 탭에서 http://localhost:5187 접속
2. admin@test.com으로 로그인
3. 신청 목록 표시
   - "#1 c01@test.com (v1) 접수됨"
   - "#2 c02@test.com (v1) 접수됨"
4. C01의 신청 클릭
5. 9/9 오전 슬롯 선택
6. [확정] 클릭
   → "확정되었습니다! 영향받은 요청: 1건"
   → C01 상태: "확정됨"
```

**탭 2 새로고침**
```
1. C02 탭 새로고침
2. 상태 변경 확인
   → "재선택 필요" (노란 경고)
3. [재선택하기] 클릭
4. 9/10 오전 선택
5. [재선택 제출] 클릭
   → "재선택이 완료되었습니다!" 메시지
   → version: 1 → 2
```

**탭 3: 관리자 C02 확정**
```
1. 관리자 탭 새로고침
2. C02의 재선택된 신청 클릭
   - "#2 c02@test.com (v2) 접수됨"
3. 9/10 오전 선택
4. [확정] 클릭
   → "확정되었습니다! 영향받은 요청: 0건"
   → C02 상태: "확정됨"
```

## 7단계: 결과 확인

### 7.1 각 페이지 확인
| 화면 | 확인 사항 |
|------|----------|
| C01 (고객) | ✅ 상태: 확정됨<br>✅ 확정 슬롯: 9/9 오전 |
| C02 (고객) | ✅ 상태: 확정됨<br>✅ 확정 슬롯: 9/10 오전 |
| 관리자 | ✅ 실행 기록 5건 표시<br>✅ 슬롯 현황: 2개 마감 |

### 7.2 운영 로그 확인 (관리자 페이지)
```
실행 기록 (최근 5건):
1. submit - C01 신청 - 성공
2. submit - C02 신청 - 성공
3. confirm - C01 확정 - 성공
4. reselect - C02 재선택 - 성공
5. confirm - C02 확정 - 성공
```

## 8단계: 추가 테스트 (선택사항)

### 8.1 에러 처리 테스트
```
1. 로그인하지 않고 /supabase/customer 접근
   → 로그인 페이지로 리다이렉트
   
2. 잘못된 이메일/비밀번호로 로그인 시도
   → "오류: 이메일 또는 비밀번호가 올바르지 않습니다" 표시
   
3. 고객이 확정 기능 호출 시도
   → RPC 에러: "Not authorized"
```

### 8.2 동시성 테스트
```
1. 두 탭에서 동일 슬롯 확정 시도
   → 하나만 성공, 다른 하나는 "Slot already confirmed" 에러
```

### 8.3 재로그인 테스트
```
1. 로그아웃
2. 다시 로그인
3. 이전 데이터 유지되는지 확인
   → ✅ 이전 신청 내역 표시됨
```

## 문제 해결

### 로그인 실패
```
증상: "Not authenticated" 또는 "Invalid credentials"
해결:
1. 이메일 정확히 확인
2. 비밀번호 정확히 확인
3. Supabase Dashboard에서 사용자 존재 확인
4. 환경 변수 (.env) 정확한지 확인
5. npm run dev로 서버 재시작
```

### "슬롯 조회 실패" 에러
```
증상: 슬롯 테이블이 로드되지 않음
해결:
1. SQL 스크립트가 정상 실행되었는지 확인
   SELECT count(*) FROM slots;
2. 42개 슬롯이 있는지 확인
3. RLS (Row Level Security) 정책 확인
   Supabase → Authentication → Policies
```

### 신청 실패
```
증상: "Customer ID mismatch" 또는 다른 RPC 에러
해결:
1. 올바른 사용자로 로그인했는지 확인
2. 환경 변수가 올바른 프로젝트를 가리키는지 확인
3. 브라우저 개발자 도구 → Network에서 RPC 호출 확인
4. Supabase Dashboard → Logs에서 에러 메시지 확인
```

### 권한 에러
```
증상: "Not authorized" (관리자가 아닌데 확정 시도 등)
해결:
1. Supabase Dashboard → Users에서 역할 확인
2. user_metadata.role이 "admin"인지 확인
3. 관리자로 로그아웃 후 다시 로그인
```

## 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] SQL 스크립트 실행 완료
- [ ] 42개 슬롯 데이터 확인
- [ ] 환경 변수 (.env) 업데이트
- [ ] 개발 서버 재시작
- [ ] 테스트 사용자 3명 생성
  - [ ] c01@test.com (고객)
  - [ ] c02@test.com (고객)
  - [ ] admin@test.com (관리자)
- [ ] Supabase 모드 로그인 테스트
- [ ] 공통 시나리오 (5단계) 완료
- [ ] 결과 기록

## 성공 판정

✅ 모든 조건 충족:
1. 고객 C01, C02가 독립적으로 신청 가능
2. 관리자가 C01 확정 후 C02 자동으로 "재선택 필요"
3. C02가 다른 슬롯으로 재선택 가능
4. 관리자가 C02 최종 확정 가능
5. 실행 기록이 모두 기록됨

---

**Supabase 모드 설정 가이드 완료**  
**소요 시간**: 약 15-20분  
**상태**: ✅ 준비 완료
