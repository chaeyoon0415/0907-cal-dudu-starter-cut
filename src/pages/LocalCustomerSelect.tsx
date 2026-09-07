import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LocalCustomerSelect: React.FC = () => {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState('C01');

  const handleStart = () => {
    if (customerId.trim()) {
      navigate(`/local/customer/${customerId}`);
    }
  };

  const handlePredefined = (id: string) => {
    navigate(`/local/customer/${id}`);
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
        <h2>고객 선택</h2>
        <p style={{ color: '#666', marginTop: '10px' }}>
          신청할 고객을 선택하세요
        </p>
      </div>

      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '30px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div className="form-group">
          <label>고객 코드 입력</label>
          <input
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="C01, C02 등"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleStart();
              }
            }}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleStart}
          style={{ width: '100%' }}
          disabled={!customerId.trim()}
        >
          시작하기
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '600px' }}>
        <p style={{ color: '#666', marginBottom: '15px', fontSize: '14px' }}>
          또는 미리 설정된 고객을 선택하세요:
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px'
        }}>
          {['C01', 'C02', 'C03', 'C04', 'C05', 'C06'].map((id) => (
            <button
              key={id}
              className="btn btn-secondary"
              onClick={() => handlePredefined(id)}
              style={{
                padding: '12px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {id}로 시작
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
        각 고객은 독립적인 세션에서 진행됩니다.
      </p>
    </div>
  );
};
