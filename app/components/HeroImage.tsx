'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface HeroImageProps {
  currentDate: Date;
}

const monthlyImageSets = [
  [
    'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1453306458620-5bbef13a5bca?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=1600&h=800&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1516224498413-84ecf3a1e7fd?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1513569771920-c9e1d31714af?w=1600&h=800&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1451256657534-b1de1c8a9424?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1600&h=800&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1526579080668-7ff64f414a7d?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1600&h=800&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&h=800&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1430285561322-7808604715df?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1433832597046-4f10e10ac764?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1600&h=800&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1600&h=800&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=800&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1600&h=800&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1600&h=800&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1419833479618-c595710968e0?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=800&fit=crop',
  ],
  [
    'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=1600&h=800&fit=crop',
  ],
];

const monthMoodLabels = [
  'Winter Stillness',
  'Snowlight Calm',
  'Early Bloom',
  'Fresh Green',
  'High Meadow',
  'Warm Horizon',
  'Ocean Escape',
  'Blue Skies',
  'Golden Drift',
  'Amber Forest',
  'Quiet Peaks',
  'Festive Glow',
];

const monthMoodStyles = [
  { background: 'rgba(31, 41, 55, 0.54)', border: '1px solid rgba(191, 219, 254, 0.45)' },
  { background: 'rgba(30, 58, 138, 0.52)', border: '1px solid rgba(147, 197, 253, 0.45)' },
  { background: 'rgba(6, 78, 59, 0.52)', border: '1px solid rgba(110, 231, 183, 0.45)' },
  { background: 'rgba(21, 128, 61, 0.52)', border: '1px solid rgba(134, 239, 172, 0.45)' },
  { background: 'rgba(101, 67, 33, 0.52)', border: '1px solid rgba(253, 224, 71, 0.45)' },
  { background: 'rgba(8, 47, 73, 0.52)', border: '1px solid rgba(125, 211, 252, 0.45)' },
  { background: 'rgba(8, 47, 73, 0.58)', border: '1px solid rgba(103, 232, 249, 0.45)' },
  { background: 'rgba(30, 64, 175, 0.55)', border: '1px solid rgba(147, 197, 253, 0.45)' },
  { background: 'rgba(120, 53, 15, 0.54)', border: '1px solid rgba(253, 186, 116, 0.45)' },
  { background: 'rgba(146, 64, 14, 0.55)', border: '1px solid rgba(252, 211, 77, 0.45)' },
  { background: 'rgba(71, 85, 105, 0.58)', border: '1px solid rgba(203, 213, 225, 0.45)' },
  { background: 'rgba(127, 29, 29, 0.58)', border: '1px solid rgba(254, 202, 202, 0.48)' },
];

export default function HeroImage({ currentDate }: HeroImageProps) {
  const [variantIndex, setVariantIndex] = useState(0);
  const [activeSrc, setActiveSrc] = useState(monthlyImageSets[currentDate.getMonth()]?.[0] ?? monthlyImageSets[0][0]);
  const [nextSrc, setNextSrc] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const monthMood = monthMoodLabels[currentDate.getMonth()] ?? monthMoodLabels[0];
  const monthMoodStyle = monthMoodStyles[currentDate.getMonth()] ?? monthMoodStyles[0];
  const monthSet = useMemo(() => monthlyImageSets[currentDate.getMonth()] ?? monthlyImageSets[0], [currentDate]);

  const transitionTo = (targetSrc: string) => {
    if (!targetSrc || targetSrc === activeSrc) {
      return;
    }

    setNextSrc(targetSrc);
    setIsFading(true);

    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }

    fadeTimeoutRef.current = setTimeout(() => {
      setActiveSrc(targetSrc);
      setNextSrc(null);
      setIsFading(false);
    }, 340);
  };

  useEffect(() => {
    setVariantIndex(0);
    transitionTo(monthSet[0]);
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [monthSet]);

  const rotateImage = () => {
    const nextIndex = (variantIndex + 1) % monthSet.length;
    setVariantIndex(nextIndex);
    transitionTo(monthSet[nextIndex]);
  };

  return (
    <div className="relative h-28 overflow-hidden bg-slate-200 md:h-36 lg:h-40">
      <div className="hero-parallax-inner absolute inset-0">
        <img
          src={activeSrc}
          alt={`${monthName} wallpaper`}
          className={`h-full w-full object-cover transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}
          onError={(event) => {
            event.currentTarget.src = monthlyImageSets[0][0];
          }}
        />

        {nextSrc && (
          <img
            src={nextSrc}
            alt={`${monthName} wallpaper transition`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              isFading ? 'opacity-100' : 'opacity-0'
            }`}
            onError={(event) => {
              event.currentTarget.src = monthlyImageSets[0][0];
            }}
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-slate-900/10" />

      <div className="absolute bottom-0 left-0 h-20 w-1/3 bg-cyan-600/92" style={{ clipPath: 'polygon(0 35%, 100% 100%, 0 100%)' }} />

      <div
        className="absolute inset-x-0 bottom-0 h-24 bg-white"
        style={{ clipPath: 'polygon(0 62%, 20% 90%, 50% 62%, 80% 92%, 100% 66%, 100% 100%, 0 100%)' }}
      />

      <div
        className="absolute bottom-0 right-0 h-28 w-56 bg-cyan-600/95"
        style={{ clipPath: 'polygon(22% 22%, 100% 0, 100% 100%, 0 100%)' }}
      />

      <div className="absolute bottom-6 right-6 text-right text-white">
        <p className="text-sm tracking-[0.22em] opacity-90">{currentDate.getFullYear()}</p>
        <p className="text-3xl font-semibold tracking-wide">{monthName}</p>
      </div>

      <div
        className="absolute bottom-6 left-6 rounded-full px-3 py-1 text-xs font-semibold tracking-[0.12em] text-white backdrop-blur"
        style={monthMoodStyle}
      >
        {monthMood}
      </div>

      <button
        onClick={rotateImage}
        className="absolute right-4 top-4 rounded-full border border-white/50 bg-slate-900/40 px-3 py-1 text-xs font-medium text-white backdrop-blur transition hover:bg-slate-900/70"
      >
        Rotate
      </button>
    </div>
  );
}
