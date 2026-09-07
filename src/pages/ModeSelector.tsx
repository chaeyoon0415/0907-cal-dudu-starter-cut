import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ModeSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div style={{
        textAlign: 'center',
        paddingTop: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px'
      }}>
        <div>
          <h1>cal.dudu-works.com</h1>
          <p style={{ color: '#666', marginTop: '10px' }}>
            예약 시스템 - 모드를 선택하세요
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '30px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {/* 로컬 모드 */}
          <div style={{
            border: '2px solid #007bff',
            borderRadius: '8px',
            padding: '30px',
            width: '300px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
          onClick={() => navigate('/local/select')}>
            <h2 style={{ color: '#007bff', margin: '0 0 10px 0' }}>📱 로컬 모드</h2>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
              브라우저 로컬 스토리지를 사용합니다.
              <br />
              수업용 데모 환경입니다.
              <br />
              역할 전환으로 테스트할 수 있습니다.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>
              로컬 모드 시작
            </button>
          </div>

          {/* Supabase 모드 */}
          <div style={{
            border: '2px solid #28a745',
            borderRadius: '8px',
            padding: '30px',
            width: '300px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(40,167,69,0.3)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
          onClick={() => navigate('/supabase/auth')}>
            <h2 style={{ color: '#28a745', margin: '0 0 10px 0' }}>🔐 Supabase 모드</h2>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
              실제 Supabase 데이터베이스를 사용합니다.
              <br />
              Supabase Auth로 인증합니다.
              <br />
              다중 사용자 환경을 테스트할 수 있습니다.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '20px', width: '100%', background: '#28a745' }}>
              Supabase 모드 시작
            </button>
          </div>
        </div>

        <hr style={{ margin: '40px 0', borderColor: '#ddd', width: '100%' }} />

        <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
          <p>cal.dudu-works.com v1.0 - 수업용 기본 실습 앱</p>
          <p>기본값: 42슬롯(14일 × 3시간대), 고객 1-3개 희망, 어드민 수동 확정</p>
        </div>
      </div>
    </div>
  );
};
