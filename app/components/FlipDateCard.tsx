'use client';

import { useEffect, useRef, useState } from 'react';

interface FlipDateCardProps {
  value: string;
  theme: 'light' | 'dark';
}

const FLIP_DURATION = 620;

export default function FlipDateCard({ value, theme }: FlipDateCardProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [nextValue, setNextValue] = useState(value);
  const [flipBusy, setFlipBusy] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const triggerFlip = (newDate: string) => {
    if (!stageRef.current || flipBusy) return;
    if (newDate === currentValue) return;

    setFlipBusy(true);
    setNextValue(newDate);

    const flap = document.createElement('div');
    flap.className = 'desk-flip-flap';
    flap.innerHTML = `<div class="front">${currentValue}</div><div class="back">${newDate}</div>`;
    stageRef.current.appendChild(flap);

    requestAnimationFrame(() => {
      flap.classList.add('flip-up');
    });

    setTimeout(() => {
      flap.remove();
      setCurrentValue(newDate);
      setNextValue(newDate);
      setFlipBusy(false);
    }, FLIP_DURATION);
  };

  useEffect(() => {
    triggerFlip(value);
    // The flip sequence is intentionally controlled by triggerFlip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="desk-flip-calendar" aria-label="Flipping date display">
      <div className={`desk-spiral ${theme === 'dark' ? 'is-dark' : ''}`} aria-hidden="true" />

      <div className="desk-stage" ref={stageRef}>
        <div className={`desk-date-card desk-base-next ${theme === 'dark' ? 'is-dark' : ''}`}>{nextValue}</div>
        <div className={`desk-date-card desk-base-current ${theme === 'dark' ? 'is-dark' : ''}`}>{currentValue}</div>
      </div>
    </div>
  );
}
