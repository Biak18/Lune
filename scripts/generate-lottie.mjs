#!/usr/bin/env node
/**
 * Lottie asset generator — "The Atelier" line-art motion language.
 *
 * Builds the three brand animations as Bodymovin JSON programmatically so the
 * geometry stays reviewable and reproducible (never hand-edited output):
 *
 *   assets/lottie/dress-sketch.json  — home hero: ink line-art dress on a
 *                                      hanger, draws itself then sways to rest
 *   assets/lottie/order-seal.json    — checkout success: ribbon bow + drawn
 *                                      checkmark + gold sparkles (plays once)
 *   assets/lottie/hanger-sway.json   — empty bag: hanger swaying, seamless loop
 *
 * Usage: node scripts/generate-lottie.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "assets", "lottie");

// Brand palette (mirrors src/design/colors.ts)
const INK = [0x2a / 255, 0x1b / 255, 0x16 / 255, 1];
const CLAY = [0xbc / 255, 0x45 / 255, 0x27 / 255, 1];
const GOLD = [0xe2 / 255, 0xa8 / 255, 0x56 / 255, 1];

const FPS = 30;

// ---------------------------------------------------------------------------
// Bodymovin helpers
// ---------------------------------------------------------------------------

// Easing presets. Bodymovin stores each segment's cubic-bezier timing on the
// keyframe that STARTS the segment: "o" is the out-control of that keyframe,
// "i" is the in-control of the next one. o.y=0 + i.y=1 is the classic
// ease-in-out; i.y>1 overshoots past the target then settles.
const EASE = {
  inOut: { o: { x: 0.33, y: 0 }, i: { x: 0.67, y: 1 } },
  out: { o: { x: 0.2, y: 0.8 }, i: { x: 0.3, y: 1 } },
  back: { o: { x: 0.25, y: 0 }, i: { x: 0.2, y: 1.6 } },
  linear: { o: { x: 0.167, y: 0.167 }, i: { x: 0.833, y: 0.833 } },
};

/** Static property value. */
const sv = (k) => ({ a: 0, k });

/**
 * Animated property. `keys` is a list of [frame, value] pairs; the easing of
 * each segment comes from `ease`. The final keyframe repeats the last value
 * so the property holds through the composition end.
 */
function av(keys, ease = EASE.inOut) {
  const segs = keys.map(([t, v]) => ({ t, v }));
  const k = segs.slice(0, -1).map((seg) => ({
    i: { x: [ease.i.x], y: [ease.i.y] },
    o: { x: [ease.o.x], y: [ease.o.y] },
    t: seg.t,
    s: [...seg.v],
  }));
  const last = segs[segs.length - 1];
  k.push({ t: last.t, s: [...last.v] });
  return { a: 1, k };
}

/** Open/closed bezier path from vertex + handle tables.
 * Handles are offsets relative to their vertex. Endpoint handles may be
 * passed as null — Bodymovin requires a value for every vertex, so nulls
 * are normalized to [0, 0] (a corner). */
function p(v, rawI, rawO, c = false) {
  const norm = (h) => h.map((pt) => pt ?? [0, 0]);
  return {
    ty: "sh",
    ind: 0,
    ks: sv({ i: norm(rawI), o: norm(rawO), v, c }),
  };
}

const stroke = (color, width) => ({
  ty: "st",
  c: sv(color),
  o: sv(100),
  w: sv(width),
  lc: 2, // round cap
  lj: 2, // round join
});

const fill = (color) => ({ ty: "fl", c: sv(color), o: sv(100) });

/** Trim-path modifier that draws the path on between two frames. */
const draw = (fromF, toF, ease = EASE.inOut) => ({
  ty: "tm",
  s: sv(0),
  e: av([[fromF, [0]], [toF, [100]]], ease),
  o: sv(0),
  m: 1,
});

/** Group with optional static/animated transform. */
function grp(name, items, tr = null) {
  const transform = tr ?? {
    ty: "tr",
    p: sv([0, 0]),
    a: sv([0, 0]),
    s: sv([100, 100]),
    r: sv(0),
    o: sv(100),
  };
  return { ty: "gr", nm: name, it: [...items, transform] };
}

