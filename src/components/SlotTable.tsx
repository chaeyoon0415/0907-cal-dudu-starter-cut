import React, { useState } from 'react';
import type { Slot } from '../types';
import { TIME_SLOTS, getAllDates } from '../utils/constants';

interface SlotTableProps {
  slots: Record<string, Slot>;
  selectedSlots: string[];
  onToggle: (slotId: string) => void;
  maxSelect?: number;
  mode: 'view' | 'select';
}

export const SlotTable: React.FC<SlotTableProps> = ({
  slots,
  selectedSlots,
  onToggle,
  maxSelect = 3,
  mode = 'view',
}) => {
  const dates = getAllDates();
  const [selectedDate, setSelectedDate] = useState(dates[0]);

  const getWeekday = (dateStr: string): string => {
    const date = new Date(dateStr);
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return weekdays[date.getDay()];
  };

  const getMonthDay = (dateStr: string): string => {
    const [, month, day] = dateStr.split('-');
    return `${parseInt(month)}/${parseInt(day)}`;
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

  return (
    <div>
      {/* 날짜 선택 영역 */}
      <div className="date-selector">
        {dates.map(date => (
          <button
            key={date}
            className={`date-button ${selectedDate === date ? 'selected' : ''}`}
            onClick={() => setSelectedDate(date)}
          >
            <span className="day-label">{getWeekday(date)}</span>
            <span className="date-value">{getMonthDay(date)}</span>
          </button>
        ))}
      </div>

      {/* 시간 슬롯 그리드 */}
      <div className="time-slots-grid">
        {TIME_SLOTS.map(timeSlot => {
          const slotId = `${selectedDate}:${timeSlot.label}`;
          const slot = slots[slotId];
          const isSelected = selectedSlots.includes(slotId);
          const isConfirmed = slot?.status === 'confirmed';
          const isDisabled = isConfirmed || (!isSelected && selectedSlots.length >= maxSelect);

          return (
            <div
              key={slotId}
              className={`time-slot-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && onToggle(slotId)}
              style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
            >
              <input
                type="checkbox"
                className="slot-checkbox"
                checked={isSelected}
                onChange={() => !isDisabled && onToggle(slotId)}
                disabled={isDisabled}
              />
              <div className="time-text">{timeSlot.displayLabel.split(' ')[0]} {timeSlot.displayLabel.split(' ')[1]}</div>
              <div className="slot-info">
                {isConfirmed ? (
                  <div className="slot-status-label">예약 마감</div>
                ) : (
                  <div className="slot-status-label">예약 가능</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
