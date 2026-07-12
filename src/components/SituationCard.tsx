import { useRef, useState, useCallback, useEffect } from 'react';
import type { Situation } from '../data/situations';
import type { Answer } from '../data/situations';

interface SituationCardProps {
  situation: Situation;
  anim: 'idle' | 'fly-off' | 'shake';
  locked: boolean;
  onAnswer: (choice: Answer) => void;
}

export default function SituationCard({
  situation,
  anim,
  locked,
  onAnswer,
}: SituationCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const offset = useRef({ x: 0, y: 0 });

  const getZoneAt = useCallback((x: number, y: number): Answer | null => {
    const zones = document.querySelectorAll<HTMLElement>('[data-drop-zone]');
    for (const zone of zones) {
      const rect = zone.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return zone.dataset.dropZone as Answer;
      }
    }
    return null;
  }, []);

  const highlightZone = useCallback((answer: Answer | null) => {
    document.querySelectorAll('[data-drop-zone]').forEach((z) => {
      z.classList.remove('zone-active');
    });
    if (answer) {
      document
        .querySelector(`[data-drop-zone="${answer}"]`)
        ?.classList.add('zone-active');
    }
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (locked) return;
    const rect = cardRef.current!.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
    setGhostPos({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setGhostPos({ x: e.clientX, y: e.clientY });
    highlightZone(getZoneAt(e.clientX, e.clientY));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    const zone = getZoneAt(e.clientX, e.clientY);
    highlightZone(null);
    setDragging(false);
    setGhostPos(null);
    if (zone) onAnswer(zone);
  };

  useEffect(() => {
    if (!dragging) highlightZone(null);
  }, [dragging, highlightZone]);

  const animClass =
    anim === 'fly-off' ? 'animate-fly-off' : anim === 'shake' ? 'animate-shake' : '';

  return (
    <>
      <div className="relative mx-auto h-[190px] w-full max-w-[360px]">
        <div
          ref={cardRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`absolute inset-x-0 top-0 cursor-grab rounded-2xl border-[3px] border-[var(--color-yellow)] bg-white p-5 shadow-2xl select-none touch-none active:cursor-grabbing ${animClass} ${
            dragging ? 'opacity-30' : 'opacity-100'
          }`}
          style={{ transition: dragging ? 'none' : undefined }}
        >
          <div className="text-3xl">{situation.emoji}</div>
          <p className="mt-2 text-base leading-snug font-semibold text-[#0f0720]">
            {situation.text}
          </p>
          <p className="mt-3 text-center text-xs text-gray-400">👆 Drag or tap below</p>
        </div>
      </div>

      {dragging && ghostPos && (
        <div
          className="pointer-events-none fixed z-[999] w-[min(360px,calc(100vw-2rem))] rotate-2 rounded-2xl border-[3px] border-cyan-400 bg-white p-5 shadow-2xl"
          style={{
            left: ghostPos.x - offset.current.x,
            top: ghostPos.y - offset.current.y,
          }}
        >
          <div className="text-3xl">{situation.emoji}</div>
          <p className="mt-2 text-base leading-snug font-semibold text-[#0f0720]">
            {situation.text}
          </p>
        </div>
      )}
    </>
  );
}
