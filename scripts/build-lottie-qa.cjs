const { readFileSync, writeFileSync, mkdirSync } = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const read = (f) => readFileSync(path.join(root, "assets", "lottie", f), "utf8");
const anims = ["dress-sketch.json", "order-seal.json", "hanger-sway.json"].map((f) => ({
  name: f.replace(".json", ""),
  json: read(f),
}));

const rows = anims
  .map(
    (a) => `
  <section>
    <h2>${a.name}</h2>
    <div class="row">
      <figure><div id="final-${a.name}" class="box"></div><figcaption>final frame</figcaption></figure>
      <figure><div id="loop-${a.name}" class="box"></div><figcaption>looping</figcaption></figure>
    </div>
  </section>`
  )
  .join("\n");

const data = anims.map((a) => ({ id: a.name, data: JSON.parse(a.json) }));

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Lottie QA — atelier set</title>
<style>
  body { background: #FAF4EC; font-family: sans-serif; color: #2A1B16; padding: 24px; }
  .row { display: flex; gap: 24px; }
  .box { width: 300px; height: 300px; background: #F2E8DA; border: 1px solid #DBD3C8; border-radius: 24px; }
  figcaption { font-size: 12px; color: #73665D; margin-top: 6px; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
</style>
</head>
<body>
${rows}
<script src="https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie.min.js"></script>
<script>
  const anims = ${JSON.stringify(data)};
  for (const { id, data } of anims) {
    const f = lottie.loadAnimation({ container: document.getElementById("final-" + id), renderer: "svg", loop: false, autoplay: false, animationData: data });
    f.addEventListener("DOMLoaded", () => f.goToAndStop(f.totalFrames - 1, true));
    lottie.loadAnimation({ container: document.getElementById("loop-" + id), renderer: "svg", loop: true, autoplay: true, animationData: JSON.parse(JSON.stringify(data)) });
  }
  window.__qaReady = true;
</script>
</body>
</html>`;

const outDir = path.join(root, ".expo", "static-tmp");
mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, "lottie-qa.html");
writeFileSync(out, html, "utf8");
console.log("wrote", out);
