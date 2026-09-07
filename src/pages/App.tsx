import React, { useState } from 'react';
import { CustomerPage } from '../components/CustomerPage';
import { AdminPage } from '../components/AdminPage';
import { DatabaseManager } from '../utils/database';
import { AuthPanel } from '../components/AuthPanel';
import { REFERENCE_TIME } from '../utils/constants';

type Mode = 'local' | 'supabase';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('local');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [db] = useState(() => new DatabaseManager());
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleRoleChange = (newRole: 'customer' | 'admin') => {
    // 로컬 모드에서만 역할 전환 가능
    if (mode === 'local') {
      setRole(newRole);
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    if (newMode === 'local') {
      setRole('customer');
      setUserId(null);
      setIsAdmin(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      db.reset();
      window.location.reload();
    }
  };

  const handleAuthChange = (newUserId: string | null, newIsAdmin: boolean) => {
    setUserId(newUserId);
    setIsAdmin(newIsAdmin);
    if (newUserId) {
      setRole(newIsAdmin ? 'admin' : 'customer');
    }
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
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>모드</span>
            <button
              className={`btn ${mode === 'local' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleModeChange('local')}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              로컬 모드
            </button>
            <button
              className={`btn ${mode === 'supabase' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleModeChange('supabase')}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Supabase 모드
            </button>
          </div>

          {mode === 'local' && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: '20px' }}>
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
            </div>
          )}
        </div>
      </div>

      {mode === 'local' && (
        <div className="alert alert-info">
          <strong>로컬 모드:</strong> 브라우저 로컬 스토리지에 데이터를 저장합니다. 진짜 인증이 아닌 수업용 데모입니다.
          역할 전환은 이 모드에만 있습니다.
        </div>
      )}

      {mode === 'supabase' && (
        <>
          <div className="alert alert-warning">
            <strong>Supabase 모드:</strong> 실제 데이터베이스와 Supabase 인증이 적용됩니다.
          </div>
          <AuthPanel onAuthChange={handleAuthChange} />
        </>
      )}

      {mode === 'local' && (
        <>
          {role === 'customer' && <CustomerPage db={db} mode={mode} />}
          {role === 'admin' && <AdminPage db={db} mode={mode} />}
        </>
      )}

      {mode === 'supabase' && userId && (
        <>
          {role === 'customer' && <CustomerPage db={db} mode={mode} userId={userId} isAdmin={isAdmin} />}
          {role === 'admin' && <AdminPage db={db} mode={mode} userId={userId} isAdmin={isAdmin} />}
        </>
      )}

      {mode === 'supabase' && !userId && (
        <div className="alert alert-info" style={{ marginTop: '20px' }}>
          로그인하여 예약을 시작하세요.
        </div>
      )}

      <hr style={{ margin: '40px 0', borderColor: '#ddd' }} />
      <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', paddingBottom: '20px' }}>
        <p>cal.dudu-works.com v1.0 - 수업용 기본 실습 앱</p>
        <p>기본값: 42슬롯(14일 × 3시간대), 고객 1-3개 희망, 어드민 수동 확정</p>
      </div>
    </div>
  );
};

export default App;
