"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GameHUD } from "@/components/game/GameHUD";
import { LearningModal } from "@/components/game/LearningModal";
import { LevelUpModal } from "@/components/game/LevelUpModal";
import { VirtualJoystick } from "@/components/game/VirtualJoystick";
import { ENVIRONMENTS } from "@/data/environments";
import { GameEngine, type EngineSnapshot } from "@/game/engine";
import { drawGame } from "@/game/renderer";
import type { DisciplineId, EnvironmentId, UpgradeId } from "@/game/types";
import { loadProgress, recordRun } from "@/lib/storage";

interface Props {
  environmentId?: EnvironmentId;
}

export function GameArena({ environmentId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const joyRef = useRef({ x: 0, y: 0, active: false });
  const learnOpenRef = useRef(false);
  const recordedRef = useRef(false);
  const [snap, setSnap] = useState<EngineSnapshot | null>(null);
  const [showLearn, setShowLearn] = useState(false);
  const [disciplines, setDisciplines] = useState<DisciplineId[]>(["sales"]);
  const masteredRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const progress = loadProgress();
    setDisciplines(progress.unlockedDisciplines);
    const env =
      environmentId && progress.unlockedEnvironments.includes(environmentId)
        ? environmentId
        : (progress.unlockedEnvironments[0] ?? "networking");

    const engine = new GameEngine(env);
    engineRef.current = engine;
    recordedRef.current = false;
    learnOpenRef.current = false;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      engine.resize(rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = performance.now();
    let time = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      time += dt;

      const keys = keysRef.current;
      let mx = 0;
      let my = 0;
      if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) mx -= 1;
      if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) mx += 1;
      if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) my -= 1;
      if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) my += 1;

      if (joyRef.current.active) {
        engine.setMove(joyRef.current.x, joyRef.current.y);
      } else {
        engine.setMove(mx, my);
      }

      engine.update(dt);
      const s = engine.snapshot();
      setSnap({
        ...s,
        obstacles: [...s.obstacles],
        projectiles: [...s.projectiles],
        pickups: [...s.pickups],
        transforms: [...s.transforms],
        floats: [...s.floats],
        skills: s.skills.map((sk) => ({ ...sk })),
        upgrades: s.upgrades.map((u) => ({ ...u })),
        levelChoices: [...s.levelChoices],
      });
      drawGame(ctx, s, engine.width, engine.height, time);

      if (s.status === "waveClear" && !learnOpenRef.current) {
        learnOpenRef.current = true;
        setShowLearn(true);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [environmentId]);

  useEffect(() => {
    if (!snap?.summary) return;
    if (snap.status !== "defeat" && snap.status !== "victory") return;
    if (recordedRef.current) return;
    recordedRef.current = true;
    recordRun(snap.summary, masteredRef.current);
  }, [snap?.summary, snap?.status]);

  const onJoystick = (x: number, y: number) => {
    const active = Math.abs(x) > 0.02 || Math.abs(y) > 0.02;
    joyRef.current = { x, y, active };
  };

  const onChooseLevel = (index: number) => {
    engineRef.current?.chooseLevelOption(index);
  };

  const onLearnComplete = (
    correct: boolean,
    upgradeId?: UpgradeId,
    scenarioId?: string,
  ) => {
    if (correct && upgradeId) {
      engineRef.current?.applyLearningReward(upgradeId);
      masteredRef.current = scenarioId;
    }
    learnOpenRef.current = false;
    setShowLearn(false);
    engineRef.current?.beginNextWave();
  };

  return (
    <div className="arena" ref={wrapRef}>
      <canvas ref={canvasRef} className="arena-canvas" />

      {snap && <GameHUD snap={snap} />}

      <VirtualJoystick onMove={onJoystick} />

      {snap?.status === "levelUp" && (
        <LevelUpModal
          level={snap.level}
          choices={snap.levelChoices}
          onChoose={onChooseLevel}
        />
      )}

      {showLearn && snap && (
        <LearningModal
          wave={snap.wave}
          unlockedDisciplines={disciplines}
          onComplete={onLearnComplete}
        />
      )}

      {(snap?.status === "defeat" || snap?.status === "victory") &&
        snap.summary && (
          <div className="overlay animate-fade-in">
            <div className="panel animate-scale-in">
              <p className="eyebrow">
                {snap.status === "victory"
                  ? "Masterful run"
                  : "Conversation ended"}
              </p>
              <h2 className="panel-title">
                {snap.status === "victory"
                  ? "You held the room"
                  : "Composure spent"}
              </h2>
              <ul className="summary-list">
                <li>
                  <span>Wave</span>
                  <strong>{snap.summary.wave}</strong>
                </li>
                <li>
                  <span>Level</span>
                  <strong>{snap.summary.level}</strong>
                </li>
                <li>
                  <span>Confidence</span>
                  <strong>{snap.summary.confidence}</strong>
                </li>
                <li>
                  <span>Transformed</span>
                  <strong>{snap.summary.transformed}</strong>
                </li>
                <li>
                  <span>Setting</span>
                  <strong>
                    {
                      ENVIRONMENTS.find(
                        (e) => e.id === snap.summary!.environment,
                      )?.name
                    }
                  </strong>
                </li>
              </ul>
              <div className="panel-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Play again
                </button>
                <Link href="/" className="btn btn-ghost">
                  Home
                </Link>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
