// Terminal for the org profile: real commands against www.das-digitale-momentum.de with their real
// output (09.10.2026); no scores or other values that change over time (the README badge is live). All text is static and always visible (renderers such as the GitHub mobile app
// may freeze CSS animations at t=0); only the cursor blinks, and not with prefers-reduced-motion.
import { writeFileSync } from "node:fs";
const OUT = process.argv[2] ?? "profile";
// Spaces become no-break spaces: renderers without CSS white-space support (librsvg, native SVG views
// such as the GitHub mobile app) would otherwise collapse them between tspans.
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "\u00a0");
const C = { prompt: "#56d364", cmd: "#e6edf3", flag: "#79c0ff", url: "#a5d6ff", pipe: "#ff7b72", out: "#b0b8c4", head: "#ff5533", ok: "#56d364", dim: "#6e7f96", bar: "#ff5533" };
// Each line: list of [text, colour]; `cmd` lines are typed, others fade in.
const L = (cmd, ...parts) => ({ cmd, parts });
const lines = [
  L(true, ["❯ ", C.prompt], ["curl ", C.cmd], ["-sLH ", C.flag], ['"Accept: text/markdown" ', C.url], ["das-digitale-momentum.de/en ", C.url], ["| ", C.pipe], ["head -3", C.cmd]),
  L(false, ["Das Digitale Momentum · Since 2017", C.out]),
  L(false, ["", C.out]),
  L(false, ["# Software with momentum.", C.head]),
  L(false, ["", C.out]),
  L(true, ["❯ ", C.prompt], ["curl ", C.cmd], ["-sL ", C.flag], ["das-digitale-momentum.de/llms.txt ", C.url], ["| ", C.pipe], ["head -1", C.cmd]),
  L(false, ["# Das Digitale Momentum", C.head]),
  L(false, ["", C.out]),
  L(false, ["❯ ", C.prompt]),
];
const W = 1040, PAD = 32, TOP = 76, LH = 34, FS = 22;
const H = TOP + lines.length * LH + PAD;
let t = 0.4; const css = []; const body = [];
lines.forEach((line, i) => {
  const y = TOP + i * LH + 6;
  const id = `l${i}`;
  const text = line.parts.map(([s, c]) => `<tspan fill="${c}">${esc(s)}</tspan>`).join("");
  const chars = line.parts.reduce((n, [s]) => n + [...s].length, 0);
  if (line.cmd) {
    const dur = Math.max(0.6, chars * 0.022);
    // static: no per-line animation
    t += dur + 0.35;
  } else {
    // static: no per-line animation
    t += line.parts[0][0] === "" ? 0.05 : 0.12;
  }
  body.push(`  <text id="${id}" x="${PAD}" y="${y}" xml:space="preserve">${text}</text>`);
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Terminal: curl with Accept text/markdown returns the page as Markdown (# Software with momentum.), and /llms.txt starts with # Das Digitale Momentum.">
  <style>
    text{font:${FS}px ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono","DejaVu Sans Mono",monospace;white-space:pre}
    @keyframes type{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
    @keyframes show{from{opacity:0}to{opacity:1}}
    @keyframes blink{50%{opacity:0}}
    #cursor{animation:blink 1.1s steps(1) infinite}
    ${css.join("\n    ")}
    @media (prefers-reduced-motion:reduce){text,#cursor{animation:none!important}}
  </style>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="#0a1628" stroke="#29415f" stroke-width="2"/>
  <path d="M1 19a18 18 0 0 1 18-18h${W - 38}a18 18 0 0 1 18 18v27H1z" fill="#13233a"/>
  <circle cx="30" cy="24" r="7" fill="#ff5f57"/><circle cx="54" cy="24" r="7" fill="#febc2e"/><circle cx="78" cy="24" r="7" fill="#28c840"/>
  <text x="${W / 2}" y="31" text-anchor="middle" fill="#6e7f96" style="font-size:17px">zsh — das-digitale-momentum.de</text>
${body.join("\n")}
  <rect id="cursor" x="${PAD + 2 * FS * 0.6 + 4}" y="${TOP + (lines.length - 1) * LH - 14}" width="12" height="24" fill="#56d364"/>
</svg>
`;
writeFileSync(`${OUT}/assets/terminal.svg`, svg);
// The README shows a 2x PNG of it: identical in every renderer, including the GitHub mobile app.
if (process.env.DDM_HOMEPAGE) {
  const { createRequire } = await import("node:module");
  const sharp = createRequire(`${process.env.DDM_HOMEPAGE}/package.json`)("sharp");
  await sharp(`${OUT}/assets/terminal.svg`, { density: 144 }).png({ compressionLevel: 9 }).toFile(`${OUT}/assets/terminal.png`);
}
console.log("ok", `${W}x${H}`, `${t.toFixed(1)}s`);
