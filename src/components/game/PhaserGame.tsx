"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import Phaser from "phaser";
import { CombatScene, type CombatBridge } from "@/game/scenes/CombatScene";
import { GAME } from "@/game/config";
import { sfx } from "@/game/audio";
import { useGameStore } from "@/store/gameStore";
import type { CombatStats } from "@/types/game";

function makeBridge(
  combatRef: MutableRefObject<CombatStats>,
  phaseRef: MutableRefObject<string>,
  sceneRef: MutableRefObject<CombatScene | null>,
): CombatBridge {
  return {
    getCombat: () => combatRef.current,
    onHud: (hud) => useGameStore.getState().setHud(hud),
    onWaveComplete: () => useGameStore.getState().beginChallenge(),
    onPlayerDeath: () => {
      const scene = sceneRef.current;
      const store = useGameStore.getState();
      store.setHud({ hp: 0 });
      store.syncRunStats({
        kills: scene?.kills ?? store.run.kills,
        survivalSeconds: Math.floor(
          scene?.survivalSeconds ?? store.run.survivalSeconds,
        ),
        level: scene?.level ?? store.run.level,
        xpCollected: scene?.xp ?? store.run.xpCollected,
      });
      store.endRun("death");
    },
    onRunTick: (seconds, kills, level, xp) => {
      const store = useGameStore.getState();
      if (store.phase !== "combat") return;
      store.syncRunStats({
        survivalSeconds: seconds,
        kills,
        level,
        xpCollected: xp,
      });
    },
    isPausedByUi: () => phaseRef.current !== "combat",
  };
}

export function PhaserGame() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<CombatScene | null>(null);
  const lastResumeRef = useRef(0);

  const phase = useGameStore((s) => s.phase);
  const bridgeVersion = useGameStore((s) => s.bridgeVersion);
  const combat = useGameStore((s) => s.combat);

  const combatRef = useRef(combat);
  const phaseRef = useRef(phase);
  combatRef.current = combat;
  phaseRef.current = phase;

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;

    const bridge = makeBridge(combatRef, phaseRef, sceneRef);
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: GAME.width,
      height: GAME.height,
      backgroundColor: "#070b16",
      physics: {
        default: "arcade",
        arcade: { debug: false },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME.width,
        height: GAME.height,
      },
      scene: [],
      input: { activePointers: 2 },
      render: { antialias: true, roundPixels: true },
    });

    game.scene.add("CombatScene", CombatScene, true, { bridge });
    gameRef.current = game;
    const grab = () => {
      sceneRef.current = game.scene.getScene("CombatScene") as CombatScene;
    };
    game.events.once("ready", grab);
    setTimeout(grab, 80);

    return () => {
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const game = gameRef.current;
    if (!game || phase !== "combat") return;

    const store = useGameStore.getState();
    const freshRun = store.run.wave === 1 && store.run.kills === 0;

    if (freshRun) {
      const bridge = makeBridge(combatRef, phaseRef, sceneRef);
      game.scene.stop("CombatScene");
      game.scene.start("CombatScene", { bridge });
      setTimeout(() => {
        sceneRef.current = game.scene.getScene("CombatScene") as CombatScene;
      }, 40);
      lastResumeRef.current = bridgeVersion;
      return;
    }

    if (lastResumeRef.current === bridgeVersion) return;
    lastResumeRef.current = bridgeVersion;

    const scene = game.scene.getScene("CombatScene") as CombatScene;
    sceneRef.current = scene;
    if (!scene?.sys) return;
    scene.syncFromStore(store.run.wave);
    scene.events.emit("resume-combat");
    if (store.lastAnswerCorrect) {
      scene.events.emit("apply-slowmo");
      sfx.upgrade();
    }
  }, [phase, bridgeVersion]);

  return (
    <div
      ref={hostRef}
      className="phaser-host h-full w-full overflow-hidden bg-[#070b16] sm:rounded-2xl"
    />
  );
}
