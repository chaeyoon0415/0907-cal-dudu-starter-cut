import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LocalCustomerSelect: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleStart = () => {
    setError('');

    if (!name.trim()) {
      setError('이름을 입력하세요');
      return;
    }

    if (!email.trim()) {
      setError('이메일 주소를 입력하세요');
      return;
    }

    if (!validateEmail(email)) {
      setError('유효한 이메일 형식을 입력하세요');
      return;
    }

    // customerId를 name:email 형식으로 생성 (UTF-8 + base64 인코딩)
    const jsonString = JSON.stringify({ name: name.trim(), email: email.trim() });
    const customerData = btoa(unescape(encodeURIComponent(jsonString)));
    // URL 인코딩으로 base64의 특수문자 처리
    navigate(`/local/customer/${encodeURIComponent(customerData)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  return (
    <div style={{
      textAlign: 'center',
      paddingTop: '40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '30px'
    }}>
      <div>
        <h2>신청자 정보 입력</h2>
        <p style={{ color: '#666', marginTop: '10px' }}>
          예약을 신청할 분의 이름과 이메일 주소를 입력하세요.
        </p>
      </div>

      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '30px',
        width: '100%',
        maxWidth: '400px'
      }}>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label>이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            onKeyPress={handleKeyPress}
          />
        </div>

        <div className="form-group">
          <label>이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소를 입력하세요"
            onKeyPress={handleKeyPress}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleStart}
          style={{ width: '100%' }}
          disabled={!name.trim() || !email.trim()}
        >
          시작하기
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
        입력하신 정보는 예약 신청에 사용됩니다.
      </p>
    </div>
  );
};
