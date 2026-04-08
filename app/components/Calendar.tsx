'use client';

import { useEffect, useRef, useState } from 'react';
import CalendarHeader from './CalendarHeader';
import DateGrid from './DateGrid';
import NotesSection from './NotesSection';
import HeroImage from './HeroImage';
import { addMonths, formatDateToString, parseStringToDate } from '@/app/utils/dateUtils';

const MONTH_FLIP_DURATION = 820;

type MonthFlipDirection = 'next' | 'prev';

interface CalendarEventItem {
	id: string;
	title: string;
	time: string;
	description: string;
	category: string;
	reminder: string;
}

interface EventDraft {
	title: string;
	time: string;
	description: string;
	category: string;
	reminder: string;
}

interface TaskItem {
	id: string;
	title: string;
	assignedTo: string;
	priority: 'High' | 'Medium' | 'Low';
	status: 'To Do' | 'In Progress' | 'Done';
	description: string;
	category: string;
	checklist: string[];
	startDate: string;
	endDate: string;
	scope: 'single' | 'repeat-range' | 'spanning-range';
}

interface TaskDraft {
	title: string;
	assignedTo: string;
	priority: 'High' | 'Medium' | 'Low';
	status: 'To Do' | 'In Progress' | 'Done';
	description: string;
	category: string;
	checklistText: string;
	startDate: string;
	endDate: string;
	scope: 'single' | 'repeat-range' | 'spanning-range';
}

type SpecialDayType = 'birthday' | 'anniversary' | 'special';

interface SpecialDayItem {
	id: string;
	title: string;
	type: SpecialDayType;
	monthDay: string;
	reminder: 'on-day' | '1-day-before' | '1-week-before';
	recurrence: 'yearly';
	notes: string;
}

interface SpecialDayDraft {
	title: string;
	type: SpecialDayType;
	reminder: 'on-day' | '1-day-before' | '1-week-before';
	notes: string;
}

interface ReminderAlertItem {
	id: string;
	message: string;
}

const defaultEventDraft: EventDraft = {
	title: '',
	time: '09:00',
	description: '',
	category: 'Work',
	reminder: '1 day before',
};

const defaultTaskDraft: TaskDraft = {
	title: '',
	assignedTo: 'Self',
	priority: 'Medium',
	status: 'To Do',
	description: '',
	category: 'General',
	checklistText: '',
	startDate: '',
	endDate: '',
	scope: 'single',
};

const defaultSpecialDayDraft: SpecialDayDraft = {
	title: '',
	type: 'birthday',
	reminder: '1-day-before',
	notes: '',
};

