# Google 로그인 설정 가이드

## 개요

Supabase 모드에서 이메일/비밀번호 로그인과 **Google OAuth 로그인**을 모두 지원합니다.

## 📋 설정 단계

### Step 1: Google Cloud Console 설정 (5분)

#### 1.1 프로젝트 생성 또는 선택
```
1. https://console.cloud.google.com 접속
2. 상단의 프로젝트 선택 드롭다운
3. "새 프로젝트" 클릭 (또는 기존 프로젝트 선택)
   - 프로젝트 이름: cal-dudu (또는 원하는 이름)
   - [만들기] 클릭
```

#### 1.2 OAuth 동의 화면 설정
```
1. 좌측 메뉴 "API 및 서비스" → "OAuth 동의 화면"
2. User Type 선택
   - "외부" 선택 (테스트용) 또는 "내부" (프로덕션)
   - [만들기] 클릭
3. OAuth 동의 화면 양식 작성
   - 앱 이름: cal.dudu
   - 사용자 지원 이메일: 자신의 이메일
   - 개발자 연락처: 자신의 이메일
   - [저장 및 계속] 클릭
4. 범위 설정
   - 기본값 유지 (또는 필요한 범위 추가)
   - [저장 및 계속] 클릭
5. 테스트 사용자 추가 (선택사항)
   - 테스트 이메일 추가
   - [저장 및 계속] 클릭
```

#### 1.3 OAuth 클라이언트 ID 생성
```
1. 좌측 메뉴 "API 및 서비스" → "사용자 인증 정보"
2. "+ 사용자 인증 정보 만들기" 클릭
3. "OAuth 2.0 클라이언트 ID" 선택
4. 애플리케이션 유형 선택
   - "웹 애플리케이션" 선택
5. 이름 설정
   - 이름: cal-dudu-oauth (또는 원하는 이름)
6. 승인된 리디렉션 URI 추가
   ├─ http://localhost:5187/auth/callback
   ├─ http://localhost:5187/
   └─ https://[프로젝트ID].supabase.co/auth/v1/callback
   (모두 추가)
7. [만들기] 클릭
8. 팝업에서 확인
   ├─ 클라이언트 ID 복사 (저장해두기)
   └─ 클라이언트 보안 비밀번호 복사 (저장해두기)
9. [닫기] 클릭
```

### Step 2: Supabase에서 설정 (3분)

#### 2.1 Supabase Dashboard 접속
```
1. https://supabase.com → 프로젝트 선택
2. Dashboard 열기
```

#### 2.2 Google OAuth 설정
```
1. 좌측 메뉴 "Authentication"
2. "Providers" 탭 클릭
3. "Google" 찾기
4. Google 공급자 클릭
   - "Enabled" 토글 ON
5. 정보 입력
   ├─ Client ID: [Google Cloud에서 복사한 ID 붙여넣기]
   └─ Client Secret: [Google Cloud에서 복사한 비밀번호 붙여넣기]
6. "Save" 클릭
```

#### 2.3 리디렉션 URL 확인
```
Supabase Dashboard → Authentication → URL Configuration
├─ Site URL: http://localhost:5187 (로컬 개발)
│         또는 https://yourdomain.com (프로덕션)
└─ Redirect URLs (자동으로 생성됨)
   └─ https://[프로젝트ID].supabase.co/auth/v1/callback
```

### Step 3: 앱에서 테스트 (2분)

#### 3.1 브라우저에서 테스트
```
1. http://localhost:5187 접속
2. "🔐 Supabase 모드" 클릭
3. SupabaseAuth 페이지 (로그인 폼)
4. "🔵 Google로 로그인" 버튼 클릭
   ↓
5. Google 로그인 팝업
   - Google 계정 선택 또는 로그인
   - "cal.dudu가 계정 접근을 요청 중입니다"
   - [허용] 클릭
   ↓
6. 자동 리디렉트
   - /auth/callback 페이지 (로딩 중...)
   - 잠깐 후 /supabase/customer로 자동 이동
   ↓
7. SupabaseCustomer 페이지 표시
   - 로그인 완료!
   - 슬롯 테이블 로드
```

## 🧪 테스트

### 로그인 테스트
```
1. Google 계정으로 로그인
2. 메인 페이지로 자동 이동
3. 사용자 이메일 표시됨
4. 슬롯 테이블 로드됨
```

