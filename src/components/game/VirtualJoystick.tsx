"use client";

import { useRef, useState } from "react";

interface Props {
  onMove: (x: number, y: number) => void;
}

export function VirtualJoystick({ onMove }: Props) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const updateFromPoint = (clientX: number, clientY: number) => {
    const el = baseRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const max = rect.width / 2 - 18;
    const len = Math.hypot(dx, dy) || 1;
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    setKnob({ x: dx, y: dy });
    onMove(dx / max, dy / max);
  };

  const end = () => {
    setActive(false);
    setKnob({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div
      ref={baseRef}
      className="joystick"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setActive(true);
        updateFromPoint(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!active && !(e.buttons & 1)) return;
        updateFromPoint(e.clientX, e.clientY);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      role="presentation"
      aria-hidden
    >
      <div
        className={`joystick-knob ${active ? "is-active" : ""}`}
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  );
}
