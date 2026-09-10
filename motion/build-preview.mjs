// QA harness: embeds the compiled cart-glide Lottie into a static HTML page
// that mimics the primary button (ink background, paper strokes) so the loop
// can be captured in a browser for render evidence.
// Usage: node motion/build-preview.mjs
import { readFile, writeFile } from "node:fs/promises";

const anim = await readFile("motion/cart-glide.lottie.json", "utf8");

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { margin: 0; background: #f6f1e7; font-family: system-ui, sans-serif; }
  .stage { display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 40px; }
  .button {
    width: 320px; height: 50px; border-radius: 25px; background: #2a1b16;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 12px rgba(42, 27, 22, 0.12);
  }
  #anim { width: 132px; height: 32px; }
  .label { color: #2a1b16; font-size: 12px; letter-spacing: 0.1em; }
</style>
</head>
<body>
  <div class="stage">
    <div class="button"><div id="anim"></div></div>
    <div class="label">cart-glide — loop preview on ink button</div>
  </div>
  <script src="https://unpkg.com/lottie-web@5.12.2/build/player/lottie.min.js"></script>
  <script>
    lottie.loadAnimation({
      container: document.getElementById("anim"),
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: ${anim},
    });
  </script>
</body>
</html>
`;

await writeFile("motion/preview.html", html, "utf8");
console.log("wrote motion/preview.html");
