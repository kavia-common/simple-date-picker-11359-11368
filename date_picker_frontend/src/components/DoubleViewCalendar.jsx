import React, { useMemo, useState, useCallback } from 'react';
import './DoubleViewCalendar.css';

/* Utilities */
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function addMonths(date, n) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setMonth(d.getMonth() + n);
  return d;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

/**
 * Generate a 6x7 matrix for a given year+month.
 * Week starts on Monday (Mo Tu We Th Fr Sa Su) per Figma.
 */
function getMonthMatrix(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  // JS getDay: 0=Sun..6=Sat, convert to Monday-first offset
  const sundayIdx = firstOfMonth.getDay();
  const monFirstIndex = (sundayIdx - 1 + 7) % 7; // 0..6 (0 means Monday)
  const startDate = new Date(year, month, 1 - monFirstIndex);

  const matrix = [];
  for (let wk = 0; wk < 6; wk++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + (wk * 7 + d));
      week.push({
        date: cellDate,
        inCurrentMonth: cellDate.getMonth() === month
      });
    }
    matrix.push(week);
  }
  return matrix;
}

const DoW = () => {
  const labels = ['Mo','Tu','We','Th','Fr','Sa','Su'];
  return (
    <div className="dow-row" role="row" aria-label="Day of week">
      {labels.map(label => (
        <div key={label} className="dow-cell" role="columnheader" aria-label={label}>
          <span className="dow-text">{label}</span>
        </div>
      ))}
    </div>
  );
};

const ChevronIcon = ({ direction = 'left' }) => {
  const isLeft = direction === 'left';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {isLeft ? (
        <path d="M14.7 5.3a1 1 0 0 1 0 1.4L10.41 12l4.3 5.3a1 1 0 0 1-1.54 1.28l-5-6.2a1 1 0 0 1 0-1.28l5-6.2a1 1 0 0 1 1.54 1.2z" fill="currentColor"/>
      ) : (
        <path d="M9.3 18.7a1 1 0 0 1 0-1.4L13.59 12l-4.3-5.3A1 1 0 0 1 10.83 5.4l5 6.2a1 1 0 0 1 0 1.28l-5 6.2a1 1 0 0 1-1.54-1.2z" fill="currentColor"/>
      )}
    </svg>
  );
};

const DropdownIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true" focusable="false">
    <path d="M1.4 2.5L4 5.1l2.6-2.6.7.7L4 6.5 0.7 3.2l.7-.7z" fill="currentColor"/>
  </svg>
);

function CalendarHeader({
  year,
  month,
  showPrev,
  showNext,
  onPrev,
  onNext
}) {
  const monthName = MONTH_NAMES[month];
  return (
    <div className="cal-header">
      <div className="header-side">
        {showPrev && (
          <button className="nav-btn" onClick={onPrev} aria-label="Previous month">
            <ChevronIcon direction="left" />
          </button>
        )}
      </div>
      <div className="header-center" aria-live="polite">
        <div className="header-pill">
          <span className="month-text">{monthName}</span>
          <span className="caret"><DropdownIcon /></span>
        </div>
        <div className="header-pill">
          <span className="year-text">{year}</span>
          <span className="caret"><DropdownIcon /></span>
        </div>
      </div>
      <div className="header-side">
        {showNext && (
          <button className="nav-btn" onClick={onNext} aria-label="Next month">
            <ChevronIcon direction="right" />
          </button>
        )}
      </div>
    </div>
  );
}

function CalendarView({
  year,
  month,
  showPrev,
  showNext,
  onPrev,
  onNext,
  selectedDate,
  onSelectDate,
  todaySelectedOverride // for matching figma example (e.g., 7th highlighted)
}) {
  const matrix = useMemo(() => getMonthMatrix(year, month), [year, month]);

  return (
    <div className="calendar" role="group" aria-label={`${MONTH_NAMES[month]} ${year}`}>
      <CalendarHeader
        year={year}
        month={month}
        showPrev={showPrev}
        showNext={showNext}
        onPrev={onPrev}
        onNext={onNext}
      />
      <DoW />
      <div className="weeks" role="grid" aria-readonly="true">
        {matrix.map((week, wi) => (
          <div className="week" role="row" key={wi}>
            {week.map((cell, di) => {
              const { date, inCurrentMonth } = cell;
              const disabled = !inCurrentMonth;
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              // To mirror the Figma, allow overriding "today selected" (e.g., 7th of left calendar)
              const figmaTodaySelected = todaySelectedOverride &&
                                         date.getFullYear() === todaySelectedOverride.getFullYear() &&
                                         date.getMonth() === todaySelectedOverride.getMonth() &&
                                         date.getDate() === todaySelectedOverride.getDate();

              const classes = [
                'day-cell',
                disabled ? 'is-disabled' : 'is-regular',
                (isSelected || figmaTodaySelected) ? 'is-today-selected' : ''
              ].join(' ').trim();

              return (
                <button
                  key={`${wi}-${di}`}
                  className={classes}
                  role="gridcell"
                  aria-selected={isSelected || figmaTodaySelected}
                  disabled={disabled}
                  onClick={() => !disabled && onSelectDate?.(date)}
                >
                  <span className="day-text">
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DoubleViewCalendar() {
  // Start at April 2021 to match the Figma left panel; right panel will be May 2021
  const [anchor, setAnchor] = useState(() => new Date(2021, 3, 1)); // Apr 2021
  const leftYear = anchor.getFullYear();
  const leftMonth = anchor.getMonth();

  const rightAnchor = useMemo(() => addMonths(anchor, 1), [anchor]);
  const rightYear = rightAnchor.getFullYear();
  const rightMonth = rightAnchor.getMonth();

  // Selected "today" to mimic Figma (April 7, 2021)
  const [selectedDate, setSelectedDate] = useState(() => new Date(2021, 3, 7));

  const onPrev = useCallback(() => setAnchor(a => addMonths(a, -1)), []);
  const onNext = useCallback(() => setAnchor(a => addMonths(a, +1)), []);
  const onSelectDate = useCallback((d) => setSelectedDate(d), []);

  return (
    <div className="double-calendar" role="application" aria-label="Double-view calendar">
      <CalendarView
        year={leftYear}
        month={leftMonth}
        showPrev
        showNext={false}
        onPrev={onPrev}
        onNext={undefined}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        todaySelectedOverride={new Date(2021, 3, 7)}
      />
      <div className="divider" aria-hidden="true" />
      <CalendarView
        year={rightYear}
        month={rightMonth}
        showPrev={false}
        showNext
        onPrev={undefined}
        onNext={onNext}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />
    </div>
  );
}
