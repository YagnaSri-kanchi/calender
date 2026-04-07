'use client';

import { isDateInRange, isRangeEnd, isRangeStart } from '@/app/utils/dateUtils';

interface DateGridProps {
	currentDate: Date;
	dateRange: { start: Date | null; end: Date | null };
	onDateSelect: (date: Date, isStart: boolean) => void;
	onDateClick: (date: Date) => void;
	getEventCount: (date: Date) => number;
	theme: 'light' | 'dark';
}

const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function DateGrid({ currentDate, dateRange, onDateSelect, onDateClick, getEventCount, theme }: DateGridProps) {
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const firstWeekdayMonday = (new Date(year, month, 1).getDay() + 6) % 7;

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
			className={`rounded-xl border p-4 ${
				theme === 'dark' ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-white'
			}`}
		>
			<div className="grid grid-cols-7 gap-y-2 text-center text-[11px] font-semibold tracking-[0.14em]">
				{weekdays.map((day, index) => (
					<div key={day} className={index >= 5 ? 'text-cyan-600' : theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}>
						{day}
					</div>
				))}
			</div>

			<div className="mt-3 grid grid-cols-7 gap-1">
				{cells.map((day, index) => {
					if (day === null) {
						return <div key={`empty-${index}`} className="aspect-square" />;
					}

					const date = new Date(year, month, day);
					const isStart = isRangeStart(date, dateRange);
					const isEnd = isRangeEnd(date, dateRange);
					const inRange = isDateInRange(date, dateRange);
					const isToday =
						date.getDate() === today.getDate() &&
						date.getMonth() === today.getMonth() &&
						date.getFullYear() === today.getFullYear();
					const eventCount = getEventCount(date);
					const weekDay = (index % 7) + 1;
					const isWeekend = weekDay === 6 || weekDay === 7;

					const baseClasses = theme === 'dark' ? 'text-slate-100 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100';

					return (
						<button
							key={`day-${day}`}
							onClick={() => handleDateClick(day)}
							className={`relative aspect-square rounded-md text-sm font-semibold transition ${baseClasses}
								${isWeekend && !inRange && !isStart && !isEnd ? 'text-cyan-600' : ''}
								${inRange && !isStart && !isEnd ? 'bg-cyan-100 text-slate-800 dark:bg-cyan-900/50 dark:text-cyan-100' : ''}
								${isStart || isEnd ? 'bg-cyan-600 text-white hover:bg-cyan-600' : ''}
								${isToday && !inRange && !isStart && !isEnd ? 'ring-2 ring-cyan-500' : ''}
							`}
						>
							{day}
							{eventCount > 0 && (
								<span className="absolute left-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-600 px-1 text-[9px] text-white">
									{eventCount}
								</span>
							)}
							{isStart && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[10px]">S</span>}
							{isEnd && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[10px]">E</span>}
						</button>
					);
				})}
			</div>
		</div>
	);
}
