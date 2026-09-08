import React, { useState } from 'react';
import type { Slot } from '../types';
import { TIME_SLOTS, getAllDates } from '../utils/constants';

interface SlotTableProps {
  slots: Record<string, Slot>;
  selectedSlots: string[];
  onToggle: (slotId: string) => void;
  maxSelect?: number;
  mode: 'view' | 'select' | 'confirm';
}

export const SlotTable: React.FC<SlotTableProps> = ({
  slots,
  selectedSlots,
  onToggle,
  maxSelect = 3,
  mode = 'view',
}) => {
  const dates = getAllDates();
  const [weekStartIndex, setWeekStartIndex] = useState(0);

  const getWeekday = (dateStr: string): string => {
    const date = new Date(dateStr);
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return weekdays[date.getDay()];
  };

  const getMonthDay = (dateStr: string): string => {
    const [, month, day] = dateStr.split('-');
    return `${parseInt(month)}/${parseInt(day)}`;
  };

  // 주간 날짜 계산 (월~일)
  const allDates = getAllDates();
  const getWeekDates = () => {
    const maxStartIndex = Math.max(0, allDates.length - 7);
    const safeStartIndex = Math.min(weekStartIndex, maxStartIndex);
    return allDates.slice(safeStartIndex, safeStartIndex + 7);
  };

  const weekDates = getWeekDates();
  const weekStartDate = weekDates[0] || '';
  const weekEndDate = weekDates[weekDates.length - 1] || '';

  // 주말 판정 함수
  const isWeekend = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 일요일(0) 또는 토요일(6)
  };

  const handlePrevWeek = () => {
    setWeekStartIndex(prev => Math.max(0, prev - 7));
  };

  const handleNextWeek = () => {
    const allDates = getAllDates();
    const maxIndex = Math.max(0, allDates.length - 7);
    setWeekStartIndex(prev => Math.min(maxIndex, prev + 7));
  };

  if (mode === 'view') {
    return (
      <div className="table-container">
        <table className="slots-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>날짜</th>
              {TIME_SLOTS.map(slot => (
                <th key={slot.label} style={{ width: '140px' }}>
                  {slot.displayLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map(date => (
              <tr key={date}>
                <td>{date}</td>
                {TIME_SLOTS.map(timeSlot => {
                  const slotId = `${date}:${timeSlot.label}`;
                  const slot = slots[slotId];

                  return (
                    <td key={slotId}>
                      <span className={`slot-status ${slot?.status || 'available'}`}>
                        {slot?.status === 'confirmed' ? '마감' : '가능'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Confirm 모드: 선택한 슬롯만 하늘색으로 강조
  if (mode === 'confirm') {
    return (
      <div>
        {/* 주간 타임테이블 헤더 - 최종 확인에서는 생략 가능 */}
        <div className="timetable-header">
          <div className="week-navigation">
            <span className="week-range" style={{ minWidth: 'auto', marginLeft: 0, marginRight: 0 }}>
              최종 선택 확인
            </span>
          </div>
        </div>

        {/* 주간 타임테이블 */}
        <div className="weekly-timetable-container">
          <table className="weekly-timetable">
            <thead>
              <tr>
                <th className="time-column-header">시간</th>
                {weekDates.map(date => (
                  <th key={date} className={`date-column-header ${isWeekend(date) ? 'weekend' : ''}`}>
                    <div className="day-label">{getWeekday(date)}</div>
                    <div className="date-label">{getMonthDay(date)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(timeSlot => (
                <tr key={timeSlot.label}>
                  <td className="time-cell">
                    <div className="time-label">{timeSlot.displayLabel}</div>
                  </td>
                  {weekDates.map(date => {
                    const slotId = `${date}:${timeSlot.label}`;
                    const isSelected = selectedSlots.includes(slotId);

                    return (
                      <td
                        key={slotId}
                        className={`slot-cell ${isSelected ? 'selected confirm-selected' : 'confirm-unselected'}`}
                        style={{
                          cursor: 'default',
                        }}
                      >
                        {isSelected && (
                          <div className="slot-content-vertical">
                            <div className="slot-time">{timeSlot.timeRange}</div>
                            <div className="slot-status-text">선택한 시간</div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 주간 타임테이블 헤더 */}
      <div className="timetable-header">
        <div className="week-navigation">
          <button
            className="btn btn-secondary"
            onClick={handlePrevWeek}
            style={{ marginRight: '10px' }}
          >
            ← 이전 주
          </button>
          <span className="week-range">
            {weekStartDate} ~ {weekEndDate}
          </span>
          <button
            className="btn btn-secondary"
            onClick={handleNextWeek}
            style={{ marginLeft: '10px' }}
          >
            다음 주 →
          </button>
        </div>
      </div>

      {/* 주간 타임테이블 */}
      <div className="weekly-timetable-container">
        <table className="weekly-timetable">
          <thead>
            <tr>
              <th className="time-column-header">시간</th>
              {weekDates.map(date => (
                <th key={date} className={`date-column-header ${isWeekend(date) ? 'weekend' : ''}`}>
                  <div className="day-label">{getWeekday(date)}</div>
                  <div className="date-label">{getMonthDay(date)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(timeSlot => (
              <tr key={timeSlot.label}>
                <td className="time-cell">
                  <div className="time-label">{timeSlot.displayLabel}</div>
                </td>
                {weekDates.map(date => {
                  const slotId = `${date}:${timeSlot.label}`;
                  const slot = slots[slotId];
                  const isSelected = selectedSlots.includes(slotId);
                  const isConfirmed = slot?.status === 'confirmed';
                  const isDisabled = isConfirmed || (!isSelected && selectedSlots.length >= maxSelect);

                  return (
                    <td
                      key={slotId}
                      className={`slot-cell ${isSelected ? 'selected' : ''} ${isConfirmed ? 'closed' : 'open'} ${isDisabled && !isSelected ? 'disabled' : ''}`}
                      onClick={() => !isDisabled && onToggle(slotId)}
                      style={{ cursor: isDisabled && !isSelected ? 'not-allowed' : 'pointer' }}
                    >
                      {isConfirmed ? (
                        <div className="slot-content-vertical">
                          <div className="slot-time">{timeSlot.timeRange}</div>
                          <div className="slot-status-text">예약 마감</div>
                        </div>
                      ) : (
                        <div className="slot-content-vertical">
                          <div className="slot-time">{timeSlot.timeRange}</div>
                          <div className="slot-status-text">예약 가능</div>
                          <input
                            type="checkbox"
                            className="slot-checkbox"
                            checked={isSelected}
                            onChange={() => !isDisabled && onToggle(slotId)}
                            disabled={isDisabled}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 범례 */}
      <div className="timetable-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>예약 가능</span>
        </div>
        <div className="legend-item">
          <div className="legend-color closed"></div>
          <span>예약 마감</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>선택한 시간</span>
        </div>
      </div>
    </div>
  );
};
