'use client';

import { useEffect, useMemo, useState } from 'react';

interface NotesSectionProps {
  monthKey: string;
  selectedDates: { start: Date | null; end: Date | null };
  theme: 'light' | 'dark';
}

interface MonthlyNotes {
  generalNotes: string;
  dateNotes: Record<string, string>;
}

const templateMap = {
  goals: 'Top goals:\n1.\n2.\n3.\n\nMust do this week:\n-\n-\n',
  work: 'Meetings:\n-\n-\nDeliverables:\n-\n-\nFollow-ups:\n-\n',
} as const;

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function NotesSection({ monthKey, selectedDates, theme }: NotesSectionProps) {
  const [notes, setNotes] = useState<MonthlyNotes>({ generalNotes: '', dateNotes: {} });
  const [activeTab, setActiveTab] = useState<'general' | 'specific'>('general');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`notes_${monthKey}`);
    if (stored) {
      try {
        setNotes(JSON.parse(stored));
      } catch {
        setNotes({ generalNotes: '', dateNotes: {} });
      }
      return;
    }
    setNotes({ generalNotes: '', dateNotes: {} });
  }, [monthKey]);

  useEffect(() => {
    localStorage.setItem(`notes_${monthKey}`, JSON.stringify(notes));
  }, [notes, monthKey]);

  const selectedDateKey = useMemo(() => {
    if (!selectedDates.start) return '';
    const start = formatDateKey(selectedDates.start);
    if (!selectedDates.end) return start;
    const end = formatDateKey(selectedDates.end);
    return `${start}_${end}`;
  }, [selectedDates.end, selectedDates.start]);

  const dateRangeText = useMemo(() => {
    if (!selectedDates.start) return 'No range selected';
    if (!selectedDates.end) return selectedDates.start.toLocaleDateString();
    return `${selectedDates.start.toLocaleDateString()} -> ${selectedDates.end.toLocaleDateString()}`;
  }, [selectedDates.end, selectedDates.start]);

  const currentDateNote = selectedDateKey ? notes.dateNotes[selectedDateKey] ?? '' : '';

  const updateGeneral = (value: string) => {
    setNotes((prev) => ({ ...prev, generalNotes: value }));
  };

  const updateSpecific = (value: string) => {
    if (!selectedDateKey) return;
    setNotes((prev) => ({
      ...prev,
      dateNotes: {
        ...prev.dateNotes,
        [selectedDateKey]: value,
      },
    }));
  };

  const insertTemplate = (template: keyof typeof templateMap) => {
    if (activeTab === 'general') {
      updateGeneral(`${notes.generalNotes}${notes.generalNotes ? '\n\n' : ''}${templateMap[template]}`);
      return;
    }

    if (!selectedDateKey) return;
    updateSpecific(`${currentDateNote}${currentDateNote ? '\n\n' : ''}${templateMap[template]}`);
  };

  const copyCurrentNotes = async () => {
    const payload = activeTab === 'general' ? notes.generalNotes : currentDateNote;
    if (!payload.trim()) return;

    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const exportCurrentNotes = () => {
    const payload = activeTab === 'general' ? notes.generalNotes : currentDateNote;
    if (!payload.trim()) return;

    const title = activeTab === 'general' ? `${monthKey}-month-notes` : `${monthKey}-range-notes`;
    const content = `Title: ${title}\n\n${payload}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${title}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`rounded-xl border ${
        theme === 'dark' ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-white'
      }`}
    >
      <div className={`border-b px-4 py-3 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
        <h3 className="text-sm font-semibold tracking-[0.18em]">NOTES</h3>
        <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{dateRangeText}</p>
      </div>

      <div className={`flex border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 px-3 py-2 text-xs font-semibold tracking-wide transition ${
            activeTab === 'general'
              ? 'bg-cyan-600 text-white'
              : theme === 'dark'
              ? 'text-slate-200 hover:bg-slate-700'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => setActiveTab('specific')}
          disabled={!selectedDates.start}
          className={`flex-1 px-3 py-2 text-xs font-semibold tracking-wide transition ${
            activeTab === 'specific'
              ? 'bg-cyan-600 text-white'
              : selectedDates.start
              ? theme === 'dark'
                ? 'text-slate-200 hover:bg-slate-700'
                : 'text-slate-700 hover:bg-slate-100'
              : 'cursor-not-allowed text-slate-400'
          }`}
        >
          Range
        </button>
      </div>

      <div className="flex flex-wrap gap-2 px-4 py-3">
        <button
          onClick={() => insertTemplate('goals')}
          className="rounded-md border border-cyan-500 px-2 py-1 text-[11px] font-semibold text-cyan-700 transition hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-900/30"
        >
          Goals Template
        </button>
        <button
          onClick={() => insertTemplate('work')}
          className="rounded-md border border-cyan-500 px-2 py-1 text-[11px] font-semibold text-cyan-700 transition hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-900/30"
        >
          Work Template
        </button>
        <button
          onClick={copyCurrentNotes}
          className="rounded-md border border-slate-400 px-2 py-1 text-[11px] font-semibold transition hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-slate-700"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={exportCurrentNotes}
          className="rounded-md border border-slate-400 px-2 py-1 text-[11px] font-semibold transition hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-slate-700"
        >
          Export TXT
        </button>
      </div>

      <div className="px-4 pb-4">
        <textarea
          value={activeTab === 'general' ? notes.generalNotes : currentDateNote}
          onChange={(event) =>
            activeTab === 'general' ? updateGeneral(event.target.value) : updateSpecific(event.target.value)
          }
          disabled={activeTab === 'specific' && !selectedDates.start}
          placeholder={
            activeTab === 'general'
              ? 'Write general month notes...'
              : selectedDates.start
              ? 'Write notes for selected range...'
              : 'Select at least one date first.'
          }
          className={`h-52 w-full resize-none rounded-md border px-3 py-2 text-sm leading-7 outline-none ${
            theme === 'dark'
              ? 'border-slate-600 bg-slate-900 text-slate-100 focus:border-cyan-500'
              : 'border-slate-300 bg-white text-slate-800 focus:border-cyan-600'
          }`}
          style={{
            backgroundImage:
              theme === 'dark'
                ? 'repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(148,163,184,0.26) 28px)'
                : 'repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(148,163,184,0.28) 28px)',
          }}
        />
      </div>
    </div>
  );
}
