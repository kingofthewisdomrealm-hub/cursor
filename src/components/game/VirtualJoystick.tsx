"use client";

import { useRef } from "react";

interface Props {
  onMove: (x: number, y: number) => void;
}

export function VirtualJoystick({ onMove }: Props) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);

  const setKnobTransform = (x: number, y: number) => {
    const knob = knobRef.current;
    if (knob) knob.style.transform = `translate(${x}px, ${y}px)`;
  };

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
    setKnobTransform(dx, dy);
    onMove(dx / max, dy / max);
  };

  const end = () => {
    activeRef.current = false;
    knobRef.current?.classList.remove("is-active");
    setKnobTransform(0, 0);
    onMove(0, 0);
  };

  return (
    <div
      ref={baseRef}
      className="joystick"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        activeRef.current = true;
        knobRef.current?.classList.add("is-active");
        updateFromPoint(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!activeRef.current) return;
        updateFromPoint(e.clientX, e.clientY);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      role="presentation"
      aria-hidden
    >
      <div ref={knobRef} className="joystick-knob" />
    </div>
  );
}
