/**
 * Date utility functions for calendar operations
 */

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/**
 * Get the number of days in a given month
 */
export const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

/**
 * Get the first day of the week for a given month (0 = Sunday, 6 = Saturday)
 */
export const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

/**
 * Check if a date is within a range
 */
export const isDateInRange = (
  date: Date,
  range: DateRange
): boolean => {
  if (!range.start || !range.end) return false;
  
  const start = new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate());
  const end = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate());
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  return current >= start && current <= end;
};

/**
 * Check if a date is the start of a range
 */
export const isRangeStart = (date: Date, range: DateRange): boolean => {
  if (!range.start) return false;
  return isSameDay(date, range.start);
};

/**
 * Check if a date is the end of a range
 */
export const isRangeEnd = (date: Date, range: DateRange): boolean => {
  if (!range.end) return false;
  return isSameDay(date, range.end);
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Format date to string (YYYY-MM-DD)
 */
export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse date string (YYYY-MM-DD) to Date
 */
export const parseStringToDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Get month name
 */
export const getMonthName = (date: Date): string => {
  return date.toLocaleString('default', { month: 'long' });
};

/**
 * Get day name
 */
export const getDayName = (dayIndex: number): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex];
};

/**
 * Add months to a date
 */
export const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

/**
 * Get calendar grid for a month (includes days from previous/next months)
 */
export const getCalendarGrid = (date: Date): (number | null)[] => {
  const firstDay = getFirstDayOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const daysInPrevMonth = getDaysInMonth(new Date(date.getFullYear(), date.getMonth() - 1));
  
  const grid: (number | null)[] = [];
  
  // Add days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    grid.push(null); // null represents days outside current month
  }
  
  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push(i);
  }
  
  // Add days from next month to fill the grid
  const remaining = 42 - grid.length; // 6 rows × 7 days
  for (let i = 1; i <= remaining; i++) {
    grid.push(null);
  }
  
  return grid;
};
