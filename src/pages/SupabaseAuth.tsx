import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthPanel } from '../components/AuthPanel';

export const SupabaseAuth: React.FC = () => {
  const navigate = useNavigate();

  const handleAuthChange = (userId: string | null, isAdmin: boolean) => {
    if (userId) {
      navigate(isAdmin ? '/supabase/admin' : '/supabase/customer');
    }
  };

  return (
    <div className="container">
      <div style={{
        textAlign: 'center',
        paddingTop: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px'
      }}>
        <div>
          <h1>cal.dudu-works.com</h1>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Supabase 모드 - 로그인
          </p>
        </div>

        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '30px',
          width: '100%',
          maxWidth: '400px'
        }}>
          <AuthPanel onAuthChange={handleAuthChange} />
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate('/')}
          style={{ marginTop: '20px' }}
        >
          돌아가기
        </button>

        <hr style={{ margin: '40px 0', borderColor: '#ddd', width: '100%' }} />

        <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
          <p>cal.dudu-works.com v1.0 - 수업용 기본 실습 앱</p>
          <p>Supabase Auth로 안전하게 로그인합니다.</p>
        </div>
      </div>
    </div>
  );
};
