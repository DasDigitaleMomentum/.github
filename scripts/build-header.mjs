// Builds the GitHub org profile banner (light/dark SVG, text as Montserrat 700 paths) and the avatar.
import { readFileSync, writeFileSync } from "node:fs";
const DDM = "/Users/Martin/git/DDM-homepage/.claude/worktrees/linkedin-icon";
const opentype = await import(`${DDM}/node_modules/opentype.js/dist/opentype.mjs`);
const { createRequire } = await import("node:module");
const sharp = createRequire(`${DDM}/package.json`)("sharp");
const OUT = process.argv[2];
const fontFile = readFileSync(`${DDM}/src/seo/montserrat-700.ttf`);
const font = opentype.parse(fontFile.buffer.slice(fontFile.byteOffset, fontFile.byteOffset + fontFile.byteLength));
const signet = readFileSync(`${DDM}/public/assets/logo-white.svg`, "utf8").match(/<g id="signet">(.*?)<\/g>/s)[1];
const SIGNET = { x: 250.15, y: 4.7, width: 523.3, height: 246.7 };

const text = (str, x, y, size, ls = 0) => {
  let path = "", cx = x;
  const scale = size / font.unitsPerEm;
  let prev = null;
  for (const ch of str) {
    const g = font.charToGlyph(ch);
    if (prev) cx += font.getKerningValue(prev, g) * scale;
    path += g.getPath(Math.round(cx * 100) / 100, y, size).toPathData(2);
    cx += g.advanceWidth * scale + ls * size;
    prev = g;
  }
  return { d: path, width: cx - x };
};

function banner(theme) {
  const W = 1280, H = 360, P = 72;
  const c = theme === "dark"
    ? { bg: "#0a1628", fg: "#ffffff", muted: "#a9b4c7", signet: "#ffffff", accent: "#ff3300", rule: "#22324d" }
    : { bg: "#ffffff", fg: "#0a1628", muted: "#4a5568", signet: "#2039c9", accent: "#c92800", rule: "#e3e7ee" };
  const sw = 92, sScale = sw / SIGNET.width;
  const brand = text("Das Digitale Momentum", P + sw + 22, P + 34, 30, -0.01);
  const l1 = text("Software", P, 228, 76, -0.03);
  const l2 = text("with momentum.", P + l1.width + 22, 228, 76, -0.03);
  const sub = text("Consulting, engineering, operations. Since 2017.", P, 284, 26, 0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">
  <title id="t">Das Digitale Momentum: Software with momentum. Consulting, engineering, operations. Since 2017.</title>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="${c.bg}" stroke="${c.rule}"/>
  <rect x="${P}" y="${H - 40}" width="${W - 2 * P}" height="1" fill="${c.rule}"/>
  <rect x="${P}" y="${H - 41}" width="96" height="3" fill="${c.accent}"/>
  <g fill="${c.signet}" transform="translate(${P} ${P}) scale(${sScale}) translate(${-SIGNET.x} ${-SIGNET.y})">${signet}</g>
  <path fill="${c.fg}" d="${brand.d}"/>
  <path fill="${c.fg}" d="${l1.d}"/>
  <path fill="${c.accent}" d="${l2.d}"/>
  <path fill="${c.muted}" d="${sub.d}"/>
</svg>
`;
}
for (const theme of ["dark", "light"]) writeFileSync(`${OUT}/assets/header-${theme}.svg`, banner(theme));

// Avatar 1000 x 1000: white signet on navy, as favicon and apple-touch-icon of the website.
const S = 1000, w = S * 0.7, sc = w / SIGNET.width, h = SIGNET.height * sc;
const avatar = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}"><rect width="${S}" height="${S}" fill="#0a1628"/><g fill="#ffffff" transform="translate(${(S - w) / 2} ${(S - h) / 2}) scale(${sc}) translate(${-SIGNET.x} ${-SIGNET.y})">${signet}</g></svg>`;
await sharp(Buffer.from(avatar)).png().toFile(`${OUT}/assets/avatar-1000.png`);
for (const theme of ["dark", "light"]) await sharp(`${OUT}/assets/header-${theme}.svg`).png().toFile(`${OUT}/../header-${theme}-preview.png`);
console.log("ok");
