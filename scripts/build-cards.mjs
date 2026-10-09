// Cards for the GitHub org profile (light/dark SVG, Montserrat 700/500 as paths, DDM tokens).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
// DDM_HOMEPAGE: checkout of DasDigitaleMomentum/DDM-homepage with node_modules (font, signet, opentype.js, sharp).
const DDM = process.env.DDM_HOMEPAGE ?? "../DDM-homepage";
// MONTSERRAT_500: Montserrat wght=500 instance (fonttools varLib.instancer on the website's variable font).
const FONT_500 = process.env.MONTSERRAT_500 ?? "montserrat-500.ttf";
const opentype = await import(`${DDM}/node_modules/opentype.js/dist/opentype.mjs`);
const { createRequire } = await import("node:module");
const sharp = createRequire(`${DDM}/package.json`)("sharp");
const OUT = process.argv[2];
mkdirSync(`${OUT}/assets/cards`, { recursive: true });
const load = (f) => { const b = readFileSync(f); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };
const BOLD = load(`${DDM}/src/seo/montserrat-700.ttf`);
const MED = load(FONT_500);

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

// Product cards 1280 x 270, full README width: name, category and status left, text right.
const products = [
  { id: "urbario", name: "Urbario", category: "Property software", status: ["wait", "Waitlist"], text: "Automated service charge statements for landlords, property managers and owners' associations." },
  { id: "authiane", name: "Authiane", category: "SaaS infrastructure", status: ["early", "Early access"], text: "A self-hostable platform for user accounts, subscriptions and usage-based billing in SaaS products." },
  { id: "handtuch-held", name: "Handtuch Held", category: "Hospitality technology", status: ["live", "Live"], note: " · hotel area: preview", text: "A live pool-lounger booking platform for hotels." },
];
for (const [theme, c] of Object.entries(THEMES)) {
  for (const p of products) {
    const W = 1280, H = 270, P = 52, split = 560;
    let nameSize = 62; while (width(BOLD, p.name, nameSize, -0.02) > split - P - 48) nameSize -= 1;
    const lines = wrap(MED, p.text, 31, W - split - P - 100);
    const top = H / 2 - ((lines.length - 1) * 44) / 2 + 11;
    const inner = [
      `  <path fill="${c.muted}" d="${path(MED, p.category.toUpperCase(), P, P + 24, 22, 0.08)}"/>`,
      `  <path fill="${c.fg}" d="${path(BOLD, p.name, P, P + 92, nameSize, -0.02)}"/>`,
      badge(c, p.status[0], p.status[1] + (p.note ?? ""), P, H - P - 40),
      `  <rect x="${split - 2}" y="${P}" width="2" height="${H - 2 * P}" fill="${c.border}"/>`,
      ...lines.map((l, i) => `  <path fill="${c.muted}" d="${path(MED, l, split + 44, top + i * 44, 31)}"/>`),
      `  <path fill="none" stroke="${c.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" d="M${W - P - 40} ${H / 2}h36m-14 -14l14 14l-14 14"/>`,
    ].join("\n");
    writeFileSync(`${OUT}/assets/cards/product-${p.id}-${theme}.svg`, frame(W, H, c, inner, `${p.name} (${p.category}): ${p.text} Status: ${p.status[1]}${p.note ?? ""}.`));
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

// Sixth card: all projects on the website (closes the 2 x 3 grid).
for (const [theme, c] of Object.entries(THEMES)) {
  const W = 640, H = 290, P = 40;
  const inner = [
    `  <path fill="${c.accent}" d="${path(BOLD, "All projects", P, P + 34, 34, -0.01)}"/>`,
    ...wrap(MED, "Licences, languages and what each project is for, on das-digitale-momentum.de.", 23, W - 2 * P).map((l, i) => `  <path fill="${c.muted}" d="${path(MED, l, P, P + 84 + i * 33, 23)}"/>`),
    `  <path fill="${c.muted}" d="${path(MED, "das-digitale-momentum.de/open-source", P, H - P, 21)}"/>`,
    `  <path fill="none" stroke="${c.accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M${W - P - 36} ${H - P - 8}h30m-12 -12l12 12l-12 12"/>`,
  ].join("\n");
  writeFileSync(`${OUT}/assets/cards/oss-all-${theme}.svg`, frame(W, H, c, inner, "All open source projects of Das Digitale Momentum on das-digitale-momentum.de."));
}

// What we do: 2 x 2 grid 1280 x 360
const groups = ["Consulting & planning", "Build & integrate", "Operate", "Data & AI"];
for (const [theme, c] of Object.entries(THEMES)) {
  const W = 1280, H = 360, P = 52, colW = (W - 2 * P) / 2, rowH = (H - 2 * P) / 2;
  const inner = [
    `  <rect x="${W / 2 - 1}" y="${P}" width="2" height="${H - 2 * P}" fill="${c.border}"/>`,
    `  <rect x="${P}" y="${H / 2 - 1}" width="${W - 2 * P}" height="2" fill="${c.border}"/>`,
    ...groups.map((g, i) => {
      const x = P + (i % 2) * colW + (i % 2 ? 44 : 0), y = P + Math.floor(i / 2) * rowH;
      const base = y + rowH / 2 + 14;
      return `  <path fill="${c.accent}" d="${path(BOLD, String(i + 1).padStart(2, "0"), x, base - 1, 28)}"/>
  <path fill="${c.fg}" d="${path(BOLD, g, x + 64, base, 40, -0.01)}"/>`;
    }),
  ].join("\n");
  writeFileSync(`${OUT}/assets/cards/expertise-${theme}.svg`, frame(W, H, c, inner, `What we do: ${groups.join(", ")}.`));
}

console.log("ok");
