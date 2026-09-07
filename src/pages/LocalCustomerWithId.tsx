import React from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { CustomerPage } from '../components/CustomerPage';
import type { DatabaseManager } from '../utils/database';

interface LocalContextType {
  db: DatabaseManager;
  mode: 'local';
}

export const LocalCustomerWithId: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { db, mode } = useOutletContext<LocalContextType>();

  if (!customerId) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#d9534f' }}>고객 코드가 없습니다.</p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/local/select')}
          style={{ marginTop: '20px' }}
        >
          고객 선택으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 고객 선택 변경 버튼 */}
      <div style={{ marginBottom: '20px', textAlign: 'right' }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/local/select')}
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          다른 고객으로 시작
        </button>
      </div>

      {/* CustomerPage에 customerId를 고정으로 전달 */}
      <CustomerPage
        db={db}
        mode={mode}
        userId={customerId}
      />
    </div>
  );
};
