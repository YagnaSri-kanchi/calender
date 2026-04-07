'use client';

import { useState, useEffect, useCallback } from 'react';
import { addMonths, formatDateToString, parseStringToDate, isSameDay } from '@/app/utils/dateUtils';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

/**
 * Custom hook for managing calendar state with localStorage persistence
 */
export const useCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [isMounted, setIsMounted] = useState(false);

  // Initialize from localStorage on client side
  useEffect(() => {
    setIsMounted(true);
    const savedDateRange = localStorage.getItem('selectedDateRange');

    if (savedDateRange) {
      try {
        const parsed = JSON.parse(savedDateRange);
        setDateRange({
          start: parsed.start ? parseStringToDate(parsed.start) : null,
          end: parsed.end ? parseStringToDate(parsed.end) : null,
        });
      } catch (e) {
        console.error('Failed to parse saved date range:', e);
      }
    }
  }, []);

  // Save date range to localStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(
        'selectedDateRange',
        JSON.stringify({
          start: dateRange.start ? formatDateToString(dateRange.start) : null,
          end: dateRange.end ? formatDateToString(dateRange.end) : null,
        })
      );
    }
  }, [dateRange, isMounted]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) => addMonths(prev, direction === 'next' ? 1 : -1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const selectDate = useCallback((date: Date, isStart: boolean) => {
    if (isStart) {
      setDateRange({
        start: date,
        end: null,
      });
    } else {
      setDateRange((prev) => ({
        ...prev,
        end: date,
      }));
    }
  }, []);

  const clearSelection = useCallback(() => {
    setDateRange({ start: null, end: null });
  }, []);

  const clearDateRange = useCallback(() => {
    setDateRange({ start: null, end: null });
  }, []);

  return {
    currentDate,
    dateRange,
    isMounted,
    navigateMonth,
    goToToday,
    selectDate,
    clearSelection,
    clearDateRange,
    setCurrentDate,
    setDateRange,
  };
};

/**
 * Custom hook for managing theme
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('calendarTheme') as
      | 'light'
      | 'dark'
      | null;

    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('calendarTheme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, isMounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, isMounted, toggleTheme, setTheme };
};

/**
 * Custom hook for managing notes
 */
interface MonthlyNotes {
  generalNotes: string;
  dateNotes: Record<string, string>;
}

export const useNotes = (monthKey: string) => {
  const [notes, setNotes] = useState<MonthlyNotes>({
    generalNotes: '',
    dateNotes: {},
  });

  // Load notes from localStorage
  useEffect(() => {
    const storedNotes = localStorage.getItem(`notes_${monthKey}`);
    if (storedNotes) {
      try {
        setNotes(JSON.parse(storedNotes));
      } catch (e) {
        console.error('Failed to parse stored notes:', e);
      }
    } else {
      // Reset notes when month changes
      setNotes({ generalNotes: '', dateNotes: {} });
    }
  }, [monthKey]);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem(`notes_${monthKey}`, JSON.stringify(notes));
  }, [notes, monthKey]);

  const updateGeneralNotes = useCallback((text: string) => {
    setNotes((prev) => ({
      ...prev,
      generalNotes: text,
    }));
  }, []);

  const updateDateNote = useCallback((dateKey: string, text: string) => {
    setNotes((prev) => ({
      ...prev,
      dateNotes: {
        ...prev.dateNotes,
        [dateKey]: text,
      },
    }));
  }, []);

  return { notes, updateGeneralNotes, updateDateNote };
};
