"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameHUD } from "@/components/game/GameHUD";
import { LearningModal } from "@/components/game/LearningModal";
import { LevelUpModal } from "@/components/game/LevelUpModal";
import { OnboardingModal } from "@/components/game/OnboardingModal";
import { VirtualJoystick } from "@/components/game/VirtualJoystick";
import { ENVIRONMENTS } from "@/data/environments";
import { GameEngine, type EngineSnapshot } from "@/game/engine";
import { drawGame, invalidateRendererCaches } from "@/game/renderer";
import type { DisciplineId, EnvironmentId, UpgradeId } from "@/game/types";
import { loadProgress, markTutorialSeen, recordRun } from "@/lib/storage";

interface Props {
  environmentId?: EnvironmentId;
}

function cloneSnap(s: EngineSnapshot): EngineSnapshot {
  // Entity arrays stay shared — React HUD never mutates them.
  // Copy only values React overlays may treat as discrete UI state.
  return {
    ...s,
    skills: s.skills.map((sk) => ({ ...sk })),
    upgrades: s.upgrades.map((u) => ({ ...u })),
    levelChoices: s.levelChoices.map((c) => ({ ...c })),
    summary: s.summary ? { ...s.summary } : null,
  };
}

export function GameArena({ environmentId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const joyRef = useRef({ x: 0, y: 0, active: false });
  const learnOpenRef = useRef(false);
  const recordedRef = useRef(false);
  const pausedRef = useRef(false);
  const runKeyRef = useRef(0);
  const [runKey, setRunKey] = useState(0);
  const [snap, setSnap] = useState<EngineSnapshot | null>(null);
  const [showLearn, setShowLearn] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [disciplines, setDisciplines] = useState<DisciplineId[]>(["sales"]);
  const masteredRef = useRef<string[]>([]);

  const resolveEnv = useCallback(() => {
    const progress = loadProgress();
    return environmentId && progress.unlockedEnvironments.includes(environmentId)
      ? environmentId
      : (progress.unlockedEnvironments[0] ?? "networking");
  }, [environmentId]);

  useEffect(() => {
    const progress = loadProgress();
    setDisciplines(progress.unlockedDisciplines);
    const needsTutorial = !progress.hasSeenTutorial;
    setShowTutorial(needsTutorial);
    pausedRef.current = needsTutorial;

    const env = resolveEnv();
    const engine = new GameEngine(env);
    engineRef.current = engine;
    recordedRef.current = false;
    learnOpenRef.current = false;
    masteredRef.current = [];
    setShowLearn(false);

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let resizedOnce = false;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      invalidateRendererCaches();
      // Only recenter on the first layout; later resizes keep position.
      if (!resizedOnce) {
        engine.resize(rect.width, rect.height);
        resizedOnce = true;
      } else {
        engine.width = rect.width;
        engine.height = rect.height;
        engine.player.x = Math.min(Math.max(18, engine.player.x), rect.width - 18);
        engine.player.y = Math.min(Math.max(18, engine.player.y), rect.height - 18);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = performance.now();
    let time = 0;
    let hudAcc = 0;
    let lastStatus = "";
    let lastSkillSig = "";
    let running = true;

    const paint = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      // Tutorial / full pause: no sim, no canvas churn
      if (pausedRef.current) {
        hudAcc += dt;
        if (hudAcc >= 0.5) {
          hudAcc = 0;
          setSnap(cloneSnap(engine.snapshot()));
        }
        return;
      }

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
      drawGame(ctx, s, engine.width, engine.height, time);

      hudAcc += dt;
      const skillSig = s.skills.map((sk) => `${sk.id}:${sk.level}`).join("|");
      const statusChanged = s.status !== lastStatus;
      const skillsChanged = skillSig !== lastSkillSig;
      const needsImmediate =
        statusChanged ||
        skillsChanged ||
        s.status === "levelUp" ||
        s.status === "waveClear" ||
        s.status === "defeat" ||
        s.status === "victory";

      if (needsImmediate || hudAcc >= 0.1) {
        hudAcc = 0;
        lastStatus = s.status;
        lastSkillSig = skillSig;
        setSnap(cloneSnap(s));
      }

      if (s.status === "waveClear" && !learnOpenRef.current) {
        learnOpenRef.current = true;
        setShowLearn(true);
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      if (document.hidden) {
        raf = 0;
        return;
      }
      paint(now);
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        engine.setMove(0, 0);
        return;
      }
      last = performance.now();
      if (!raf && running) raf = requestAnimationFrame(loop);
    };

    // Initial paint (covers tutorial-paused canvas under the modal)
    drawGame(ctx, engine.snapshot(), engine.width, engine.height, 0);
    setSnap(cloneSnap(engine.snapshot()));
    raf = requestAnimationFrame(loop);

    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
    };
    const up = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [environmentId, resolveEnv, runKey]);

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
      if (scenarioId && !masteredRef.current.includes(scenarioId)) {
        masteredRef.current = [...masteredRef.current, scenarioId];
      }
    }
    learnOpenRef.current = false;
    setShowLearn(false);
    engineRef.current?.beginNextWave();
  };

  const onTutorialDone = () => {
    markTutorialSeen();
    setShowTutorial(false);
    pausedRef.current = false;
    // Kick the canvas immediately so the room appears under the dismissed modal.
    const engine = engineRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (engine && ctx) {
      drawGame(ctx, engine.snapshot(), engine.width, engine.height, 0);
      setSnap(cloneSnap(engine.snapshot()));
    }
  };

  const playAgain = () => {
    runKeyRef.current += 1;
    setRunKey(runKeyRef.current);
    setSnap(null);
  };

  return (
    <div className="arena" ref={wrapRef}>
      <canvas ref={canvasRef} className="arena-canvas" />

      {snap && <GameHUD snap={snap} />}

      {!showTutorial && <VirtualJoystick onMove={onJoystick} />}

      {showTutorial && <OnboardingModal onDone={onTutorialDone} />}

      {snap?.status === "levelUp" && !showTutorial && (
        <LevelUpModal
          level={snap.level}
          choices={snap.levelChoices}
          onChoose={onChooseLevel}
        />
      )}

      {showLearn && snap && !showTutorial && (
        <LearningModal
          wave={snap.wave}
          unlockedDisciplines={disciplines}
          onComplete={onLearnComplete}
        />
      )}

      {(snap?.status === "defeat" || snap?.status === "victory") &&
        snap.summary &&
        !showTutorial && (
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
                <button type="button" className="btn btn-primary" onClick={playAgain}>
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