export default function Calendar() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
		start: null,
		end: null,
	});
	const [isMounted, setIsMounted] = useState(false);
	const [theme, setTheme] = useState<'light' | 'dark'>('light');
	const [flippingDate, setFlippingDate] = useState<Date | null>(null);
	const [flipDirection, setFlipDirection] = useState<MonthFlipDirection>('next');
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [eventModalOpen, setEventModalOpen] = useState(false);
	const [eventDraft, setEventDraft] = useState<EventDraft>(defaultEventDraft);
	const [eventsByDate, setEventsByDate] = useState<Record<string, CalendarEventItem[]>>({});
	const [tasks, setTasks] = useState<TaskItem[]>([]);
	const [taskDraft, setTaskDraft] = useState<TaskDraft>(defaultTaskDraft);
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
	const [specialDaysByMonthDay, setSpecialDaysByMonthDay] = useState<Record<string, SpecialDayItem[]>>({});
	const [specialDayDraft, setSpecialDayDraft] = useState<SpecialDayDraft>(defaultSpecialDayDraft);
	const [reminderAlerts, setReminderAlerts] = useState<ReminderAlertItem[]>([]);
	const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		setIsMounted(true);
		const savedDateRange = localStorage.getItem('selectedDateRange');
		const savedTheme = localStorage.getItem('calendarTheme') as 'light' | 'dark' | null;

		if (savedDateRange) {
			try {
				const parsed = JSON.parse(savedDateRange);
				setDateRange({
					start: parsed.start ? parseStringToDate(parsed.start) : null,
					end: parsed.end ? parseStringToDate(parsed.end) : null,
				});
			} catch {
				// Ignore invalid persisted value.
			}
		}

		if (savedTheme) {
			setTheme(savedTheme);
		}

		const savedEvents = localStorage.getItem('calendarEventsByDate');
		if (savedEvents) {
			try {
				setEventsByDate(JSON.parse(savedEvents));
			} catch {
				setEventsByDate({});
			}
		}

		const savedTasks = localStorage.getItem('calendarTasksByDate');
		const savedStructuredTasks = localStorage.getItem('calendarTasks');
		if (savedStructuredTasks) {
			try {
				setTasks(JSON.parse(savedStructuredTasks));
			} catch {
				setTasks([]);
			}
		} else if (savedTasks) {
			try {
				const legacyTasksByDate = JSON.parse(savedTasks) as Record<string, Array<{ id: string; text: string; completed: boolean }>>;
				const migratedTasks: TaskItem[] = Object.entries(legacyTasksByDate).flatMap(([dateKey, items]) =>
					items.map((item) => ({
						id: item.id,
						title: item.text,
						assignedTo: 'Self',
						priority: 'Medium',
						status: item.completed ? 'Done' : 'To Do',
						description: '',
						category: 'General',
						checklist: [],
						startDate: dateKey,
						endDate: dateKey,
						scope: 'single',
					}))
				);
				setTasks(migratedTasks);
			} catch {
				setTasks([]);
			}
		}

		const savedSpecialDays = localStorage.getItem('calendarSpecialDaysByMonthDay');
		if (savedSpecialDays) {
			try {
				setSpecialDaysByMonthDay(JSON.parse(savedSpecialDays));
			} catch {
				setSpecialDaysByMonthDay({});
			}
		}
	}, []);

	useEffect(() => {
		if (!isMounted) return;

		localStorage.setItem(
			'selectedDateRange',
			JSON.stringify({
				start: dateRange.start ? formatDateToString(dateRange.start) : null,
				end: dateRange.end ? formatDateToString(dateRange.end) : null,
			})
		);
	}, [dateRange, isMounted]);

	useEffect(() => {
		if (!isMounted) return;

		localStorage.setItem('calendarTheme', theme);
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}, [theme, isMounted]);

	useEffect(() => {
		if (!isMounted) return;
		localStorage.setItem('calendarEventsByDate', JSON.stringify(eventsByDate));
	}, [eventsByDate, isMounted]);

	useEffect(() => {
		if (!isMounted) return;
		localStorage.setItem('calendarTasks', JSON.stringify(tasks));
	}, [tasks, isMounted]);

	useEffect(() => {
		if (!isMounted) return;
		localStorage.setItem('calendarSpecialDaysByMonthDay', JSON.stringify(specialDaysByMonthDay));
	}, [specialDaysByMonthDay, isMounted]);

	useEffect(() => {
		return () => {
			if (flipTimeoutRef.current) {
				clearTimeout(flipTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (!isMounted) return;

		const today = new Date();
		const todayKey = formatDateToString(today);
		const seenKey = `calendarSpecialRemindersSeen_${todayKey}`;
		const alreadySeen = localStorage.getItem(seenKey) === '1';
		if (alreadySeen) {
			setReminderAlerts([]);
			return;
		}

		const generated: ReminderAlertItem[] = [];

		Object.entries(specialDaysByMonthDay).forEach(([monthDay, items]) => {
			const daysLeft = daysUntilMonthDay(monthDay, today);
			items.forEach((item) => {
				const shouldNotify =
					(item.reminder === 'on-day' && daysLeft === 0) ||
					(item.reminder === '1-day-before' && daysLeft === 1) ||
					(item.reminder === '1-week-before' && daysLeft === 7);

				if (!shouldNotify) return;

				generated.push({
					id: item.id,
					message:
						daysLeft === 0
							? `Reminder: ${item.title} is today.`
							: `Reminder: ${item.title} is in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`,
				});
			});
		});

		setReminderAlerts(generated.slice(0, 4));
	}, [specialDaysByMonthDay, isMounted]);

	const dismissReminders = () => {
		const today = new Date();
		const todayKey = formatDateToString(today);
		localStorage.setItem(`calendarSpecialRemindersSeen_${todayKey}`, '1');
		setReminderAlerts([]);
	};

	const triggerMonthFlip = (offset: number, direction: MonthFlipDirection) => {
		if (flippingDate) return;

		setFlippingDate(new Date(currentDate));
		setFlipDirection(direction);
		setCurrentDate((prev) => addMonths(prev, offset));

		if (flipTimeoutRef.current) {
			clearTimeout(flipTimeoutRef.current);
		}

		flipTimeoutRef.current = setTimeout(() => {
			setFlippingDate(null);
		}, MONTH_FLIP_DURATION);
	};

	const handlePreviousMonth = () => {
		triggerMonthFlip(-1, 'prev');
	};

	const handleNextMonth = () => {
		triggerMonthFlip(1, 'next');
	};

	const handleToday = () => {
		setCurrentDate(new Date());
	};

	const handleDateSelect = (date: Date, isStart: boolean) => {
		if (isStart) {
			setDateRange({ start: date, end: null });
			return;
		}

		setDateRange((prev) => ({ ...prev, end: date }));
	};

	const clearSelection = () => setDateRange({ start: null, end: null });
	const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

	const setTodayRange = () => {
		const today = new Date();
		const value = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		setCurrentDate(value);
		setDateRange({ start: value, end: value });
	};

	const setWeekendRange = () => {
		const y = currentDate.getFullYear();
		const m = currentDate.getMonth();
		const start = new Date(y, m, 1);

		while (start.getMonth() === m && start.getDay() !== 6) {
			start.setDate(start.getDate() + 1);
		}

		const end = new Date(start);
		end.setDate(end.getDate() + 1);

		setDateRange({
			start,
			end: end.getMonth() === m ? end : new Date(y, m + 1, 0),
		});
	};

	const setMonthRange = () => {
		const y = currentDate.getFullYear();
		const m = currentDate.getMonth();
		setDateRange({ start: new Date(y, m, 1), end: new Date(y, m + 1, 0) });
	};

	const dateKey = (date: Date) => formatDateToString(date);
	const monthDayKey = (date: Date) => `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	const toDateFromKey = (value: string) => {
		const [yearText, monthText, dayText] = value.split('-');
		return new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
	};

	const isTaskActiveOnDate = (task: TaskItem, date: Date) => {
		const current = dateKey(date);
		return current >= task.startDate && current <= task.endDate;
	};

	const getTasksForDate = (date: Date) => tasks.filter((task) => isTaskActiveOnDate(task, date));

	const getTaskSummary = (date: Date) => {
		const visibleTasks = getTasksForDate(date);
		return {
			total: visibleTasks.length,
			repeat: visibleTasks.filter((task) => task.scope === 'repeat-range').length,
			span: visibleTasks.filter((task) => task.scope === 'spanning-range').length,
		};
	};

	const daysUntilMonthDay = (monthDay: string, baseDate: Date) => {
		const [monthText, dayText] = monthDay.split('-');
		const monthIndex = Number(monthText) - 1;
		const day = Number(dayText);
		if (Number.isNaN(monthIndex) || Number.isNaN(day)) return Number.POSITIVE_INFINITY;

		const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
		let target = new Date(start.getFullYear(), monthIndex, day);

		if (target < start) {
			target = new Date(start.getFullYear() + 1, monthIndex, day);
		}

		const diffMs = target.getTime() - start.getTime();
		return Math.round(diffMs / 86400000);
	};

	const getSpecialDaysForDate = (date: Date) => specialDaysByMonthDay[monthDayKey(date)] ?? [];

	const getSpecialDayCount = (date: Date) => getSpecialDaysForDate(date).length;

	const openEventModal = (date: Date) => {
		setSelectedDate(date);
		setEventDraft(defaultEventDraft);
		const rangeStart = dateRange.start && dateRange.end ? dateRange.start : date;
		const rangeEnd = dateRange.start && dateRange.end ? dateRange.end : date;
		setSpecialDayDraft(defaultSpecialDayDraft);
		setEditingTaskId(null);
		setTaskDraft({
			...defaultTaskDraft,
			startDate: dateKey(rangeStart),
			endDate: dateKey(rangeEnd),
			scope: dateRange.start && dateRange.end ? 'repeat-range' : 'single',
		});
		setEventModalOpen(true);
	};

	const closeEventModal = () => {
		setTaskDraft(defaultTaskDraft);
		setEditingTaskId(null);
		setEventModalOpen(false);
	};

	const saveTask = () => {
		if (!taskDraft.title.trim()) return;

		const fallbackStart = dateRange.start && dateRange.end ? dateRange.start : selectedDate ?? currentDate;
		const fallbackEnd = dateRange.start && dateRange.end ? dateRange.end : selectedDate ?? currentDate;
		const startKey = taskDraft.startDate || dateKey(fallbackStart);
		const endKey = taskDraft.endDate || dateKey(fallbackEnd);
		const normalizedStart = startKey <= endKey ? startKey : endKey;
		const normalizedEnd = startKey <= endKey ? endKey : startKey;
		const payload: TaskItem = {
			id: editingTaskId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			title: taskDraft.title.trim(),
			assignedTo: taskDraft.assignedTo.trim() || 'Self',
			priority: taskDraft.priority,
			status: taskDraft.status,
			description: taskDraft.description.trim(),
			category: taskDraft.category.trim() || 'General',
			checklist: taskDraft.checklistText
				.split('\n')
				.map((item) => item.trim())
				.filter(Boolean),
			startDate: normalizedStart,
			endDate: normalizedEnd,
			scope: taskDraft.scope,
		};

		setTasks((prev) => {
			if (editingTaskId) {
				return prev.map((task) => (task.id === editingTaskId ? payload : task));
			}

			return [...prev, payload];
		});

		setEditingTaskId(null);
		setTaskDraft((prev) => ({
			...defaultTaskDraft,
			startDate: prev.startDate,
			endDate: prev.endDate,
			scope: prev.scope,
		}));
	};

	const editTask = (task: TaskItem) => {
		setEditingTaskId(task.id);
		setTaskDraft({
			title: task.title,
			assignedTo: task.assignedTo,
			priority: task.priority,
			status: task.status,
			description: task.description,
			category: task.category,
			checklistText: task.checklist.join('\n'),
			startDate: task.startDate,
			endDate: task.endDate,
			scope: task.scope,
		});
	};

	const deleteTask = (taskId: string) => {
		setTasks((prev) => prev.filter((task) => task.id !== taskId));
		if (editingTaskId === taskId) {
			setEditingTaskId(null);
			setTaskDraft(defaultTaskDraft);
		}
	};

	const selectedTaskList = (() => {
		if (dateRange.start && dateRange.end) {
			const startKey = dateKey(dateRange.start);
			const endKey = dateKey(dateRange.end);
			return tasks.filter((task) => task.startDate <= endKey && task.endDate >= startKey);
		}

		return selectedDate ? getTasksForDate(selectedDate) : [];
	})();

	const createSpecialDay = () => {
		if (!selectedDate || !specialDayDraft.title.trim()) return;

		const key = monthDayKey(selectedDate);
		const payload: SpecialDayItem = {
			id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			title: specialDayDraft.title.trim(),
			type: specialDayDraft.type,
			monthDay: key,
			reminder: specialDayDraft.reminder,
			recurrence: 'yearly',
			notes: specialDayDraft.notes.trim(),
		};

		setSpecialDaysByMonthDay((prev) => {
			const existing = prev[key] ?? [];
			return {
				...prev,
				[key]: [...existing, payload],
			};
		});

		setSpecialDayDraft(defaultSpecialDayDraft);
	};

	const removeSpecialDay = (id: string, monthDay: string) => {
		setSpecialDaysByMonthDay((prev) => {
			const existing = prev[monthDay] ?? [];
			const nextItems = existing.filter((item) => item.id !== id);
			return {
				...prev,
				[monthDay]: nextItems,
			};
		});
	};

	const createEvent = () => {
		if (!selectedDate || !eventDraft.title.trim()) return;
		const key = dateKey(selectedDate);
		const payload: CalendarEventItem = {
			id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			title: eventDraft.title.trim(),
			time: eventDraft.time,
			description: eventDraft.description.trim(),
			category: eventDraft.category,
			reminder: eventDraft.reminder,
		};

		setEventsByDate((prev) => {
			const existing = prev[key] ?? [];
			return {
				...prev,
				[key]: [...existing, payload].sort((a, b) => a.time.localeCompare(b.time)),
			};
		});

		setEventDraft(defaultEventDraft);
	};

	const markDoneAndRemoveEvent = (id: string) => {
		if (!selectedDate) return;
		const key = dateKey(selectedDate);

		setEventsByDate((prev) => {
			const existing = prev[key] ?? [];
			const nextEvents = existing.filter((item) => item.id !== id);
			return {
				...prev,
				[key]: nextEvents,
			};
		});
	};

	const getEventCount = (date: Date) => {
		const key = dateKey(date);
		return eventsByDate[key]?.length ?? 0;
	};

	const monthStats = (() => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		let totalEvents = 0;
		let totalTasks = 0;
		let completedTasks = 0;
		let inProgressTasks = 0;
		let busyDays = 0;

		for (let day = 1; day <= daysInMonth; day += 1) {
			const key = formatDateToString(new Date(year, month, day));
			const events = eventsByDate[key] ?? [];
			const tasksForDay = tasks.filter((task) => isTaskActiveOnDate(task, new Date(year, month, day)));
			const done = tasksForDay.filter((task) => task.status === 'Done').length;
			const inProgress = tasksForDay.filter((task) => task.status === 'In Progress').length;

			totalEvents += events.length;
			totalTasks += tasksForDay.length;
			completedTasks += done;
			inProgressTasks += inProgress;

			if (events.length > 0 || tasksForDay.length > 0) {
				busyDays += 1;
			}
		}

		return {
			totalEvents,
			totalTasks,
			completedTasks,
			inProgressTasks,
			busyDays,
			freeDays: daysInMonth - busyDays,
		};
	})();

	const renderCalendarView = (displayDate: Date, isOverlay = false) => {
		const monthKey = `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}`;

		return (
			<div className="flex h-full min-h-0 flex-col">
				<HeroImage currentDate={displayDate} />

				<div className="flex flex-1 min-h-0 flex-col p-3 md:p-4">
					<CalendarHeader
						currentDate={displayDate}
						onPreviousMonth={handlePreviousMonth}
						onNextMonth={handleNextMonth}
						onToday={handleToday}
						onTodayRange={setTodayRange}
						onWeekendRange={setWeekendRange}
						onMonthRange={setMonthRange}
						dateRange={dateRange}
						theme={theme}
					/>

					<div className="mt-3 grid flex-1 min-h-0 grid-cols-1 gap-4 md:grid-cols-[0.92fr_1.38fr]">
						<NotesSection monthKey={monthKey} selectedDates={dateRange} theme={theme} />
						<DateGrid
							currentDate={displayDate}
							dateRange={dateRange}
							onDateSelect={isOverlay ? () => undefined : handleDateSelect}
							onDateClick={isOverlay ? () => undefined : openEventModal}
							getEventCount={getEventCount}
							getSpecialDayCount={getSpecialDayCount}
							getTaskSummary={getTaskSummary}
							theme={theme}
						/>
					</div>
				</div>
			</div>
		);
	};

	if (!isMounted) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
				Loading calendar...
			</div>
		);
	}

	return (
		<div
			className={`min-h-[100dvh] overflow-y-auto p-2 md:h-[100dvh] md:overflow-hidden md:p-3 transition-colors ${
				theme === 'dark'
					? 'bg-slate-950 text-slate-100'
					: 'bg-[radial-gradient(circle_at_top_left,_#bfdbfe,_#c4b5fd_38%,_#99f6e4_100%)] text-slate-900'
			}`}
		>
			{theme === 'light' && (
				<>
					<div className="pointer-events-none absolute left-[-80px] top-[-60px] h-72 w-72 rounded-full bg-cyan-300/40 blur-3xl" />
					<div className="pointer-events-none absolute bottom-[-80px] right-[-40px] h-80 w-80 rounded-full bg-indigo-300/35 blur-3xl" />
				</>
			)}
			<div className="mx-auto flex min-h-full max-w-6xl flex-col md:h-full">
				{reminderAlerts.length > 0 && (
					<div className="mb-2 flex shrink-0 flex-col items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-0.5">
							{reminderAlerts.map((alertItem) => (
								<p key={alertItem.id}>🎂 {alertItem.message}</p>
							))}
						</div>
						<button
							onClick={dismissReminders}
							className="rounded-md border border-amber-400 bg-white px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100"
						>
							Dismiss
						</button>
					</div>
				)}

				<div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-3">
					<h1 className="text-lg font-semibold tracking-[0.12em] sm:text-xl md:text-2xl md:tracking-[0.14em]">WALL CALENDAR</h1>
					<div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
						{dateRange.start && (
							<button
								onClick={clearSelection}
								className="rounded-md bg-rose-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-rose-700 sm:text-sm"
							>
								Clear Range
							</button>
						)}
						<button
							onClick={toggleTheme}
							className={`rounded-md px-3 py-2 text-xs font-medium transition sm:text-sm ${
								theme === 'dark'
									? 'bg-amber-400 text-black hover:bg-amber-500'
									: 'bg-slate-900 text-white hover:bg-slate-800'
							}`}
						>
							{theme === 'dark' ? 'Light' : 'Dark'}
						</button>
					</div>
				</div>

				<div
					className={`month-flip-stack flex-1 min-h-0 ${flippingDate ? `is-flipping flip-${flipDirection}` : ''} overflow-hidden rounded-2xl border shadow-[0_18px_50px_-25px_rgba(15,23,42,0.5)] ${
						theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'
					}`}
				>
					<div className="month-flip-layer month-flip-new-month h-full">{renderCalendarView(currentDate)}</div>
					{flippingDate && (
						<div className={`month-flip-overlay month-flip-current-month peel-${flipDirection} h-full`}>
							<div className="month-flip-sheet">{renderCalendarView(flippingDate, true)}</div>
							<div className="month-flip-under-shadow" />
						</div>
					)}
				</div>

				<div
					className={`mt-3 shrink-0 rounded-xl border p-3 ${
						theme === 'dark' ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white'
					}`}
				>
					<h3 className="text-sm font-semibold tracking-[0.16em]">
						{currentDate.toLocaleString('default', { month: 'long' })} SUMMARY
					</h3>
					<div className="mt-2 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-3 md:grid-cols-5 md:text-xs">
						<div className={`rounded-lg px-3 py-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
							<p className="opacity-70">Total Events</p>
							<p className="font-semibold">{monthStats.totalEvents}</p>
						</div>
						<div className={`rounded-lg px-3 py-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
							<p className="opacity-70">Tasks</p>
							<p className="font-semibold">{monthStats.totalTasks}</p>
						</div>
						<div className={`rounded-lg px-3 py-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
							<p className="opacity-70">In Progress</p>
							<p className="font-semibold">{monthStats.inProgressTasks}</p>
						</div>
						<div className={`rounded-lg px-3 py-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
							<p className="opacity-70">Done</p>
							<p className="font-semibold">{monthStats.completedTasks}</p>
						</div>
						<div className={`rounded-lg px-3 py-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
							<p className="opacity-70">Busy Days</p>
							<p className="font-semibold">{monthStats.busyDays}</p>
						</div>
						<div className={`rounded-lg px-3 py-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
							<p className="opacity-70">Free Days</p>
							<p className="font-semibold">{monthStats.freeDays}</p>
						</div>
					</div>
				</div>
			</div>

			{eventModalOpen && selectedDate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
					<div
						className={`calendar-modal-panel w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-xl border p-4 shadow-xl ${
							theme === 'dark' ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'
						}`}
					>
						<div className="mb-3 flex items-center justify-between">
							<h3 className="text-sm font-semibold tracking-[0.14em]">ADD EVENT</h3>
							<button className="text-xs font-semibold opacity-70 hover:opacity-100" onClick={closeEventModal}>
								Close
							</button>
						</div>

						<p className="mb-3 text-xs opacity-70">{selectedDate.toDateString()}</p>

						<div className="grid gap-2">
							<input
								placeholder="Event title"
								value={eventDraft.title}
								onChange={(event) => setEventDraft((prev) => ({ ...prev, title: event.target.value }))}
								className={`rounded-md border px-3 py-2 text-sm ${
									theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'
								}`}
							/>
							<input
								type="time"
								value={eventDraft.time}
								onChange={(event) => setEventDraft((prev) => ({ ...prev, time: event.target.value }))}
								className={`rounded-md border px-3 py-2 text-sm ${
									theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'
								}`}
							/>
							<textarea
								placeholder="Description"
								value={eventDraft.description}
								onChange={(event) => setEventDraft((prev) => ({ ...prev, description: event.target.value }))}
								className={`h-20 rounded-md border px-3 py-2 text-sm ${
									theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'
								}`}
							/>
							<select
								value={eventDraft.category}
								onChange={(event) => setEventDraft((prev) => ({ ...prev, category: event.target.value }))}
								className={`rounded-md border px-3 py-2 text-sm ${
									theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'
								}`}
							>
								<option value="Work">Work</option>
								<option value="Health">Health</option>
								<option value="Study">Study</option>
								<option value="Personal">Personal</option>
								<option value="Family">Family</option>
							</select>
							<select
								value={eventDraft.reminder}
								onChange={(event) => setEventDraft((prev) => ({ ...prev, reminder: event.target.value }))}
								className={`rounded-md border px-3 py-2 text-sm ${
									theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'
								}`}
							>
								<option value="1 hour before">1 hour before</option>
								<option value="1 day before">1 day before</option>
								<option value="At 9:00 AM">At 9:00 AM</option>
								<option value="None">None</option>
							</select>
						</div>

						<button
							onClick={createEvent}
							className="mt-3 w-full rounded-md bg-cyan-600 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
						>
							Add Event
						</button>

						<div className="mt-4 space-y-2">
							<p className="text-xs font-semibold tracking-[0.12em] opacity-70">EVENTS ON THIS DATE</p>
							{(eventsByDate[dateKey(selectedDate)] ?? []).length === 0 && (
								<p className="text-xs opacity-60">No events yet.</p>
							)}
							{(eventsByDate[dateKey(selectedDate)] ?? []).map((item) => (
								<div
									key={item.id}
									className={`rounded-md border p-2 text-xs ${
										theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
									}`}
								>
									<div className="flex items-center justify-between gap-2">
										<p className="font-semibold">{item.time} | {item.title}</p>
										<button
											onClick={() => markDoneAndRemoveEvent(item.id)}
											className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-emerald-700"
										>
											Mark Done
										</button>
									</div>
									<p className="opacity-70">{item.category} | Reminder: {item.reminder}</p>
									{item.description && <p className="mt-1 opacity-80">{item.description}</p>}
								</div>
							))}
						</div>

						<div className="mt-4 space-y-3">
							<div className="flex items-center justify-between gap-2">
								<p className="text-xs font-semibold tracking-[0.12em] opacity-70">TASK PLANNER</p>
								<p className="text-[11px] opacity-70">
									{dateRange.start && dateRange.end
										? `${dateRange.start.toLocaleDateString()} -> ${dateRange.end.toLocaleDateString()}`
										: selectedDate?.toLocaleDateString()}
								</p>
							</div>

							<div className="grid gap-2 md:grid-cols-2">
								<input
									value={taskDraft.title}
									onChange={(event) => setTaskDraft((prev) => ({ ...prev, title: event.target.value }))}
									placeholder="Task title"
									className={`rounded-md border px-3 py-2 text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}
								/>
								<input
									value={taskDraft.assignedTo}
									onChange={(event) => setTaskDraft((prev) => ({ ...prev, assignedTo: event.target.value }))}
									placeholder="Assigned to"
									className={`rounded-md border px-3 py-2 text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}
								/>
								<select
									value={taskDraft.priority}
									onChange={(event) => setTaskDraft((prev) => ({ ...prev, priority: event.target.value as TaskDraft['priority'] }))}
									className={`rounded-md border px-3 py-2 text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}
								>
									<option value="High">High Priority</option>
									<option value="Medium">Medium Priority</option>
									<option value="Low">Low Priority</option>
								</select>
								<select
									value={taskDraft.status}
									onChange={(event) => setTaskDraft((prev) => ({ ...prev, status: event.target.value as TaskDraft['status'] }))}
									className={`rounded-md border px-3 py-2 text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}
								>
									<option value="To Do">To Do</option>
									<option value="In Progress">In Progress</option>
									<option value="Done">Done</option>
								</select>
								<input
									value={taskDraft.category}
									onChange={(event) => setTaskDraft((prev) => ({ ...prev, category: event.target.value }))}
									placeholder="Category / label"
									className={`rounded-md border px-3 py-2 text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}
								/>
								<select
									value={taskDraft.scope}
									onChange={(event) => setTaskDraft((prev) => ({ ...prev, scope: event.target.value as TaskDraft['scope'] }))}
									className={`rounded-md border px-3 py-2 text-sm md:col-span-2 ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}
								>
									<option value="single">Single-day task</option>
									<option value="repeat-range">Repeat across selected range</option>
									<option value="spanning-range">One spanning range task</option>
								</select>
								<input
									type="date"
									value={taskDraft.startDate}
									onChange={(event) => setTaskDraft((prev) => ({ ...prev, startDate: event.target.value }))}
									className={`rounded-md border px-3 py-2 text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}
								/>
								<input
									type="date"
									value={taskDraft.endDate}
									onChange={(event) => setTaskDraft((prev) => ({ ...prev, endDate: event.target.value }))}
									className={`rounded-md border px-3 py-2 text-sm ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}
								/>
								<textarea
									value={taskDraft.description}
									onChange={(event) => setTaskDraft((prev) => ({ ...prev, description: event.target.value }))}
									placeholder="Description / notes"
									className={`h-20 rounded-md border px-3 py-2 text-sm md:col-span-2 ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}
								/>
								<textarea
									value={taskDraft.checklistText}
									onChange={(event) => setTaskDraft((prev) => ({ ...prev, checklistText: event.target.value }))}
									placeholder="Checklist / subtasks, one per line"
									className={`h-20 rounded-md border px-3 py-2 text-sm md:col-span-2 ${theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}
								/>
							</div>

							<div className="flex flex-wrap gap-2">
								<button onClick={saveTask} className="rounded-md bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-700">
									{editingTaskId ? 'Update Task' : 'Save Task'}
								</button>
								{editingTaskId && (
									<button
										onClick={() => {
										setEditingTaskId(null);
										const rangeStart = dateRange.start && dateRange.end ? dateRange.start : selectedDate ?? currentDate;
										const rangeEnd = dateRange.start && dateRange.end ? dateRange.end : selectedDate ?? currentDate;
										setTaskDraft({
											...defaultTaskDraft,
											startDate: dateKey(rangeStart),
											endDate: dateKey(rangeEnd),
											scope: dateRange.start && dateRange.end ? 'repeat-range' : 'single',
										});
									}}
									className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
									>
										Cancel Edit
									</button>
								)}
							</div>

							<div className={`space-y-2 rounded-xl border p-3 text-xs ${theme === 'dark' ? 'border-slate-700 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
								<div className="flex items-center justify-between">
									<p className="font-semibold tracking-[0.12em] opacity-70">TASKS FOR CURRENT SELECTION</p>
									<p className="opacity-70">{selectedTaskList.length} item{selectedTaskList.length === 1 ? '' : 's'}</p>
								</div>
								{selectedTaskList.length === 0 && <p className="opacity-60">No tasks in the current date or range selection.</p>}
								{selectedTaskList.map((task) => (
									<div key={task.id} className={`rounded-lg border p-3 ${theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
										<div className="flex items-start justify-between gap-3">
											<div>
												<div className="flex flex-wrap items-center gap-2">
													<p className="font-semibold">{task.title}</p>
													<span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200">Assigned to {task.assignedTo}</span>
													<span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${task.priority === 'High' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>{task.priority} Priority</span>
													<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">{task.status}</span>
												</div>
												<p className="mt-1 text-[11px] opacity-70">
													<span>{task.scope === 'single' ? 'Single day' : task.scope === 'repeat-range' ? 'Repeats across range' : 'One spanning range task'}</span>
													<span className="mx-1 opacity-50">•</span>
													<span>{toDateFromKey(task.startDate).toLocaleDateString()}</span>
													<span className="mx-1 opacity-50">to</span>
													<span>{toDateFromKey(task.endDate).toLocaleDateString()}</span>
												</p>
												<p className="mt-1 text-[11px] opacity-70">{task.category}</p>
											</div>
											<div className="flex gap-2">
												<button onClick={() => editTask(task)} className="rounded-md border border-slate-300 px-2 py-1 text-[10px] font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">Edit</button>
												<button onClick={() => deleteTask(task.id)} className="rounded-md border border-rose-300 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-950/40">Delete</button>
											</div>
										</div>
										{task.description && <p className="mt-2 text-[11px] leading-5 opacity-80">{task.description}</p>}
										{task.checklist.length > 0 && (
											<div className="mt-2 grid gap-1">
												{task.checklist.map((item) => (
													<div key={item} className="flex items-start gap-2 text-[11px] opacity-80"><span className="mt-0.5">•</span><span>{item}</span></div>
												))}
											</div>
										)}
									</div>
								))}
							</div>

						<div className="mt-4 space-y-2">
							<p className="text-xs font-semibold tracking-[0.12em] opacity-70">BIRTHDAY / ANNIVERSARY TRACKER</p>
							<div className="grid gap-2">
								<input
									placeholder="Name of day (e.g. Mom Birthday)"
									value={specialDayDraft.title}
									onChange={(event) => setSpecialDayDraft((prev) => ({ ...prev, title: event.target.value }))}
									className={`rounded-md border px-3 py-2 text-sm ${
										theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'
									}`}
								/>
								<select
									value={specialDayDraft.type}
									onChange={(event) =>
										setSpecialDayDraft((prev) => ({ ...prev, type: event.target.value as SpecialDayType }))
									}
									className={`rounded-md border px-3 py-2 text-sm ${
										theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'
									}`}
								>
									<option value="birthday">Birthday</option>
									<option value="anniversary">Anniversary</option>
									<option value="special">Special Day</option>
								</select>
								<select
									value={specialDayDraft.reminder}
									onChange={(event) =>
										setSpecialDayDraft((prev) => ({
											...prev,
											reminder: event.target.value as SpecialDayDraft['reminder'],
										}))
									}
									className={`rounded-md border px-3 py-2 text-sm ${
										theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'
									}`}
								>
									<option value="on-day">Reminder: On day</option>
									<option value="1-day-before">Reminder: 1 day before</option>
									<option value="1-week-before">Reminder: 1 week before</option>
								</select>
								<textarea
									placeholder="Optional note"
									value={specialDayDraft.notes}
									onChange={(event) => setSpecialDayDraft((prev) => ({ ...prev, notes: event.target.value }))}
									className={`h-16 rounded-md border px-3 py-2 text-sm ${
										theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'
									}`}
								/>
							</div>

							<button
								onClick={createSpecialDay}
								className="w-full rounded-md bg-pink-600 py-2 text-sm font-semibold text-white hover:bg-pink-700"
							>
								Save Recurring Special Day 🎂
							</button>

							<div className="space-y-1">
								{getSpecialDaysForDate(selectedDate).length === 0 && (
									<p className="text-xs opacity-60">No recurring special days on this date yet.</p>
								)}
								{getSpecialDaysForDate(selectedDate).map((item) => (
									<div
										key={item.id}
										className={`rounded-md border p-2 text-xs ${
											theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
										}`}
									>
										<div className="flex items-center justify-between gap-2">
											<p className="font-semibold">🎂 {item.title}</p>
											<button
												onClick={() => removeSpecialDay(item.id, item.monthDay)}
												className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-rose-700"
											>
												Remove
											</button>
										</div>
										<p className="opacity-70">
											{item.type} | Yearly recurrence | {item.reminder.replaceAll('-', ' ')}
										</p>
										{item.notes && <p className="mt-1 opacity-80">{item.notes}</p>}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
			)}
		</div>
	);
}
