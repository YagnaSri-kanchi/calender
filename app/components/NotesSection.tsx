'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface NotesSectionProps {
  monthKey: string;
  selectedDates: { start: Date | null; end: Date | null };
  theme: 'light' | 'dark';
}

interface NoteItem {
  id: string;
  text: string;
  createdAt: number;
}

interface NotesStore {
  entries: Record<string, NoteItem[]>;
}

const STORAGE_KEY = 'calendar-simple-notes-v1';

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateText = (date: Date) => `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

const buildSelectionKey = (start: Date | null, end: Date | null) => {
  if (!start) return '';

  const startKey = formatDateKey(start);
  if (!end) return startKey;

  const endKey = formatDateKey(end);
  return startKey <= endKey ? `${startKey}__${endKey}` : `${endKey}__${startKey}`;
};

export default function NotesSection({ selectedDates, theme }: NotesSectionProps) {
  const [store, setStore] = useState<NotesStore>({ entries: {} });
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<NotesStore>;
      setStore({ entries: parsed.entries ?? {} });
    } catch {
      setStore({ entries: {} });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  const selectedKey = useMemo(
    () => buildSelectionKey(selectedDates.start, selectedDates.end),
    [selectedDates.end, selectedDates.start]
  );

  const rangeLabel = useMemo(() => {
    if (!selectedDates.start) return 'No date selected';
    if (!selectedDates.end) return formatDateText(selectedDates.start);
    return `${formatDateText(selectedDates.start)} -> ${formatDateText(selectedDates.end)}`;
  }, [selectedDates.end, selectedDates.start]);

  const currentNotes = selectedKey ? store.entries[selectedKey] ?? [] : [];
  const panelClasses =
    theme === 'dark'
      ? 'bg-slate-900/60 backdrop-blur-2xl border-white/10'
      : 'bg-white border-slate-200 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]';
  const surfaceClasses = theme === 'dark' ? 'border-white/10' : 'border-slate-200 bg-slate-50';
  const textClasses = theme === 'dark' ? 'text-slate-200' : 'text-slate-800';
  const mutedTextClasses = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const inputClasses =
    theme === 'dark'
      ? 'text-slate-200 placeholder:text-slate-500'
      : 'text-slate-800 placeholder:text-slate-500';

  const addNote = () => {
    const text = draft.trim();
    if (!selectedKey || !text) return;

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      text,
      createdAt: Date.now(),
    };

    setStore((prev) => ({
      ...prev,
      entries: {
        ...prev.entries,
        [selectedKey]: [newNote, ...(prev.entries[selectedKey] ?? [])],
      },
    }));

    setDraft('');
    setJustAddedId(newNote.id);
    window.setTimeout(() => {
      setJustAddedId(null);
      listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 120);
  };

  const deleteNote = (id: string) => {
    if (!selectedKey) return;

    setStore((prev) => ({
      ...prev,
      entries: {
        ...prev.entries,
        [selectedKey]: (prev.entries[selectedKey] ?? []).filter((note) => note.id !== id),
      },
    }));

    if (editingId === id) {
      setEditingId(null);
      setEditingText('');
    }
  };

  const startEdit = (note: NoteItem) => {
    setEditingId(note.id);
    setEditingText(note.text);
  };

  const saveEdit = () => {
    if (!selectedKey || !editingId) return;
    const text = editingText.trim();
    if (!text) return;

    setStore((prev) => ({
      ...prev,
      entries: {
        ...prev.entries,
        [selectedKey]: (prev.entries[selectedKey] ?? []).map((note) =>
          note.id === editingId ? { ...note, text } : note
        ),
      },
    }));

    setEditingId(null);
    setEditingText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const addLineToDraft = () => {
    if (!selectedKey) return;
    setDraft((prev) => `${prev}${prev ? '\n' : ''}- `);
  };

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-y-auto rounded-[1.6rem] border p-4 [scrollbar-width:thin] [scrollbar-color:#00df9a_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#00df9a] ${panelClasses}`}
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <p className={`font-mono text-sm ${textClasses}`}>{rangeLabel}</p>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${theme === 'dark' ? 'border-cyan-300/70 bg-cyan-300/15 text-cyan-100 shadow-[0_0_10px_rgba(56,189,248,0.45)]' : 'border-cyan-500/30 bg-cyan-100 text-cyan-900'}`}>
          Status: Active
        </span>
      </header>

      <div className={`mb-3 min-h-0 flex-1 rounded-xl border p-3 ${surfaceClasses}`}>
        <div className="mb-2 flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!selectedKey}
            placeholder={selectedKey ? 'Write a note...' : 'Select a date or range to add notes.'}
            className={`min-h-[84px] w-full min-w-0 resize-none rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none ${
              inputClasses
            } disabled:cursor-not-allowed disabled:opacity-60`}
          />
          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={addNote}
              disabled={!selectedKey || !draft.trim()}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-cyan-300/10 disabled:opacity-60 ${theme === 'dark' ? 'border-cyan-300/45 text-cyan-200' : 'border-cyan-500/30 text-cyan-900 hover:bg-cyan-100'}`}
            >
              Add
            </button>
            <button
              onClick={addLineToDraft}
              disabled={!selectedKey}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-black/5 disabled:opacity-60 ${theme === 'dark' ? 'border-white/20 text-slate-200 hover:bg-white/10' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
            >
              Bullet
            </button>
          </div>
        </div>

        <div className={`mb-2 h-px ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`} />

        <div
          ref={listRef}
          className="max-h-[220px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#00df9a_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#00df9a]"
        >
          <div className="space-y-2">
          {currentNotes.length === 0 && (
            <p className={`rounded-lg border border-dashed px-3 py-2 text-xs ${theme === 'dark' ? 'border-white/15 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
              No notes yet for this selection.
            </p>
          )}

          {currentNotes.map((note) => (
            <div
              key={note.id}
              className={`rounded-lg border px-3 py-2 transition ${
                justAddedId === note.id
                  ? 'border-cyan-300/70 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(103,232,249,0.35)]'
                  : theme === 'dark'
                    ? 'border-white/10'
                    : 'border-slate-200 bg-white'
              }`}
            >
              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingText}
                    onChange={(event) => setEditingText(event.target.value)}
                    className={`min-h-[84px] w-full resize-none rounded-lg border bg-transparent px-2 py-1.5 text-sm outline-none ${theme === 'dark' ? 'border-white/15 text-slate-200' : 'border-slate-200 text-slate-800'}`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${theme === 'dark' ? 'border-cyan-300/60 text-cyan-200' : 'border-cyan-500/30 text-cyan-900'}`}
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${theme === 'dark' ? 'border-white/25 text-slate-300' : 'border-slate-300 text-slate-700'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className={`whitespace-pre-wrap text-sm ${textClasses}`}>
                    {note.text}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] ${mutedTextClasses}`}>
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(note)}
                        className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${theme === 'dark' ? 'border-white/25 text-slate-200' : 'border-slate-300 text-slate-700'}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${theme === 'dark' ? 'border-rose-300/50 text-rose-200' : 'border-rose-300 text-rose-700'}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      </div>

      <p className={`mt-3 text-xs ${mutedTextClasses}`}>
        Auto-saved per selected date or range.
      </p>
    </div>
  );
}
