'use client';

import { getMonthName } from '@/app/utils/dateUtils';
import FlipDateCard from './FlipDateCard';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onTodayRange: () => void;
  onWeekendRange: () => void;
  onMonthRange: () => void;
  dateRange: { start: Date | null; end: Date | null };
  theme: 'light' | 'dark';
}

export default function CalendarHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onTodayRange,
  onWeekendRange,
  onMonthRange,
  dateRange,
  theme,
}: CalendarHeaderProps) {
  const monthName = getMonthName(currentDate);
  const year = currentDate.getFullYear();
  const dateLabel = String(currentDate.getDate()).padStart(2, '0');

  const rangeSummary = dateRange.start
    ? `${dateRange.start.toLocaleDateString()}${dateRange.end ? ` -> ${dateRange.end.toLocaleDateString()}` : ''}`
    : 'No range selected';

  return (
    <div
      className={`rounded-xl border p-4 ${
        theme === 'dark' ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <FlipDateCard value={dateLabel} theme={theme} />
          <div>
          <h2 className="text-2xl font-semibold tracking-[0.08em]">{monthName.toUpperCase()}</h2>
          <p className={`text-xs tracking-[0.12em] ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{year}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onPreviousMonth}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Prev
          </button>
          <button
            onClick={onToday}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Current
          </button>
          <button
            onClick={onNextMonth}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onTodayRange}
          className="rounded-full bg-cyan-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-cyan-700"
        >
          Today Range
        </button>
        <button
          onClick={onWeekendRange}
          className="rounded-full bg-cyan-700 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-cyan-800"
        >
          Weekend Range
        </button>
        <button
          onClick={onMonthRange}
          className="rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-500"
        >
          Full Month
        </button>
      </div>

      <p className={`mt-3 text-xs tracking-wide ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{rangeSummary}</p>
    </div>
  );
}
