import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { DatabaseManager } from '../utils/database';
import { REFERENCE_TIME } from '../utils/constants';
import { supabase } from '../utils/supabaseClient';

export const LocalMode: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [db] = useState(() => new DatabaseManager());

  const handleRoleChange = async (newRole: 'customer' | 'admin') => {
    if (newRole === 'customer') {
      setRole(newRole);
      navigate('/local/select');
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      const hasGoogleLogin = session?.user?.identities?.some(id => id.provider === 'google');

      if (hasGoogleLogin) {
        setRole(newRole);
        navigate('/local/admin');
      } else {
        const confirmed = window.confirm('어드민 페이지는 Google 로그인이 필수입니다.\n\nSupabase 모드로 이동하여 Google로 로그인하시겠습니까?');
        if (confirmed) {
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          });
        }
      }
    }
  };

  const handleResetData = () => {
    if (window.confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      db.reset();
      window.location.reload();
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>cal.dudu-works.com</h1>
          <div className="reference-time">
            기준 시각: {REFERENCE_TIME.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} (고정)
          </div>
        </div>

        <div className="role-selector">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>역할</span>
            <button
              className={`btn ${role === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleRoleChange('customer')}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              고객
            </button>
            <button
              className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleRoleChange('admin')}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              어드민
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleResetData}
              style={{ padding: '6px 12px', fontSize: '12px', marginLeft: '10px' }}
            >
              데이터 초기화
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleBack}
              style={{ padding: '6px 12px', fontSize: '12px', marginLeft: '10px' }}
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        <strong>로컬 모드:</strong> 브라우저 로컬 스토리지에 데이터를 저장합니다. 진짜 인증이 아닌 수업용 데모입니다.
        역할 전환은 이 모드에만 있습니다.
      </div>

      <div style={{ paddingTop: '20px' }}>
        <Outlet context={{ db, mode: 'local' }} />
      </div>

      <hr style={{ margin: '40px 0', borderColor: '#ddd' }} />
      <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', paddingBottom: '20px' }}>
        <p>cal.dudu-works.com v1.0 - 수업용 기본 실습 앱</p>
        <p>기본값: 42슬롯(14일 × 3시간대), 고객 1-3개 희망, 어드민 수동 확정</p>
      </div>
    </div>
  );
};
