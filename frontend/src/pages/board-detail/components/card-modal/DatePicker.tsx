import { useEffect, useMemo, useRef, useState } from 'react';
import { toLocalDateString } from '../../utils';
import { inputStyle } from './styles';

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
};

const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const getMonthLabel = (year: number, month: number) =>
  new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

function DatePicker({ value, onChange, onClear }: DatePickerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const parsedDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    if (!open) return;
    setDraftValue(value);
    if (value) {
      const nextDate = new Date(`${value}T00:00:00`);
      setViewYear(nextDate.getFullYear());
      setViewMonth(nextDate.getMonth());
    }
  }, [value, open]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{
      date: Date;
      isCurrentMonth: boolean;
    }> = [];

    for (let i = 0; i < 42; i += 1) {
      const dayIndex = i - startOffset + 1;
      if (dayIndex < 1) {
        cells.push({
          date: new Date(viewYear, viewMonth - 1, daysInPrevMonth + dayIndex),
          isCurrentMonth: false,
        });
        continue;
      }
      if (dayIndex > daysInMonth) {
        cells.push({
          date: new Date(viewYear, viewMonth + 1, dayIndex - daysInMonth),
          isCurrentMonth: false,
        });
        continue;
      }
      cells.push({
        date: new Date(viewYear, viewMonth, dayIndex),
        isCurrentMonth: true,
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const selectedLabel = draftValue || value;
  const todayLabel = toLocalDateString(new Date());

  const formattedValue = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '';

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          className="input"
          onClick={() => setOpen((prev) => !prev)}
          style={{
            ...inputStyle,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '8px 10px',
            fontSize: 14,
            backgroundColor: 'rgba(6, 5, 24, 0.95)',
          }}
        >
          <span>{formattedValue || 'Select date'}</span>
          <span aria-hidden="true" style={{ opacity: 0.7 }}>
            📅
          </span>
        </button>
        <button
          type="button"
          className="button button-ghost"
          onClick={onClear}
          disabled={!value}
          style={{ padding: '6px 12px', fontSize: 12 }}
        >
          Clear
        </button>
      </div>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              minWidth: 320,
              padding: 16,
              borderRadius: 14,
              backgroundColor: 'rgba(11, 15, 35, 0.98)',
              border: '1px solid rgba(199,125,255,0.7)',
              boxShadow: '0 24px 60px rgba(6, 5, 20, 0.85)',
            }}
          >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              color: '#f9f5ff',
              fontSize: 13,
            }}
          >
            <button
              type="button"
              className="button button-ghost"
              onClick={() => {
                const prev = new Date(viewYear, viewMonth - 1, 1);
                setViewYear(prev.getFullYear());
                setViewMonth(prev.getMonth());
              }}
            >
              ←
            </button>
            <span>{getMonthLabel(viewYear, viewMonth)}</span>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => {
                const next = new Date(viewYear, viewMonth + 1, 1);
                setViewYear(next.getFullYear());
                setViewMonth(next.getMonth());
              }}
            >
              →
            </button>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 4,
              marginBottom: 6,
              fontSize: 11,
              color: 'rgba(226,232,240,0.7)',
              textAlign: 'center',
            }}
          >
            {weekDays.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 4,
            }}
          >
            {calendarCells.map((cell) => {
              const label = toLocalDateString(cell.date);
              const isSelected = label === selectedLabel;
              const isToday = label === todayLabel;
              const isHovered = hoverLabel === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setDraftValue(label);
                  }}
                  onMouseEnter={() => setHoverLabel(label)}
                  onMouseLeave={() => setHoverLabel(null)}
                  style={{
                    borderRadius: 8,
                    border: isSelected
                      ? '1px solid rgba(199,125,255,0.9)'
                      : '1px solid transparent',
                    padding: '6px 0',
                    fontSize: 12,
                    color: cell.isCurrentMonth
                      ? '#f9f5ff'
                      : 'rgba(226,232,240,0.4)',
                    backgroundColor: isSelected
                      ? 'rgba(157,78,221,0.35)'
                      : isHovered
                        ? 'rgba(157,78,221,0.2)'
                        : isToday
                          ? 'rgba(157,78,221,0.15)'
                          : 'transparent',
                    boxShadow: isToday
                      ? 'inset 0 -2px 0 0 rgba(124, 58, 237, 0.9)'
                      : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => {
                if (!draftValue) return;
                onChange(draftValue);
                setOpen(false);
              }}
            >
              Save
            </button>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              disabled={!draftValue && !value}
            >
              Clear
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
