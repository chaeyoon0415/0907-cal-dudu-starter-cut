import React, { useState, useEffect } from 'react';
import { SlotTable } from './SlotTable';
import type { Slot, Request, Candidate } from '../types';
import { OperationManager } from '../utils/operations';
import { SupabaseOperationManager } from '../utils/supabaseOperations';
import { DatabaseManager } from '../utils/database';
import { decideRequestStatus } from '../utils/decide';
import { TIME_SLOTS, formatExpectedConfirmTime } from '../utils/constants';

interface CustomerPageProps {
  db: DatabaseManager;
  mode: 'local' | 'supabase';
  userId?: string;
  isAdmin?: boolean;
}

export const CustomerPage: React.FC<CustomerPageProps> = ({ db, mode, userId = '' }) => {
  const [customerId] = useState<string>(userId || 'C01');
  const [displayName, setDisplayName] = useState<string>('');
  const [stage, setStage] = useState<'select' | 'confirm' | 'view' | 'reselect'>('select');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [slots, setSlots] = useState<Record<string, Slot>>({});
  const [customerRequests, setCustomerRequests] = useState<
    Array<{ request: Request; candidates: Candidate[]; decision: any }>
  >([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // customerId가 "name:email" 형식인 경우 name 추출
  React.useEffect(() => {
    if (customerId && customerId.includes(':')) {
      const parts = customerId.split(':');
      setDisplayName(parts[0]);
    } else {
      setDisplayName(customerId);
    }
  }, [customerId]);

  const om = new OperationManager(db);
  const som = new SupabaseOperationManager();

  // 초기 로드
  useEffect(() => {
    loadData();
  }, [customerId, mode]);

  const loadData = async () => {
    setError('');
    setSuccess('');

    try {
      if (mode === 'local') {
        const state = db.getState();
        setSlots(state.slots);
        const status = om.getCustomerStatus(customerId);
        setCustomerRequests(status);

        if (status.length === 0) {
          setStage('select');
          setSelectedSlots([]);
        } else {
          const latest = status[status.length - 1];
          if (latest.request.status === 'needs_reselection') {
            setStage('reselect');
          } else if (latest.request.status === 'confirmed') {
            setStage('view');
          } else {
            setStage('view');
          }
        }
      } else {
        // Supabase 모드
        const [slotsResult, requestsResult] = await Promise.all([
          som.getSlots(),
          som.getCustomerRequests(customerId),
        ]);

        if (slotsResult.error) {
          setError(`슬롯 조회 실패: ${slotsResult.error}`);
          return;
        }

        if (requestsResult.error) {
          setError(`신청 조회 실패: ${requestsResult.error}`);
          return;
        }

        const slotsMap: Record<string, Slot> = {};
        slotsResult.slots.forEach(slot => {
          slotsMap[slot.id] = slot;
        });
        setSlots(slotsMap);

        const status = requestsResult.requests.map(({ request, candidates }) => ({
          request,
          candidates,
          decision: { status: request.status === 'confirmed' ? 'ok' : 'ok' },
        }));
        setCustomerRequests(status);

        if (status.length === 0) {
          setStage('select');
          setSelectedSlots([]);
        } else {
          const latest = status[status.length - 1];
          if (latest.request.status === 'needs_reselection') {
            setStage('reselect');
          } else if (latest.request.status === 'confirmed') {
            setStage('view');
          } else {
            setStage('view');
          }
        }
      }
    } catch (err) {
      setError(`데이터 로드 실패: ${String(err)}`);
    }
  };

  const handleSlotToggle = (slotId: string) => {
    setSelectedSlots(prev => {
      if (prev.includes(slotId)) {
        return prev.filter(s => s !== slotId);
      } else if (prev.length < 3) {
        return [...prev, slotId];
      }
      return prev;
    });
    setError('');
  };

  const handleSubmit = async () => {
    if (selectedSlots.length === 0) {
      setError('최소 1개 이상의 슬롯을 선택하세요');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let result: any;
      if (mode === 'local') {
        const operationId = `submit-${customerId}-${Date.now()}`;
        result = await om.submitRequest(customerId, selectedSlots, operationId);
      } else {
        result = await som.submitRequest(customerId, selectedSlots);
      }

      if (result.success) {
        setSuccess('신청이 완료되었습니다!');
        setSelectedSlots([]);
        setStage('view');
        setTimeout(() => loadData(), 500);
      } else {
        setError(result.error || '신청 실패');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReselect = async () => {
    if (selectedSlots.length === 0) {
      setError('최소 1개 이상의 슬롯을 선택하세요');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const latest = customerRequests[customerRequests.length - 1];
      let result: any;

      if (mode === 'local') {
        const operationId = `reselect-${latest.request.id}-${Date.now()}`;
        result = await om.resubmitRequest(
          customerId,
          latest.request.id,
          selectedSlots,
          operationId
        );
      } else {
        result = await som.resubmitRequest(
          customerId,
          latest.request.id,
          selectedSlots
        );
      }

      if (result.success) {
        setSuccess('재선택이 완료되었습니다!');
        setSelectedSlots([]);
        setStage('view');
        setTimeout(() => loadData(), 500);
      } else {
        setError(result.error || '재선택 실패');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedSlots([]);
    // confirm 단계에서 돌아갈 때는 select 단계로, reselect 단계에서는 view 단계로
    if (stage === 'confirm') {
      setStage('select');
    } else if (stage === 'reselect') {
      setStage('view');
    } else {
      setStage('view');
    }
    setError('');
  };

  // 슬롯 상태가 변경되었는지 확인
  const checkSlotAvailability = () => {
    if (stage === 'confirm' && customerRequests.length > 0) {
      const latest = customerRequests[customerRequests.length - 1];
      const currentState = db.getState();
      const decision = decideRequestStatus(latest.request, currentState.candidates, currentState.slots);

      if (decision.status !== 'ok') {
        setError('선택한 슬롯의 상태가 변경되었습니다. 다시 선택해주세요.');
        setStage('reselect');
        setSelectedSlots([]);
        return false;
      }
    }
    return true;
  };

  return (
    <div className="customer-page">
      {mode === 'local' && (
        <div style={{ marginBottom: '20px', padding: '12px', background: '#f9f9f9', borderRadius: '4px' }}>
          <label style={{ fontWeight: 'bold' }}>신청자: </label>
          <span>{displayName || customerId}</span>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {stage === 'select' && (
        <div>
          <h3>슬롯 선택 (1~3개)</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            원하는 슬롯을 선택하고 제출하세요. 선택 순서가 희망 우선순위입니다.
          </p>
          <SlotTable
            slots={slots}
            selectedSlots={selectedSlots}
            onToggle={handleSlotToggle}
            mode="select"
            maxSelect={3}
          />

          <div className="selected-slots-list">
            <h4>선택한 슬롯 (우선순위 순)</h4>
            <ul className="list">
              {selectedSlots.map((slotId, idx) => {
                const slot = slots[slotId];
                return (
                  <li key={slotId}>
                    <span>
                      {idx + 1}. {slot?.date} {TIME_SLOTS.find(t => t.label === slot?.timeLabel)?.displayLabel}
                    </span>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleSlotToggle(slotId)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      제거
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setStage('confirm')}
            disabled={selectedSlots.length === 0 || loading}
          >
            다음: 최종 확인
          </button>
        </div>
      )}

      {stage === 'confirm' && checkSlotAvailability() && (
        <div>
          <h3>최종 확인</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            다음과 같이 신청합니다. 제출하면 어드민이 확인 후 확정합니다.
          </p>
          <SlotTable slots={slots} selectedSlots={selectedSlots} onToggle={() => {}} mode="confirm" />

          {/* 선택한 시간 정리 카드 */}
          <div className="selected-slots-list" style={{ marginTop: '30px' }}>
            <h4>선택한 시간 (우선순위 순)</h4>
            <ul className="list">
              {selectedSlots.map((slotId, idx) => {
                const slot = slots[slotId];
                const timeSlot = TIME_SLOTS.find(t => t.label === slot?.timeLabel);
                return (
                  <li key={slotId} style={{ background: '#e1f5fe', borderColor: '#81d4fa' }}>
                    <span style={{ color: '#0277bd', fontWeight: '500' }}>
                      {idx + 1}. {slot?.date} {timeSlot?.timeRange}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? '처리 중...' : '제출'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              돌아가기
            </button>
          </div>
        </div>
      )}

      {stage === 'view' && customerRequests.length > 0 && (
        <div>
          <h3>내 신청 현황</h3>
          {customerRequests.map((item, idx) => (
            <div key={item.request.id} className="request-status-card">
              <div className="request-header">
                <h4>신청 #{item.request.version} (접수일: {new Date(item.request.createdAt).toLocaleString()})</h4>
              </div>

              {item.request.status === 'received' && (
                <div className="status-highlight-section">
                  <div className="status-label">접수됨 (관리자 확인 중)</div>
                  {item.request.expectedConfirmAt && (
                    <>
                      <div className="confirm-date-display">
                        {formatExpectedConfirmTime(item.request.expectedConfirmAt)}까지<br />
                        확정 예정입니다
                      </div>
                      <div className="status-info-text">
                        관리자가 신청 내용을 확인한 후 예약을 확정합니다.
                      </div>
                      <div className="status-info-text">
                        확정이 완료되면 입력하신 이메일로 확정 안내 메일을 보내드립니다.
                      </div>
                      <div className="status-note">
                        ※ 금요일 오후 또는 주말에 신청하신 경우, 주말을 제외하고 다음 영업일에 확정될 수 있습니다.
                      </div>
                    </>
                  )}
                </div>
              )}

              {item.request.status === 'confirmed' && (
                <div className="status-highlight-section" style={{ background: '#e8f5e9', borderBottomColor: '#c8e6c9' }}>
                  <div className="status-label" style={{ color: '#2e7d32' }}>확정됨</div>
                  <div className="confirm-date-display" style={{ color: '#1b5e20' }}>
                    예약이 확정되었습니다
                  </div>
                  <div className="status-info-text">
                    {slots[item.request.confirmedSlotId!]?.date}{' '}
                    {TIME_SLOTS.find(t => t.label === slots[item.request.confirmedSlotId!]?.timeLabel)?.displayLabel}
                  </div>
                </div>
              )}

              {item.request.status === 'needs_reselection' && (
                <div className="status-highlight-section" style={{ background: '#fff3e0', borderBottomColor: '#ffe0b2' }}>
                  <div className="status-label" style={{ color: '#e65100' }}>재선택 필요</div>
                  <div className="status-info-text" style={{ color: '#bf360c' }}>
                    선택하신 슬롯이 모두 마감되었습니다. 다시 선택해주세요.
                  </div>
                </div>
              )}

              <div className="request-content">
                <div className="request-section">
                  <div className="request-section-title">선택한 시간 (우선순위 순)</div>
                  <div className="slots-list">
                    {item.candidates.map((c, cidx) => {
                      const slot = slots[c.slotId];
                      const timeSlot = TIME_SLOTS.find(t => t.label === slot?.timeLabel);
                      return (
                        <div key={c.id} className="slot-item">
                          <span className="slot-item-priority">{cidx + 1}</span>
                          <span className="slot-item-time">
                            {slot?.date} {timeSlot?.timeRange}
                          </span>
                          <span className="slot-item-status">(대기중)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {item.request.status === 'needs_reselection' && idx === customerRequests.length - 1 && (
                  <button
                    className="btn btn-warning"
                    onClick={() => {
                      setStage('reselect');
                      setSelectedSlots([]);
                    }}
                    style={{ background: '#ffc107', marginTop: '10px' }}
                  >
                    재선택하기
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {stage === 'reselect' && customerRequests.length > 0 && (
        <div>
          <h3>슬롯 재선택</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            이전 신청의 슬롯이 모두 마감되었습니다. 다시 선택해주세요.
          </p>
          <SlotTable
            slots={slots}
            selectedSlots={selectedSlots}
            onToggle={handleSlotToggle}
            mode="select"
            maxSelect={3}
          />

          <div className="selected-slots-list">
            <h4>새로 선택한 슬롯 (우선순위 순)</h4>
            <ul className="list">
              {selectedSlots.map((slotId, idx) => {
                const slot = slots[slotId];
                return (
                  <li key={slotId}>
                    <span>
                      {idx + 1}. {slot?.date} {TIME_SLOTS.find(t => t.label === slot?.timeLabel)?.displayLabel}
                    </span>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleSlotToggle(slotId)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      제거
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={handleReselect}
              disabled={selectedSlots.length === 0 || loading}
            >
              {loading ? '처리 중...' : '재선택 제출'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setStage('view');
                setSelectedSlots([]);
              }}
              disabled={loading}
            >
              돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
