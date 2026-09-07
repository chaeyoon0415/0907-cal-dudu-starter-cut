# Supabase 모드 빠른 시작 (5분)

## 📋 사전 체크

```bash
# 1. 개발 서버 실행 확인
npm run dev
# → http://localhost:5187 실행 중인지 확인

# 2. .env 파일 확인
cat .env
# → VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY 있는지 확인
```

## ⚡ 빠른 설정 (3가지 옵션)

### 옵션 A: 기존 Supabase 프로젝트 사용 (추천)
```
현재 .env에 설정되어 있는 Supabase 프로젝트 사용
URL: https://jxhaeaayirmufkbtepdq.supabase.co
(이미 SQL 스크립트가 설치되어 있을 수 있음)
```

**다음으로**: [테스트 사용자 생성](#테스트-사용자-생성)

### 옵션 B: 새 Supabase 프로젝트 생성
```
1. https://supabase.com → "Start your project"
2. GitHub로 로그인
3. 새 프로젝트 생성 (이름: cal-dudu)
4. 프로젝트 완료 후 SQL Editor 열기
5. SUPABASE_SETUP.md 2단계 진행 (SQL 스크립트 실행)
6. .env 파일 업데이트 (새 URL과 키)
```

**다음으로**: [테스트 사용자 생성](#테스트-사용자-생성)

### 옵션 C: 테스트 전용 (로컬 모드로만 진행)
```
로컬 모드에서 완전히 테스트 가능
(Supabase 모드는 나중에 준비)
→ http://localhost:5187 → "로컬 모드" 선택
```

---

## 테스트 사용자 생성

### 단계 1: Supabase Dashboard 접속
```
1. https://supabase.com → 프로젝트 선택
2. Dashboard 열기
```

### 단계 2: 사용자 추가
```
Authentication (좌측 메뉴)
  ↓
Users
  ↓
Add user (버튼)
```

### 단계 3: 세 사용자 생성

#### 사용자 1️⃣ - 고객 C01
```
Email: c01@example.com
Password: Test123!@
Confirm: Test123!@
User metadata:
{
  "role": "customer"
}
✓ Create user
```

#### 사용자 2️⃣ - 고객 C02
```
Email: c02@example.com
Password: Test123!@
Confirm: Test123!@
User metadata:
{
  "role": "customer"
}
✓ Create user
```

#### 사용자 3️⃣ - 관리자
```
Email: admin@example.com
Password: Test123!@
Confirm: Test123!@
User metadata:
{
  "role": "admin"
}
✓ Create user
```

---

## 🚀 앱에서 테스트

### 로그인 테스트
```
1. http://localhost:5187 접속
2. "🔐 Supabase 모드" 클릭
   ↓ /supabase/auth
3. 이메일/비밀번호 입력
   Email: c01@example.com
   Password: Test123!@
4. [로그인] 클릭
   ↓ /supabase/customer (자동 이동)
```

### 예상 결과
```
✅ SupabaseCustomer 페이지 표시
✅ "로그인됨" 상태 표시
✅ 슬롯 테이블 로드 (42개)
✅ 신청 가능
```

---

## 🧪 간단한 시나리오 테스트

### 2개 브라우저 탭 사용

**탭 1: 고객 C01**
```
1. http://localhost:5187
2. Supabase 모드 → c01@example.com 로그인
3. 슬롯 선택: 9/9 오전, 오후
4. [신청] → "완료! 신청이 완료되었습니다!"
```

**탭 2: 고객 C02**
```
1. http://localhost:5187
2. Supabase 모드 → c02@example.com 로그인
3. 슬롯 선택: 9/9 오전 (C01과 동일)
4. [신청] → "완료! 신청이 완료되었습니다!"
```

**탭 3: 관리자**
```
1. http://localhost:5187
2. Supabase 모드 → admin@example.com 로그인
3. 신청 목록: 2개 표시
4. C01 클릭 → 9/9 오전 선택
5. [확정] → "확정되었습니다! 영향받은 요청: 1건"
6. 탭 2 새로고침 → C02 상태 "재선택 필요"로 변경됨
```

---

## ✅ 성공 판정

테스트가 성공했다면:

- [x] Supabase 모드에서 로그인 가능
- [x] 슬롯 테이블이 정상 로드됨
- [x] 여러 고객이 동시에 신청 가능
- [x] 관리자가 확정하면 다른 고객에게 즉시 영향
- [x] 모든 데이터가 실제 Supabase DB에 저장됨

---

## 🐛 만약 실패하면?

### "슬롯 조회 실패: ..."
```
✓ Supabase Dashboard → SQL Editor
✓ SELECT count(*) FROM slots;
→ 42개가 맞는지 확인
→ 없으면 sql/00_supabase.sql 다시 실행
```

### "로그인 실패" 또는 "Not authenticated"
```
✓ 사용자가 실제로 생성되었는지 확인
✓ 이메일/비밀번호가 정확한지 확인
✓ .env 파일이 올바른 프로젝트를 가리키는지 확인
✓ 브라우저 개발자 도구 → 콘솔에서 에러 메시지 확인
```

### "이미 확정된 슬롯입니다"
```
✓ 정상 동작 (중복 확정 방지)
✓ 다른 슬롯으로 확정 시도
```

---

## 📚 더 자세한 정보

- **완전 가이드**: SUPABASE_SETUP.md (8단계, 15-20분)
- **라우트 구조**: ROUTING.md
- **공통 시나리오**: TEST_EXECUTION.md

---

## 🎯 다음 단계

1. ✅ 로컬 모드 테스트 완료
2. ⏳ Supabase 모드 설정 진행 (지금)
3. ⏳ 공통 시나리오 테스트
4. ⏳ 배포 준비

---

**Supabase 모드 빠른 시작 완료**  
**소요 시간**: 5-10분  
**상태**: 🟢 준비 완료
