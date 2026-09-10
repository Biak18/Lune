#!/usr/bin/env node
/**
 * cart-glide — the loading-button animation ("your order is on its way").
 *
 * A line-art cart glides start-to-end across a 132x32 stage with a gentle
 * rolling bob and two fading speed streaks behind it. It fades out at the
 * right edge and re-enters at the left, so the 1.2 s loop is seamless.
 * Strokes are baked in paper (#FAF4EC) for ink (primary) buttons; the app
 * recolors via Lottie colorFilters for other variants.
 *
 * Run:
 *   QODER_LOTTIE_RUNTIME=<plugin>/scripts/runtime.mjs node motion/cart-glide.motion.mjs motion/cart-glide.motion.json
 *   node <plugin>/scripts/qoder-lottie.mjs create motion/cart-glide.motion.json \
 *     --out motion/cart-glide --width 132 --height 32 --fps 30
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const runtimeModule = process.env.QODER_LOTTIE_RUNTIME
  ? pathToFileURL(path.resolve(process.env.QODER_LOTTIE_RUNTIME)).href
  : '@ali/qoder-lottie/agent';
const { motionV3 } = await import(runtimeModule);

const PAPER = '#FAF4EC';
const stroke = (key) => ({ key, color: PAPER, width: 1.8, cap: 'round', join: 'round' });

/** Closed circle from two SVG endpoint arcs. */
const circle = (cx, cy, r) => ({
  type: 'commands',
  commands: [
    { op: 'M', to: [cx + r, cy] },
    { op: 'A', radius: [r, r], rotation: 0, largeArc: false, sweep: true, to: [cx - r, cy] },
    { op: 'A', radius: [r, r], rotation: 0, largeArc: false, sweep: true, to: [cx + r, cy] },
    { op: 'Z' },
  ],
});

/** Handle + basket as one open contour, facing right. */
const framePath = {
  type: 'commands',
  commands: [
    { op: 'M', to: [-10, -11] },
    { op: 'L', to: [-8, -7] },
    { op: 'L', to: [9, -7] },
    { op: 'L', to: [6.5, 2] },
    { op: 'L', to: [-5.5, 2] },
    { op: 'L', to: [-8, -7] },
  ],
};

const streakA = { type: 'commands', commands: [{ op: 'M', to: [-15, -2] }, { op: 'L', to: [-10, -2] }] };
const streakB = { type: 'commands', commands: [{ op: 'M', to: [-19, 2] }, { op: 'L', to: [-13, 2] }] };

const source = motionV3('cart-glide')
  .duration(1200)
  .attach('cart-glide')
  .loop({ fromMs: 0, toMs: 1200, seam: 'match', targets: ['cart', 'cart.body', 'cart.streak-a', 'cart.streak-b'] })
  .compose((scene) => {
    // Travel: left edge -> right edge with an ease-in-out glide, then an
    // invisible teleport back while fully faded (the 200 ms gap is the breath
    // between passes). End state equals start state, so the loop is seamless.
    scene.group('cart', { position: [66, 16] });
    scene.track('cart.travel', 'cart', 'transform.position')
      .to([118, 16], 1000, 'ease-in-out', [14, 16])
      .to([14, 16], 200, 'linear');
    scene.track('cart.fade', 'cart', 'transform.opacity')
      .to(100, 120, 'ease-out', 0)
      .hold(760, 100)
      .to(0, 120, 'ease-in')
      .hold(200, 0);

    // Cart body: two gentle dips over the glide (wheels rolling over seams),
    // resting once the glide ends.
    scene.shape('cart.body', (shape) => shape
      .object('cart.frame', (object) => object.path('cart.frame.path', framePath).stroke(stroke('cart.frame.stroke')))
      .object('cart.wheel-l', (object) => object.path('cart.wheel-l.path', circle(-3.5, 6.5, 2.75)).stroke({ ...stroke('cart.wheel-l.stroke'), width: 1.6 }))
      .object('cart.wheel-r', (object) => object.path('cart.wheel-r.path', circle(5, 6.5, 2.75)).stroke({ ...stroke('cart.wheel-r.stroke'), width: 1.6 })), { parent: 'cart' });
    scene.track('cart.bob', 'cart.body', 'transform.position')
      // alternate occupies twice the segment duration: 2 counts = 2 full dips = 1000 ms.
      .repeat(2, 'alternate', { durationMs: 250, from: [0, 0], to: [0, 1.5], easing: 'ease-in-out' });

    // Speed streaks trailing behind the cart, flickering in sequence and only
    // while the cart is mid-glide.
    scene.shape('cart.streak-a', (shape) => shape
      .object('cart.streak-a.line', (object) => object.path('cart.streak-a.path', streakA).stroke({ ...stroke('cart.streak-a.stroke'), width: 1.4 })), { parent: 'cart' });
    scene.track('cart.streak-a.flicker', 'cart.streak-a', 'transform.opacity')
      .hold(140, 0)
      .to(85, 130, 'ease-out')
      .to(0, 130, 'ease-in')
      .hold(800, 0);
    scene.shape('cart.streak-b', (shape) => shape
      .object('cart.streak-b.line', (object) => object.path('cart.streak-b.path', streakB).stroke({ ...stroke('cart.streak-b.stroke'), width: 1.4 })), { parent: 'cart' });
    scene.track('cart.streak-b.flicker', 'cart.streak-b', 'transform.opacity')
      .hold(240, 0)
      .to(70, 130, 'ease-out')
      .to(0, 130, 'ease-in')
      .hold(700, 0);
  });

const outputPath = path.resolve(process.argv[2] ?? 'motion/cart-glide.motion.json');
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(source.program(), null, 2)}\n`);
console.log(JSON.stringify({ status: 'compiled', outputPath, name: source.name }, null, 2));