### 역할 테스트
```
문제: Google 로그인 후 역할이 설정되지 않음
해결: Supabase Dashboard에서 user_metadata 설정
    1. Users → 사용자 선택
    2. User metadata 편집
    3. {"role": "customer"} 또는 {"role": "admin"}
    4. 저장
    5. 다시 로그인
```

### 로그아웃 테스트
```
1. 우측 상단 [로그아웃] 버튼 클릭
2. /supabase/auth로 자동 이동
3. 로그인 폼 재표시
```

## 🔍 문제 해결

### "리디렉션 URI가 일치하지 않습니다"
```
해결책:
1. Google Cloud Console 확인
   - 승인된 리디렉션 URI에 다음이 모두 있는지 확인:
   ├─ http://localhost:5187/auth/callback
   └─ http://localhost:5187/ (또는 프로덕션 도메인)
2. Supabase → URL Configuration
   - Site URL이 올바른지 확인
3. 변경 후 5-10분 대기 (캐시 갱신)
4. 다시 시도
```

### "로그인이 안 됨" 또는 "Error"
```
해결책:
1. 브라우저 개발자 도구 → 콘솔
   - 에러 메시지 확인
2. Supabase Dashboard → Logs
   - 로그 확인 ("Authentication" 탭)
3. 확인 사항:
   ├─ Client ID 정확함
   ├─ Client Secret 정확함
   ├─ Google OAuth 동의 화면 설정됨
   └─ OAuth 클라이언트가 "웹 애플리케이션" 유형
```

### "사용자가 생성되지만 역할이 없음"
```
해결책:
1. Google 로그인 후 user_metadata에 역할 추가
   - Supabase Dashboard
   - Authentication → Users
   - 해당 사용자 선택
   - "User metadata" 편집
   - {"role": "customer"} 입력
   - 저장
2. 또는 사전에 설정
   - 테스트 이메일을 테스트 사용자로 등록
   - user_metadata 사전 설정
```

### "Google 계정이 허용되지 않음"
```
해결책:
1. 테스트 사용자인지 확인
   - 테스트 이메일로 로그인했는지 확인
2. 테스트 이메일 추가
   - Google Cloud Console
   - OAuth 동의 화면 → 테스트 사용자
   - 이메일 추가
   - 3-5분 대기
3. 다시 시도
```

## 📱 로컬 vs 프로덕션

### 로컬 개발 (현재)
```
Site URL: http://localhost:5187
Redirect URIs:
  ├─ http://localhost:5187/auth/callback
  └─ http://localhost:5187/
OAuth 클라이언트 유형: 웹 애플리케이션
테스트 사용자 필요: 예 (테스트 단계에서)
```

### 프로덕션 배포 (나중)
```
Site URL: https://yourdomain.com
Redirect URIs:
  ├─ https://yourdomain.com/auth/callback
  └─ https://yourdomain.com/
  └─ https://[프로젝트ID].supabase.co/auth/v1/callback
OAuth 클라이언트 유형: 웹 애플리케이션
테스트 사용자 필요: 아니오 (모든 Google 계정 지원)
```

## 🔐 보안 참고

### 클라이언트 ID
- ✅ 공개해도 안전 (Supabase에서 공개됨)
- 코드에 저장 가능

### 클라이언트 보안 비밀번호
- ⚠️ **절대 공개하지 않기**
- 코드에 저장하지 않기
- .env 파일에 저장하지 않기
- Supabase에서만 관리

## ✅ 체크리스트

Google 로그인 설정 완료:
- [ ] Google Cloud 프로젝트 생성
- [ ] OAuth 동의 화면 설정됨
- [ ] OAuth 클라이언트 ID 생성
- [ ] Client ID 복사됨
- [ ] Client Secret 복사됨
- [ ] Supabase에서 Google OAuth 활성화
- [ ] Client ID/Secret 입력됨
- [ ] 리디렉션 URI 설정됨
- [ ] 로컬에서 로그인 테스트 성공
- [ ] 역할 설정 완료 (customer/admin)

## 📚 관련 문서

- SUPABASE_QUICK_START.md - 빠른 시작 가이드
- SUPABASE_SETUP.md - 완전 설정 가이드
- ROUTING.md - 라우트 구조

## 🎯 다음 단계

1. ✅ 구글 로그인 구현 완료 (지금)
2. ⏳ Google Cloud 및 Supabase 설정 (사용자)
3. ⏳ 로컬에서 테스트
4. ⏳ 프로덕션 배포 (나중)

---

**Google 로그인 설정 가이드 완료**  
**구현 상태**: ✅  
**설정 필요**: ⏳  
**테스트 가능**: 설정 후