/** Star (sparkle) shape, sy=1 star mode with inner radius. */
const star = (points, outerR, innerR, rotDeg) => ({
  ty: "sr",
  sy: 1,
  d: 1,
  pt: sv(points),
  p: sv([0, 0]),
  r: sv(rotDeg),
  ir: sv(innerR),
  or: sv(outerR),
  is: sv(0),
  os: sv(0),
});

const ellipse = (pos, size) => ({ ty: "el", p: sv(pos), s: sv(size) });

/** Shape layer rooted at `anchor` (rotation pivot). */
function layer(name, anchor, shapes, extra = {}) {
  return {
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: sv(100),
      r: extra.rotation ?? sv(0),
      p: sv([...anchor, 0]),
      a: sv([...anchor, 0]),
      s: sv([100, 100, 100]),
    },
    ao: 0,
    shapes,
    ip: 0,
    op: extra.op,
    st: 0,
    bm: 0,
  };
}

function composition(name, w, h, op, layers) {
  return {
    v: "5.9.0",
    fr: FPS,
    ip: 0,
    op,
    w,
    h,
    nm: name,
    ddd: 0,
    assets: [],
    layers,
  };
}

// ---------------------------------------------------------------------------
// Geometry — vertex (v), in-handle (i) and out-handle (o) tables.
// Handles are offsets relative to their vertex; in-handles point against the
// direction of travel, out-handles along it.
// ---------------------------------------------------------------------------

// Hanger (shared silhouette, 400px canvas scale)
const HOOK_400 = {
  v: [
    [200, 52],
    [211, 60],
    [207, 74],
    [200, 86],
  ],
  i: [null, [-1, -4], [3, -5], [2, -4]],
  o: [[7, 1], [1, 4], [-2, 4], null],
};
// Continuous: apex -> left end -> bowed bar -> right end -> apex
const ARMS_400 = {
  v: [
    [200, 88],
    [150, 120],
    [200, 126],
    [250, 120],
    [200, 88],
  ],
  i: [null, [7, -5], [-9, 0], [-7, 1], [7, 5]],
  o: [[-7, 5], [7, 1], [9, 0], [-7, -5], null],
};
// Dress outline drawn as one continuous stroke: left strap -> neckline scoop
// -> right strap -> right seam -> hem -> left seam -> back to neckline.
const DRESS_400 = {
  v: [
    [174, 124], // strap top L (touches the bar)
    [170, 150], // neckline corner L
    [200, 164], // scoop bottom
    [230, 150], // neckline corner R
    [234, 124], // strap top R
    [240, 196], // waist R
    [272, 318], // hem R
    [200, 326], // hem centre
    [128, 318], // hem L
    [160, 196], // waist L
    [170, 150], // underarm L (closes visually)
  ],
  i: [
    null,
    [0.5, -3],
    [-8, 0],
    [-3, 1.5],
    [-0.5, 3],
    [-0.6, -7],
    [-2, -8],
    [24, 0],
    [24, 1.5],
    [-2, 7],
    [-2, 8],
  ],
  o: [
    [0.5, 5],
    [3, 1.5],
    [8, 0],
    [0.5, -3],
    [0.5, 7],
    [2, 8],
    [-26, 1.5],
    [-24, 0],
    [2, -8],
    [2, -8],
    null,
  ],
};
const WAIST_400 = {
  v: [
    [168, 200],
    [200, 206],
    [234, 200],
  ],
  i: [null, [-10, -1], [-10, -2]],
  o: [[10, 2], [10, 1], null],
};

