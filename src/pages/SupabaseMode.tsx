import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export const SupabaseMode: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        const role = session.user?.user_metadata?.role;
        setIsAdmin(role === 'admin');
      }
      setLoading(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const role = session.user?.user_metadata?.role;
        setIsAdmin(role === 'admin');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/supabase/auth');
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', paddingTop: '60px' }}>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ paddingTop: '20px' }}>
        <Outlet />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>cal.dudu-works.com</h1>
          <div style={{ color: '#666', fontSize: '12px' }}>
            Supabase 모드
          </div>
        </div>

        <div className="role-selector">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div style={{ marginRight: '20px' }}>
              <strong>{user.email}</strong>
              {isAdmin && <span style={{ marginLeft: '10px', color: '#d9534f', fontWeight: 'bold' }}>관리자</span>}
            </div>
            <button
              className="btn btn-secondary"
              onClick={handleLogout}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              로그아웃
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleBack}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>

      <div className="alert alert-warning">
        <strong>Supabase 모드:</strong> 실제 데이터베이스와 Supabase 인증이 적용됩니다.
      </div>

      <div style={{ paddingTop: '20px' }}>
        <Outlet context={{ userId: user.id, isAdmin, mode: 'supabase' }} />
      </div>

      <hr style={{ margin: '40px 0', borderColor: '#ddd' }} />
      <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', paddingBottom: '20px' }}>
        <p>cal.dudu-works.com v1.0 - 수업용 기본 실습 앱</p>
        <p>기본값: 42슬롯(14일 × 3시간대), 고객 1-3개 희망, 어드민 수동 확정</p>
      </div>
    </div>
  );
};
