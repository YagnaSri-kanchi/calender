'use client';

import { useEffect, useRef, useState } from 'react';
import { isDateInRange, isRangeEnd, isRangeStart } from '@/app/utils/dateUtils';

interface DateGridProps {
	currentDate: Date;
	dateRange: { start: Date | null; end: Date | null };
	onDateSelect: (date: Date, isStart: boolean) => void;
	onDateClick: (date: Date) => void;
	getEventCount: (date: Date) => number;
	getSpecialDayCount: (date: Date) => number;
	getTaskSummary: (date: Date) => { total: number; repeat: number; span: number };
	theme: 'light' | 'dark';
}

const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function DateGrid({
	currentDate,
	dateRange,
	onDateSelect,
	onDateClick,
	getEventCount,
	getSpecialDayCount,
	getTaskSummary,
	theme,
}: DateGridProps) {
	const [pulseDateKey, setPulseDateKey] = useState<string | null>(null);
	const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const firstWeekdayMonday = (new Date(year, month, 1).getDay() + 6) % 7;

	const formatKey = (date: Date) =>
		`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

	useEffect(() => {
		if (pulseTimeoutRef.current) {
			clearTimeout(pulseTimeoutRef.current);
		}

		const target = dateRange.end ?? dateRange.start;
		if (!target || target.getFullYear() !== year || target.getMonth() !== month) {
			setPulseDateKey(null);
			return;
		}

		setPulseDateKey(formatKey(target));
		pulseTimeoutRef.current = setTimeout(() => {
			setPulseDateKey(null);
		}, 320);

		return () => {
			if (pulseTimeoutRef.current) {
				clearTimeout(pulseTimeoutRef.current);
			}
		};
	}, [dateRange.start, dateRange.end, year, month]);

	const cells: Array<number | null> = [];
	for (let i = 0; i < firstWeekdayMonday; i += 1) cells.push(null);
	for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
	while (cells.length < 42) cells.push(null);

	const handleDateClick = (day: number) => {
		const selectedDate = new Date(year, month, day);

		if (!dateRange.start) {
			onDateSelect(selectedDate, true);
		} else if (!dateRange.end) {
			if (selectedDate < dateRange.start) {
				onDateSelect(dateRange.start, false);
				onDateSelect(selectedDate, true);
			} else {
				onDateSelect(selectedDate, false);
			}
		} else {
			onDateSelect(selectedDate, true);
		}

		onDateClick(selectedDate);
	};

	const today = new Date();

	return (
		<div
			className={`flex h-full min-h-0 flex-col rounded-xl border p-3 md:p-4 ${
				theme === 'dark' ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-white'
			}`}
		>
			<div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-semibold tracking-[0.14em] md:text-[11px]">
				{weekdays.map((day, index) => (
					<div key={day} className={index >= 5 ? 'text-cyan-600' : theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}>
						{day}
					</div>
				))}
			</div>

			<div className="mt-2 grid flex-1 min-h-0 grid-cols-7 grid-rows-6 gap-1">
				{cells.map((day, index) => {
					if (day === null) {
						return <div key={`empty-${index}`} className="h-full min-h-0 rounded-md" />;
					}

					const date = new Date(year, month, day);
					const isStart = isRangeStart(date, dateRange);
					const isEnd = isRangeEnd(date, dateRange);
					const inRange = isDateInRange(date, dateRange);
					const isSelected = isStart || isEnd;
					const isPulseTarget = pulseDateKey === formatKey(date);
					const isToday =
						date.getDate() === today.getDate() &&
						date.getMonth() === today.getMonth() &&
						date.getFullYear() === today.getFullYear();
					const eventCount = getEventCount(date);
					const specialCount = getSpecialDayCount(date);
					const taskSummary = getTaskSummary(date);
					const weekDay = (index % 7) + 1;
					const isWeekend = weekDay === 6 || weekDay === 7;

					const baseClasses =
						theme === 'dark'
							? 'text-slate-100 hover:bg-slate-700'
							: 'text-slate-700 hover:bg-slate-100';

					return (
						<button
							key={`day-${day}`}
							onClick={() => handleDateClick(day)}
							className={`date-cell-premium relative h-full min-h-0 rounded-md text-xs font-semibold md:text-sm ${baseClasses}
								${isWeekend && !inRange && !isStart && !isEnd ? 'text-cyan-600' : ''}
								${inRange && !isStart && !isEnd ? 'bg-cyan-100 text-slate-800 dark:bg-cyan-900/50 dark:text-cyan-100' : ''}
								${isSelected ? 'date-cell-selected bg-cyan-600 text-white hover:bg-cyan-600' : ''}
								${isPulseTarget && isSelected ? 'date-cell-pop' : ''}
								${isToday && !inRange && !isStart && !isEnd ? 'ring-2 ring-cyan-500' : ''}
							`}
						>
							{day}
							{specialCount > 0 && (
								<span className="absolute right-1 top-1 text-xs leading-none" title="Special day">
									🎂
								</span>
							)}
							{eventCount > 0 && (
								<span className="absolute left-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-600 px-1 text-[9px] text-white">
									{eventCount}
								</span>
							)}
							{taskSummary.total > 0 && (
								<span
									className={`absolute bottom-1 right-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold shadow-sm ${
										taskSummary.span > 0
											? 'bg-cyan-600 text-white'
											: taskSummary.repeat > 0
											? 'bg-emerald-500 text-white'
											: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
									}`}
									title={
										taskSummary.span > 0
											? 'Spanning range task'
											: taskSummary.repeat > 0
											? 'Repeating range task'
											: 'Task'
									}
								>
									{taskSummary.span > 0 ? 'Range' : taskSummary.repeat > 0 ? 'Repeat' : taskSummary.total}
								</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