// Ribbon bow (400px canvas, sealed order composition). Teardrop loops with
// generous handles so the bow reads soft, not angular.
const LOOP_L = {
  v: [
    [200, 152],
    [162, 128],
    [142, 154],
    [184, 164],
  ],
  i: [null, [13, 8], [5, -6.5], [-10, -2.4]],
  o: [[-13, -8], [-5, 6.5], [10, 2.4], null],
};
const LOOP_R = {
  v: [
    [200, 152],
    [238, 128],
    [258, 154],
    [216, 164],
  ],
  i: [null, [-13, 8], [-5, -6.5], [10, -2.4]],
  o: [[13, -8], [5, 6.5], [-10, 2.4], null],
};
const TAIL_L = {
  v: [
    [190, 166],
    [176, 194],
  ],
  i: [null, [3, -9]],
  o: [[-3, 9], null],
};
const TAIL_R = {
  v: [
    [210, 166],
    [224, 194],
  ],
  i: [null, [-3, -9]],
  o: [[3, 9], null],
};
const CHECK = {
  v: [
    [174, 264],
    [193, 282],
    [230, 242],
  ],
  i: [null, [-6, -6], [-11, 11]],
  o: [[6, 6], [11, -11], null],
};

// Empty-state hanger (200px canvas)
const HOOK_200 = {
  v: [
    [100, 26],
    [105.5, 28],
    [105.5, 34],
    [101.5, 38],
    [100, 43],
  ],
  i: [null, [-0.5, -2], [1.5, -2.5], [1, -1], [0.5, -1.5]],
  o: [[3.5, 0.5], [0.5, 2], [-1, 2], [-0.5, 1.5], null],
};
const ARMS_200 = {
  v: [
    [100, 44],
    [64, 64],
    [100, 68],
    [136, 64],
    [100, 44],
  ],
  i: [null, [4.5, -3], [-7, 0], [-5.5, 0.8], [4.5, 3]],
  o: [[-4.5, 3], [5.5, 0.8], [7, 0], [-5.5, -0.8], null],
};

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------

/** Home hero — ink sketch draws itself, then settles with a soft sway. */
function dressSketch() {
  const op = 180;
  const shapes = [
    grp("hook", [p(HOOK_400.v, HOOK_400.i, HOOK_400.o), draw(0, 14), stroke(INK, 3.5)]),
    grp("arms", [p(ARMS_400.v, ARMS_400.i, ARMS_400.o), draw(8, 26), stroke(INK, 3.5)]),
    grp("dress", [p(DRESS_400.v, DRESS_400.i, DRESS_400.o), draw(24, 96), stroke(INK, 3.5)]),
    grp("waist", [p(WAIST_400.v, WAIST_400.i, WAIST_400.o), draw(92, 106), stroke(INK, 3)]),
    grp(
      "button",
      [ellipse([0, 0], [9, 9]), fill(GOLD)],
      {
        ty: "tr",
        p: sv([200, 176]),
        a: sv([0, 0]),
        s: av([[102, [0, 0]], [114, [100, 100]]], EASE.back),
        r: sv(0),
        o: sv(100),
      },
    ),
  ];
  const rotation = av(
    [
      [116, [0]],
      [134, [1.8]],
      [152, [-1.6]],
      [168, [1.1]],
      [180, [0]],
    ],
    EASE.inOut,
  );
  return composition("dress-sketch", 400, 400, op, [
    layer("sketch", [200, 64], shapes, { op, rotation }),
  ]);
}

/** Checkout success — ribbon seal: bow, tails, knot, check, sparkles. */
function orderSeal() {
  const op = 72;
  const sparkle = (pos, outerR, rot, fromF) =>
    grp(
      `sparkle-${pos.join("-")}`,
      [star(4, outerR, outerR * 0.32, rot), fill(GOLD)],
      {
        ty: "tr",
        p: sv(pos),
        a: sv([0, 0]),
        s: av([[fromF, [0, 0]], [fromF + 12, [100, 100]]], EASE.back),
        r: sv(0),
        o: sv(100),
      },
    );

  const shapes = [
    grp("loop-l", [p(LOOP_L.v, LOOP_L.i, LOOP_L.o), draw(0, 18), stroke(CLAY, 9)]),
    grp("loop-r", [p(LOOP_R.v, LOOP_R.i, LOOP_R.o), draw(6, 24), stroke(CLAY, 9)]),
    grp("tail-l", [p(TAIL_L.v, TAIL_L.i, TAIL_L.o), draw(16, 26), stroke(CLAY, 9)]),
    grp("tail-r", [p(TAIL_R.v, TAIL_R.i, TAIL_R.o), draw(16, 26), stroke(CLAY, 9)]),
    grp("knot", [ellipse([0, 0], [20, 16]), fill(CLAY)], {
      ty: "tr",
      p: sv([200, 156]),
      a: sv([0, 0]),
      s: av([[18, [0, 0]], [28, [100, 100]]], EASE.back),
      r: sv(0),
      o: sv(100),
    }),
    grp("check", [p(CHECK.v, CHECK.i, CHECK.o), draw(24, 42), stroke(INK, 11)]),
    sparkle([116, 120], 11, 0, 34),
    sparkle([288, 146], 8, 18, 40),
    sparkle([300, 286], 10, -12, 46),
    sparkle([102, 286], 7, 30, 52),
    sparkle([200, 108], 6, 0, 58),
  ];
  return composition("order-seal", 400, 400, op, [layer("seal", [200, 200], shapes, { op })]);
}

