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

  // customerId는 URL 인코딩된 base64 JSON {name, email}
  let decodedCustomerId = customerId;
  let customerName = '';

  if (customerId) {
    try {
      // URL 디코딩 후 base64 디코딩, UTF-8 디코딩
      const urlDecoded = decodeURIComponent(customerId);
      const decodedString = decodeURIComponent(escape(atob(urlDecoded)));
      const decoded = JSON.parse(decodedString);
      customerName = decoded.name || '';
      // 내부적으로는 customerId를 고유하게 생성하기 위해 이메일을 해시 처리
      decodedCustomerId = `${decoded.name}:${decoded.email}`;
    } catch (e) {
      // 디코딩 실패 시 기존 customerId 사용 (호환성)
      decodedCustomerId = customerId;
    }
  }

  if (!customerId) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#d9534f' }}>신청자 정보가 없습니다.</p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/local/select')}
          style={{ marginTop: '20px' }}
        >
          신청자 정보 입력으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 고객 선택 변경 버튼 */}
      <div style={{ marginBottom: '20px', textAlign: 'right', fontSize: '12px', color: '#666' }}>
        {customerName && <span style={{ marginRight: '15px' }}>신청자: {customerName}</span>}
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/local/select')}
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          다른 신청자로 시작
        </button>
      </div>

      {/* CustomerPage에 customerId를 전달 */}
      <CustomerPage
        db={db}
        mode={mode}
        userId={decodedCustomerId}
      />
    </div>
  );
};
