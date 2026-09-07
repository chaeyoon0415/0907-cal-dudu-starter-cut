import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface AuthPanelProps {
  onAuthChange: (userId: string | null, isAdmin: boolean) => void;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({ onAuthChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 현재 세션 확인
  React.useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        // app_metadata에서 admin 역할 확인
        const role = session.user?.user_metadata?.role;
        const admin = role === 'admin';
        setIsAdmin(admin);
        onAuthChange(session.user.id, admin);
      }
    };

    checkSession();

    // auth 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const role = session.user?.user_metadata?.role;
        const admin = role === 'admin';
        setIsAdmin(admin);
        onAuthChange(session.user.id, admin);
      } else {
        setUser(null);
        setIsAdmin(false);
        onAuthChange(null, false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [onAuthChange]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      setEmail('');
      setPassword('');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'customer',
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setEmail('');
      setPassword('');
      setError('가입되었습니다. 이메일을 확인하세요.');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  if (user) {
    return (
      <div className="auth-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{user.email}</strong>
            {isAdmin && <span style={{ marginLeft: '10px', color: '#d9534f' }}>관리자</span>}
          </div>
          <button className="btn btn-secondary" onClick={handleLogout} disabled={loading}>
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <form onSubmit={handleLogin} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
        <div>
          <label>
            이메일:
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </label>
        </div>
        <div>
          <label>
            비밀번호:
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '처리 중...' : '로그인'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleSignUp} disabled={loading}>
          {loading ? '처리 중...' : '가입'}
        </button>
      </form>
      {error && <div className="alert alert-error" style={{ marginTop: '10px' }}>{error}</div>}
    </div>
  );
};
