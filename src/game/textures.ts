import type Phaser from "phaser";

function circleTexture(
  scene: Phaser.Scene,
  key: string,
  radius: number,
  fill: number,
  stroke?: number,
) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  const size = radius * 2 + 4;
  g.fillStyle(fill, 1);
  g.fillCircle(size / 2, size / 2, radius);
  if (stroke !== undefined) {
    g.lineStyle(2, stroke, 1);
    g.strokeCircle(size / 2, size / 2, radius);
  }
  g.generateTexture(key, size, size);
  g.destroy();
}

function rectTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  fill: number,
) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(fill, 1);
  g.fillRoundedRect(0, 0, w, h, 2);
  g.generateTexture(key, w, h);
  g.destroy();
}

export function ensureTextures(scene: Phaser.Scene) {
  circleTexture(scene, "player", 12, 0x39f3ff, 0xffffff);
  circleTexture(scene, "survivor", 9, 0xffd166, 0xffffff);
  circleTexture(scene, "walker", 10, 0x6a994e);
  circleTexture(scene, "runner", 8, 0xe9c46a);
  circleTexture(scene, "tank", 16, 0x577590);
  circleTexture(scene, "exploder", 11, 0xf4a261);
  circleTexture(scene, "spitter", 11, 0x9b5de5);
  circleTexture(scene, "boss", 28, 0xff006e, 0xffd166);
  circleTexture(scene, "xp", 5, 0x7dffb3);
  circleTexture(scene, "drone", 7, 0x52b788, 0xffffff);
  circleTexture(scene, "spit", 6, 0xc77dff);
  circleTexture(scene, "grenade", 6, 0x80ed99);
  rectTexture(scene, "bullet", 6, 10, 0xffffff);
  rectTexture(scene, "flame", 10, 14, 0xff6b35);
  rectTexture(scene, "sniper_bullet", 4, 16, 0x4cc9f0);
  rectTexture(scene, "pellet", 5, 5, 0xff9f1c);

  if (!scene.textures.exists("city_tile")) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x0b1020, 1);
    g.fillRect(0, 0, 64, 64);
    g.lineStyle(1, 0x1a2744, 0.9);
    g.strokeRect(0, 0, 64, 64);
    g.fillStyle(0x152238, 0.8);
    g.fillRect(8, 8, 18, 18);
    g.fillRect(36, 30, 20, 24);
    g.fillStyle(0x2a1f4d, 0.55);
    g.fillRect(20, 40, 14, 10);
    g.generateTexture("city_tile", 64, 64);
    g.destroy();
  }
}
