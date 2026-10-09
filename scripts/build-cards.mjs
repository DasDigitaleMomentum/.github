// Cards for the GitHub org profile (light/dark SVG, Montserrat 700/500 as paths, DDM tokens).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const DDM = "/Users/Martin/git/DDM-homepage/.claude/worktrees/linkedin-icon";
const SCR = "/private/tmp/claude-501/-Users-Martin-git/5947155d-1b13-4e1d-a397-8dcd04efbbf0/scratchpad";
const opentype = await import(`${DDM}/node_modules/opentype.js/dist/opentype.mjs`);
const { createRequire } = await import("node:module");
const sharp = createRequire(`${DDM}/package.json`)("sharp");
const OUT = process.argv[2];
mkdirSync(`${OUT}/assets/cards`, { recursive: true });
const load = (f) => { const b = readFileSync(f); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };
const BOLD = load(`${DDM}/src/seo/montserrat-700.ttf`);
const MED = load(`${SCR}/montserrat-500.ttf`);

function run(font, str, size, ls = 0) {
  const scale = size / font.unitsPerEm; let x = 0, prev = null; const glyphs = [];
  for (const ch of str) { const g = font.charToGlyph(ch); if (g.index === 0) throw new Error(`glyph ${ch}`);
    if (prev) x += font.getKerningValue(prev, g) * scale; glyphs.push({ g, x }); x += g.advanceWidth * scale + ls * size; prev = g; }
  return { glyphs, width: x };
}
const path = (font, str, x, y, size, ls = 0) => run(font, str, size, ls).glyphs.map(({ g, x: gx }) => g.getPath(Math.round((x + gx) * 100) / 100, y, size).toPathData(2)).join("");
const width = (font, str, size, ls = 0) => run(font, str, size, ls).width;
function wrap(font, str, size, max) {
  const lines = []; for (const w of str.split(" ")) { const c = lines.length ? `${lines.at(-1)} ${w}` : w;
    if (lines.length && width(font, c, size) <= max) lines[lines.length - 1] = c; else lines.push(w); }
  return lines;
}
const THEMES = {
  dark: { bg: "#0f2036", border: "#29415f", fg: "#ffffff", muted: "#b0b8c4", accent: "#ff3300",
    live: ["#56d364", "#143337"], early: ["#79c0ff", "#153054"], wait: ["#b7c3d3", "#1a2a3f"] },
  light: { bg: "#ffffff", border: "#d8dee6", fg: "#0a1628", muted: "#4a5568", accent: "#c92800",
    live: ["#1a7f37", "#dafbe1"], early: ["#0969da", "#ddf4ff"], wait: ["#59636e", "#f6f8fa"] },
};
const LANG = { Python: "#3572A5", JavaScript: "#f1e05a", Shell: "#89e051", TypeScript: "#3178c6" };
const frame = (W, H, c, inner, title) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")}">
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="20" fill="${c.bg}" stroke="${c.border}" stroke-width="2"/>
${inner}
</svg>
`;
function badge(c, kind, label, x, y) {
  const [fgc, bgc] = c[kind]; const size = 22, w = width(MED, label, size) + 36;
  return `  <rect x="${x}" y="${y}" width="${w}" height="40" rx="20" fill="${bgc}" stroke="${fgc}" stroke-opacity="0.45"/>
  <circle cx="${x + 18}" cy="${y + 20}" r="5" fill="${fgc}"/>
  <path fill="${fgc}" d="${path(MED, label, x + 30, y + 28, size)}"/>`;
}

// Product cards 640 x 400
const products = [
  { id: "urbario", name: "Urbario", category: "Property software", status: ["wait", "Waitlist"], text: "Automated service charge statements for landlords, property managers and owners' associations." },
  { id: "authiane", name: "Authiane", category: "SaaS infrastructure", status: ["early", "Early access"], text: "A self-hostable platform for user accounts, subscriptions and usage-based billing in SaaS products." },
  { id: "handtuch-held", name: "Handtuch Held", category: "Hospitality technology", status: ["live", "Live"], text: "A live pool-lounger booking platform for hotels." },
];
for (const [theme, c] of Object.entries(THEMES)) {
  for (const p of products) {
    const W = 640, H = 400, P = 44;
    const lines = wrap(MED, p.text, 27, W - 2 * P);
    const inner = [
      `  <path fill="${c.muted}" d="${path(MED, p.category.toUpperCase(), P, P + 22, 19, 0.08)}"/>`,
      `  <path fill="${c.fg}" d="${path(BOLD, p.name, P, P + 82, 50, -0.02)}"/>`,
      ...lines.slice(0, 3).map((l, i) => `  <path fill="${c.muted}" d="${path(MED, l, P, P + 146 + i * 38, 27)}"/>`),
      badge(c, p.status[0], p.status[1], P, H - P - 40),
      // Arrow → drawn as a stroke (the Latin subset of the font has no arrows).
      `  <path fill="none" stroke="${c.accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M${W - P - 36} ${H - P - 20}h30m-12 -12l12 12l-12 12"/>`,
    ].join("\n");
    writeFileSync(`${OUT}/assets/cards/product-${p.id}-${theme}.svg`, frame(W, H, c, inner, `${p.name}: ${p.text} Status: ${p.status[1]}.`));
  }
}

// Open source cards 640 x 290
const repos = JSON.parse(process.argv[3]);
for (const [theme, c] of Object.entries(THEMES)) {
  for (const r of repos) {
    const W = 640, H = 290, P = 40;
    let size = 34; while (width(BOLD, r.name, size) > W - 2 * P - 40 && size > 22) size -= 1;
    const lines = wrap(MED, r.description, 23, W - 2 * P);
    const meta = `${r.language}   ·   MIT`;
    const inner = [
      `  <path fill="${c.fg}" d="${path(BOLD, r.name, P, P + 34, size, -0.01)}"/>`,
      ...lines.slice(0, 3).map((l, i) => `  <path fill="${c.muted}" d="${path(MED, l, P, P + 84 + i * 33, 23)}"/>`),
      `  <circle cx="${P + 9}" cy="${H - P - 8}" r="9" fill="${LANG[r.language]}"/>`,
      `  <path fill="${c.muted}" d="${path(MED, meta, P + 28, H - P, 21)}"/>`,
      `  <path fill="none" stroke="${c.accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M${W - P - 24} ${H - P - 2}l20 -20m-14 0h14v14"/>`,
    ].join("\n");
    writeFileSync(`${OUT}/assets/cards/oss-${r.name.toLowerCase()}-${theme}.svg`, frame(W, H, c, inner, `${r.name}: ${r.description} ${r.language}, MIT licence.`));
  }
}

// What we do strip 1280 x 190
const groups = ["Consulting & planning", "Build & integrate", "Operate", "Data & AI"];
for (const [theme, c] of Object.entries(THEMES)) {
  const W = 1280, H = 190, P = 44, col = (W - 2 * P) / 4;
  // One size for all four names: the largest that fits the longest.
  let SIZE = 32; while (groups.some((g) => width(BOLD, g, SIZE) > col - 44) && SIZE > 20) SIZE -= 1;
  const inner = groups.map((g, i) => {
    const x = P + i * col;
    const sep = i ? `  <rect x="${x - 22}" y="${P}" width="2" height="${H - 2 * P}" fill="${c.border}"/>\n` : "";
    const size = SIZE;
    return `${sep}  <path fill="${c.accent}" d="${path(BOLD, String(i + 1).padStart(2, "0"), x, P + 26, 24)}"/>
  <path fill="${c.fg}" d="${path(BOLD, g, x, P + 86, size, -0.01)}"/>`;
  }).join("\n");
  writeFileSync(`${OUT}/assets/cards/expertise-${theme}.svg`, frame(W, H, c, inner, `What we do: ${groups.join(", ")}.`));
}

// previews
for (const f of ["product-urbario-dark", "product-handtuch-held-light", "oss-strix-halo-cuda-combined-toolbox-dark", "oss-wbridge-light", "expertise-dark"]) {
  await sharp(`${OUT}/assets/cards/${f}.svg`).png().toFile(`${SCR}/prev-${f}.png`);
}
console.log("ok");
