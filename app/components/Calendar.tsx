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
	text: string;
	completed: boolean;
}

const defaultEventDraft: EventDraft = {
	title: '',
	time: '09:00',
	description: '',
	category: 'Work',
	reminder: '1 day before',
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
	const [tasksByDate, setTasksByDate] = useState<Record<string, TaskItem[]>>({});
	const [taskInput, setTaskInput] = useState('');
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
		if (savedTasks) {
			try {
				setTasksByDate(JSON.parse(savedTasks));
			} catch {
				setTasksByDate({});
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
		localStorage.setItem('calendarTasksByDate', JSON.stringify(tasksByDate));
	}, [tasksByDate, isMounted]);

	useEffect(() => {
		return () => {
			if (flipTimeoutRef.current) {
				clearTimeout(flipTimeoutRef.current);
			}
		};
	}, []);

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

	const openEventModal = (date: Date) => {
		setSelectedDate(date);
		setEventDraft(defaultEventDraft);
		setEventModalOpen(true);
	};

	const closeEventModal = () => {
		setTaskInput('');
		setEventModalOpen(false);
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
		let completedTasks = 0;
		let pendingTasks = 0;
		let busyDays = 0;

		for (let day = 1; day <= daysInMonth; day += 1) {
			const key = formatDateToString(new Date(year, month, day));
			const events = eventsByDate[key] ?? [];
			const tasks = tasksByDate[key] ?? [];
			const done = tasks.filter((task) => task.completed).length;

			totalEvents += events.length;
			completedTasks += done;
			pendingTasks += tasks.length - done;

			if (events.length > 0 || tasks.length > 0) {
				busyDays += 1;
			}
		}

		return {
			totalEvents,
			completedTasks,
			pendingTasks,
			busyDays,
			freeDays: daysInMonth - busyDays,
		};
	})();

	const addTaskForSelectedDate = () => {
		if (!selectedDate || !taskInput.trim()) return;
		const key = dateKey(selectedDate);
		const payload: TaskItem = {
			id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			text: taskInput.trim(),
			completed: false,
		};

		setTasksByDate((prev) => {
			const existing = prev[key] ?? [];
			return {
				...prev,
				[key]: [...existing, payload],
			};
		});
		setTaskInput('');
	};

	const toggleTaskForSelectedDate = (taskId: string) => {
		if (!selectedDate) return;
		const key = dateKey(selectedDate);

		setTasksByDate((prev) => {
			const existing = prev[key] ?? [];
			return {
				...prev,
				[key]: existing.map((task) =>
					task.id === taskId ? { ...task, completed: !task.completed } : task
				),
			};
		});
	};

	const renderCalendarView = (displayDate: Date, isOverlay = false) => {
		const monthKey = `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}`;

		return (
			<>
				<HeroImage currentDate={displayDate} />

				<div className="p-4 md:p-6">
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

					<div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-[0.95fr_1.35fr]">
						<NotesSection monthKey={monthKey} selectedDates={dateRange} theme={theme} />
						<DateGrid
							currentDate={displayDate}
							dateRange={dateRange}
							onDateSelect={isOverlay ? () => undefined : handleDateSelect}
							onDateClick={isOverlay ? () => undefined : openEventModal}
							getEventCount={getEventCount}
							theme={theme}
						/>
					</div>
				</div>
			</>
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
			className={`min-h-screen p-4 md:p-8 transition-colors ${
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
			<div className="mx-auto max-w-4xl">
				<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
					<h1 className="text-xl font-semibold tracking-[0.14em] md:text-2xl">WALL CALENDAR</h1>
					<div className="flex items-center gap-2">
						{dateRange.start && (
							<button
								onClick={clearSelection}
								className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
							>
								Clear Range
							</button>
						)}
						<button
							onClick={toggleTheme}
							className={`rounded-md px-3 py-2 text-sm font-medium transition ${
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
					className={`month-flip-stack ${flippingDate ? `is-flipping flip-${flipDirection}` : ''} overflow-hidden rounded-2xl border shadow-[0_18px_50px_-25px_rgba(15,23,42,0.5)] ${
						theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'
					}`}
				>
					<div className="month-flip-layer month-flip-new-month">{renderCalendarView(currentDate)}</div>
					{flippingDate && (
						<div className={`month-flip-overlay month-flip-current-month peel-${flipDirection}`}>
							<div className="month-flip-sheet">{renderCalendarView(flippingDate, true)}</div>
							<div className="month-flip-under-shadow" />
						</div>
					)}
				</div>

				<div
					className={`mt-5 rounded-xl border p-4 ${
						theme === 'dark' ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white'
					}`}
				>
					<h3 className="text-sm font-semibold tracking-[0.16em]">
						{currentDate.toLocaleString('default', { month: 'long' })} SUMMARY
					</h3>
					<div className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-5 md:text-sm">
						<div className={`rounded-lg px-3 py-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
							<p className="opacity-70">Total Events</p>
							<p className="font-semibold">{monthStats.totalEvents}</p>
						</div>
						<div className={`rounded-lg px-3 py-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
							<p className="opacity-70">Completed Tasks</p>
							<p className="font-semibold">{monthStats.completedTasks}</p>
						</div>
						<div className={`rounded-lg px-3 py-2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
							<p className="opacity-70">Pending Tasks</p>
							<p className="font-semibold">{monthStats.pendingTasks}</p>
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
						className={`w-full max-w-md rounded-xl border p-4 shadow-xl ${
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

						<div className="mt-4 space-y-2">
							<div className="flex items-center justify-between">
								<p className="text-xs font-semibold tracking-[0.12em] opacity-70">TASKS</p>
								<p className="text-[11px] opacity-70">
									{(() => {
										const tasks = tasksByDate[dateKey(selectedDate)] ?? [];
										const done = tasks.filter((task) => task.completed).length;
										const pending = tasks.length - done;
										return `${done}/${tasks.length} completed | ${pending} pending`;
									})()}
								</p>
							</div>

							<div className="flex gap-2">
								<input
									value={taskInput}
									onChange={(event) => setTaskInput(event.target.value)}
									placeholder="Add task (e.g. Finish resume)"
									className={`w-full rounded-md border px-3 py-2 text-sm ${
										theme === 'dark' ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'
									}`}
								/>
								<button
									onClick={addTaskForSelectedDate}
									className="rounded-md bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-700"
								>
									Add
								</button>
							</div>

							<div className="space-y-1">
								{(tasksByDate[dateKey(selectedDate)] ?? []).length === 0 && (
									<p className="text-xs opacity-60">No tasks yet.</p>
								)}
								{(tasksByDate[dateKey(selectedDate)] ?? []).map((task) => (
									<label key={task.id} className="flex items-center gap-2 text-sm">
										<input
											type="checkbox"
											checked={task.completed}
											onChange={() => toggleTaskForSelectedDate(task.id)}
										/>
										<span className={task.completed ? 'line-through opacity-60' : ''}>{task.text}</span>
									</label>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
