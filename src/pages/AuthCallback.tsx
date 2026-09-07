import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase는 자동으로 세션을 설정합니다.
    // 이 페이지는 OAuth 콜백 후 자동으로 리디렉트됩니다.

    const timer = setTimeout(() => {
      // 세션 설정 완료 후 홈으로 이동
      navigate('/');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container">
      <div style={{
        textAlign: 'center',
        paddingTop: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <h2>로그인 처리 중...</h2>
        <p style={{ color: '#666' }}>
          잠깐만 기다려주세요.
        </p>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f0f0f0',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    </div>
  );
};