/** Empty bag — quiet hanger sway, seamless loop. */
function hangerSway() {
  const op = 60;
  const shapes = [
    grp("hook", [p(HOOK_200.v, HOOK_200.i, HOOK_200.o), stroke(INK, 3.5)]),
    grp("arms", [p(ARMS_200.v, ARMS_200.i, ARMS_200.o), stroke(INK, 3.5)]),
  ];
  const rotation = av(
    [
      [0, [0]],
      [15, [3]],
      [45, [-3]],
      [60, [0]],
    ],
    EASE.inOut,
  );
  return composition("hanger-sway", 200, 200, op, [
    layer("hanger", [100, 40], shapes, { op, rotation }),
  ]);
}

// ---------------------------------------------------------------------------
// Self-checks + write
// ---------------------------------------------------------------------------

function validate(comp, name) {
  const errors = [];
  if (!comp.layers.length) errors.push("no layers");
  for (const l of comp.layers) {
    if (l.op > comp.op) errors.push(`${l.nm}: layer op exceeds composition`);
    for (const g of l.shapes) {
      if (g.ty !== "gr") errors.push(`${l.nm}: non-group shape ${g.ty}`);
      for (const item of g.it) {
        if (item.ty === "sh") {
          const { v, i: hi, o: ho } = item.ks.k;
          if (hi.length !== v.length || ho.length !== v.length) {
            errors.push(`${l.nm}/${g.nm}: handle/vertex count mismatch`);
          }
        }
        if (item.ty === "tm") {
          const frames = item.e.k.map((kf) => kf.t);
          if (frames.some((t, idx) => idx > 0 && t <= frames[idx - 1])) {
            errors.push(`${l.nm}/${g.nm}: trim keyframes not monotonic`);
          }
        }
        if (item.ty === "tr" && item.s?.a === 1) {
          const frames = item.s.k.map((kf) => kf.t);
          if (frames.some((t, idx) => idx > 0 && t <= frames[idx - 1])) {
            errors.push(`${l.nm}/${g.nm}: scale keyframes not monotonic`);
          }
        }
      }
    }
    if (l.ks.r?.a === 1) {
      const frames = l.ks.r.k.map((kf) => kf.t);
      if (frames.some((t, idx) => idx > 0 && t <= frames[idx - 1])) {
        errors.push(`${l.nm}: rotation keyframes not monotonic`);
      }
    }
  }
  if (errors.length) throw new Error(`validation failed for ${name}:\n- ${errors.join("\n- ")}`);
}

const targets = [
  ["dress-sketch.json", dressSketch],
  ["order-seal.json", orderSeal],
  ["hanger-sway.json", hangerSway],
];

await mkdir(outDir, { recursive: true });
for (const [file, build] of targets) {
  const comp = build();
  validate(comp, file);
  const json = JSON.stringify(comp, null, 2);
  JSON.parse(json); // ensure round-trip
  const dest = path.join(outDir, file);
  await writeFile(dest, `${json}\n`, "utf8");
  const kb = (Buffer.byteLength(json) / 1024).toFixed(1);
  console.log(`wrote ${path.relative(root, dest)} (${kb} KB, ${comp.op} frames @ ${FPS}fps)`);
}
