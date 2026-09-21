// Generates the full 78-card original illustration set for the single,
// unified tarot deck used by the app (no deck picker — one deck, one
// consistent cute/pastel style; only accent colour + tiny symbols shift
// per suit so cards stay visually scannable).
//
// Run with: node scripts/generate-card-art.mjs
// Output: public/cards/main/<cardId>.svg  and  public/cards/main/back.svg
//
// Style: flat hand-drawn-feeling vector shapes (rounded blobs, thick ink
// outlines, soft pastel fills), a single recurring "companion" mascot,
// composed from a small primitive library. Major Arcana cards each get a
// bespoke little scene; Minor Arcana cards are generated systematically
// from a suit profile (colour + symbol) crossed with a rank profile
// (how many symbols / which court accessory).

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "cards", "main");

const W = 300;
const H = 460;
const CX = 150;
const CY = 232;

// ---------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------

const round = (n) => Math.round(n * 100) / 100;

function circle(cx, cy, r, fill, extra = "") {
  return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}" fill="${fill}" ${extra}/>`;
}
function ellipse(cx, cy, rx, ry, fill, rotate = 0, extra = "") {
  const t = rotate ? ` transform="rotate(${rotate} ${round(cx)} ${round(cy)})"` : "";
  return `<ellipse cx="${round(cx)}" cy="${round(cy)}" rx="${round(rx)}" ry="${round(ry)}" fill="${fill}"${t} ${extra}/>`;
}
function rect(x, y, w, h, r, fill, extra = "") {
  return `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" rx="${round(r)}" fill="${fill}" ${extra}/>`;
}
function line(x1, y1, x2, y2, stroke, width, extra = "") {
  return `<line x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" ${extra}/>`;
}
function group(content, transform = "") {
  const t = transform ? ` transform="${transform}"` : "";
  return `<g${t}>${content}</g>`;
}
function sparkle(cx, cy, size, fill, rotate = 0) {
  const o = size;
  const i = size * 0.32;
  const pts = [
    [cx, cy - o], [cx + i, cy - i], [cx + o, cy], [cx + i, cy + i],
    [cx, cy + o], [cx - i, cy + i], [cx - o, cy], [cx - i, cy - i],
  ];
  const d = pts.map((p, idx) => `${idx === 0 ? "M" : "L"}${round(p[0])},${round(p[1])}`).join(" ") + " Z";
  const t = rotate ? ` transform="rotate(${rotate} ${round(cx)} ${round(cy)})"` : "";
  return `<path d="${d}" fill="${fill}"${t}/>`;
}
function starN(cx, cy, outerR, innerR, points, fill, rotateDeg = -90) {
  const step = Math.PI / points;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = i * step + (rotateDeg * Math.PI) / 180;
    d += `${i === 0 ? "M" : "L"}${round(cx + r * Math.cos(a))},${round(cy + r * Math.sin(a))} `;
  }
  return `<path d="${d}Z" fill="${fill}"/>`;
}
function crescent(cx, cy, r, innerRatio, fill, rotate = 0) {
  const ir = r * innerRatio;
  const d = `M ${round(cx - r)},${round(cy)} A ${round(r)},${round(r)} 0 1,0 ${round(cx + r)},${round(cy)} A ${round(ir)},${round(r * 0.98)} 0 1,1 ${round(cx - r)},${round(cy)} Z`;
  const t = rotate ? ` transform="rotate(${rotate} ${round(cx)} ${round(cy)})"` : "";
  return `<path d="${d}" fill="${fill}"${t}/>`;
}
function leaf(cx, cy, w, h, fill, rotate = 0) {
  const d = `M ${round(cx)},${round(cy - h / 2)} C ${round(cx + w / 2)},${round(cy - h / 4)} ${round(cx + w / 2)},${round(cy + h / 4)} ${round(cx)},${round(cy + h / 2)} C ${round(cx - w / 2)},${round(cy + h / 4)} ${round(cx - w / 2)},${round(cy - h / 4)} ${round(cx)},${round(cy - h / 2)} Z`;
  const t = rotate ? ` transform="rotate(${rotate} ${round(cx)} ${round(cy)})"` : "";
  return `<path d="${d}" fill="${fill}"${t}/>`;
}
function flower(cx, cy, r, petalFill, centerFill) {
  let petals = "";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 2 * Math.PI;
    petals += ellipse(cx + Math.cos(a) * r * 0.72, cy + Math.sin(a) * r * 0.72, r * 0.62, r * 0.44, petalFill, (a * 180) / Math.PI);
  }
  return group(petals + circle(cx, cy, r * 0.42, centerFill));
}
function heart(cx, cy, s, fill) {
  const d = `M ${round(cx)},${round(cy + s * 0.75)} C ${round(cx - s * 1.3)},${round(cy - s * 0.2)} ${round(cx - s * 0.5)},${round(cy - s * 1.15)} ${round(cx)},${round(cy - s * 0.35)} C ${round(cx + s * 0.5)},${round(cy - s * 1.15)} ${round(cx + s * 1.3)},${round(cy - s * 0.2)} ${round(cx)},${round(cy + s * 0.75)} Z`;
  return `<path d="${d}" fill="${fill}"/>`;
}
function wavyPath(x1, y, x2, amplitude, stroke, width) {
  const midX = (x1 + x2) / 2;
  const d = `M ${round(x1)},${round(y)} Q ${round((x1 + midX) / 2)},${round(y - amplitude)} ${round(midX)},${round(y)} Q ${round((midX + x2) / 2)},${round(y + amplitude)} ${round(x2)},${round(y)}`;
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
}
function dottedPath(points, fill, r = 3) {
  return points.map(([x, y]) => circle(x, y, r, fill)).join("");
}
function smileCurve(cx, cy, w, h, stroke, width) {
  return `<path d="M ${round(cx - w)},${round(cy)} Q ${round(cx)},${round(cy + h)} ${round(cx + w)},${round(cy)}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
}
function sleepyEye(cx, cy, w, stroke, width) {
  return `<path d="M ${round(cx - w)},${round(cy)} Q ${round(cx)},${round(cy - w * 0.9)} ${round(cx + w)},${round(cy)}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
}

// ---------------------------------------------------------------------
// Universal mascot ("a small round magic companion")
// ---------------------------------------------------------------------

const INK = "#4A3F4D";

function mascot(cx, cy, scale, bodyColor, cheekColor, opts = {}) {
  const s = scale;
  const { closedEyes = false, mouth = "smile", earColor = bodyColor } = opts;
  const eyes = closedEyes
    ? sleepyEye(cx - 12 * s, cy - 6 * s, 5 * s, INK, 2.5 * s) + sleepyEye(cx + 12 * s, cy - 6 * s, 5 * s, INK, 2.5 * s)
    : circle(cx - 12 * s, cy - 8 * s, 3.2 * s, INK) + circle(cx + 12 * s, cy - 8 * s, 3.2 * s, INK);
  const mouthShape =
    mouth === "o"
      ? ellipse(cx, cy + 6 * s, 4 * s, 5 * s, INK)
      : smileCurve(cx, cy + 1 * s, 8 * s, 6 * s, INK, 2.5 * s);
  const cheeks =
    circle(cx - 19 * s, cy + 2 * s, 4.5 * s, cheekColor, 'opacity="0.85"') +
    circle(cx + 19 * s, cy + 2 * s, 4.5 * s, cheekColor, 'opacity="0.85"');
  const ears =
    ellipse(cx - 20 * s, cy - 46 * s, 7.5 * s, 17 * s, earColor, -16) +
    ellipse(cx + 20 * s, cy - 46 * s, 7.5 * s, 17 * s, earColor, 16);
  const body = ellipse(cx, cy - 2 * s, 36 * s, 32 * s, bodyColor);
  const feet = ellipse(cx - 15 * s, cy + 28 * s, 9 * s, 6 * s, bodyColor) + ellipse(cx + 15 * s, cy + 28 * s, 9 * s, 6 * s, bodyColor);
  return group(ears + body + feet + eyes + mouthShape + cheeks);
}

// ---------------------------------------------------------------------
// Suit symbols
// ---------------------------------------------------------------------

function wandSymbol(cx, cy, s, color) {
  return group(
    line(cx, cy + 16 * s, cx, cy - 16 * s, "#B08A55", 4 * s) +
      leaf(cx - 4 * s, cy - 14 * s, 6 * s, 11 * s, color, -30) +
      leaf(cx + 4 * s, cy - 14 * s, 6 * s, 11 * s, color, 30) +
      sparkle(cx, cy - 22 * s, 4.5 * s, color)
  );
}
function cupSymbol(cx, cy, s, color) {
  return group(
    `<path d="M ${round(cx - 11 * s)},${round(cy - 10 * s)} C ${round(cx - 11 * s)},${round(cy + 8 * s)} ${round(cx + 11 * s)},${round(cy + 8 * s)} ${round(cx + 11 * s)},${round(cy - 10 * s)} Z" fill="${color}"/>` +
      rect(cx - 2.5 * s, cy + 8 * s, 5 * s, 8 * s, 1 * s, color) +
      ellipse(cx, cy + 17 * s, 9 * s, 2.6 * s, color)
  );
}
function swordSymbol(cx, cy, s, color) {
  return group(
    `<path d="M ${round(cx)},${round(cy - 22 * s)} L ${round(cx + 4 * s)},${round(cy + 6 * s)} L ${round(cx - 4 * s)},${round(cy + 6 * s)} Z" fill="${color}"/>` +
      rect(cx - 9 * s, cy + 5 * s, 18 * s, 3.5 * s, 1.5 * s, color) +
      rect(cx - 2.2 * s, cy + 8 * s, 4.4 * s, 10 * s, 1.5 * s, color)
  );
}
function pentacleSymbol(cx, cy, s, color) {
  return group(circle(cx, cy, 12 * s, "none", `stroke="${color}" stroke-width="${3 * s}"`) + starN(cx, cy, 6 * s, 2.6 * s, 5, color));
}

function suitSymbol(suit, cx, cy, s, color) {
  if (suit === "wands") return wandSymbol(cx, cy, s, color);
  if (suit === "cups") return cupSymbol(cx, cy, s, color);
  if (suit === "swords") return swordSymbol(cx, cy, s, color);
  return pentacleSymbol(cx, cy, s, color);
}

// ---------------------------------------------------------------------
// Palettes
// ---------------------------------------------------------------------

const GROUPS = {
  major: { bgFrom: "#FFF6EC", bgTo: "#F1E1F4", accentCycle: ["#F1A0BE", "#8C8CD9", "#8FBF6E", "#F0A868", "#7FC4D9", "#C9A6EA"] },
  wands: { bgFrom: "#FFF3E4", bgTo: "#FFDFC2", accent: "#F0A868" },
  cups: { bgFrom: "#EAF6FB", bgTo: "#CFEFEA", accent: "#7FC4D9" },
  swords: { bgFrom: "#ECEEFC", bgTo: "#D8E1F5", accent: "#8C93D9" },
  pentacles: { bgFrom: "#F1FAEC", bgTo: "#DFF0C8", accent: "#8FBF6E" },
};

function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// ---------------------------------------------------------------------
// Major Arcana illustrations (22)
// ---------------------------------------------------------------------

function majorIllustration(shortId, accent) {
  const c1 = accent;
  const c2 = lighten(accent, 40);
  const c4 = "#FBE28A";
  const body = lighten(accent, 70);
  const cheek = accent;

  switch (shortId) {
    case "fool":
      return group(
        sparkle(CX - 46, CY - 70, 8, c4) + sparkle(CX + 50, CY - 60, 6, c4, 20) +
          mascot(CX, CY, 1.05, body, cheek, { mouth: "o" }) +
          ellipse(CX + 40, CY + 38, 12, 9, c2) + line(CX + 40, CY + 30, CX + 40, CY + 18, "#B79A6B", 3)
      );
    case "magician":
      return group(
        line(CX + 30, CY - 10, CX + 54, CY - 54, INK, 4) + starN(CX + 56, CY - 58, 9, 4, 5, c4) +
          mascot(CX - 6, CY + 4, 1, body, cheek) + sparkle(CX - 40, CY - 30, 6, c1)
      );
    case "high-priestess":
      return group(
        crescent(CX, CY - 78, 22, 0.55, c2, 200) + mascot(CX, CY + 8, 1, body, cheek) +
          rect(CX - 22, CY + 42, 44, 10, 3, c1) + line(CX, CY + 42, CX, CY + 52, INK, 2)
      );
    case "empress":
      return group(
        mascot(CX, CY + 6, 1, body, cheek) +
          flower(CX - 16, CY - 46, 9, c1, c4) + flower(CX, CY - 52, 10, c1, c4) + flower(CX + 16, CY - 46, 9, c1, c4) +
          leaf(CX - 30, CY - 20, 10, 18, c2, -20) + leaf(CX + 30, CY - 20, 10, 18, c2, 20)
      );
    case "emperor":
      return group(
        rect(CX - 26, CY + 30, 52, 16, 4, c2) + mascot(CX, CY, 1, body, cheek) +
          `<path d="M ${CX - 14},${CY - 46} L ${CX - 8},${CY - 60} L ${CX},${CY - 48} L ${CX + 8},${CY - 60} L ${CX + 14},${CY - 46} Z" fill="${c4}"/>` +
          circle(CX - 8, CY - 60, 2.6, c1) + circle(CX + 8, CY - 60, 2.6, c1) + circle(CX, CY - 48, 2.6, c1)
      );
    case "hierophant":
      return group(
        `<path d="M ${CX - 14},${CY - 40} L ${CX},${CY - 66} L ${CX + 14},${CY - 40} Z" fill="${c2}"/>` +
          circle(CX, CY - 50, 3, c4) +
          mascot(CX, CY + 6, 1, body, cheek) +
          rect(CX + 26, CY + 4, 16, 14, 2, c1) + line(CX + 34, CY + 4, CX + 34, CY + 18, INK, 1.5) +
          sparkle(CX - 32, CY - 10, 5, c4)
      );
    case "lovers":
      return group(mascot(CX - 34, CY + 6, 0.78, body, cheek) + mascot(CX + 34, CY + 6, 0.78, body, cheek) + heart(CX, CY - 26, 11, c1));
    case "chariot":
      return group(
        rect(CX - 30, CY + 6, 60, 30, 8, c2) + circle(CX - 24, CY + 44, 11, INK) + circle(CX + 24, CY + 44, 11, INK) +
          circle(CX - 24, CY + 44, 5, c4) + circle(CX + 24, CY + 44, 5, c4) +
          `<path d="M ${CX + 22},${CY - 10} L ${CX + 22},${CY - 34} L ${CX + 40},${CY - 24} Z" fill="${c1}"/>` +
          mascot(CX - 4, CY - 6, 0.85, body, cheek)
      );
    case "strength":
      return group(
        ellipse(CX + 26, CY + 14, 20, 16, c1) +
          `<path d="M ${CX + 10},${CY + 2} L ${CX + 4},${CY - 10} L ${CX + 16},${CY - 6} Z" fill="${c1}"/>` +
          circle(CX + 20, CY + 8, 2.4, INK) + circle(CX + 32, CY + 8, 2.4, INK) +
          mascot(CX - 16, CY + 4, 0.95, body, cheek)
      );
    case "hermit":
      return group(
        mascot(CX, CY + 6, 1, body, cheek) + rect(CX + 28, CY - 4, 16, 20, 3, c2) + circle(CX + 36, CY + 4, 6, c4) +
          line(CX + 36, CY - 4, CX + 36, CY - 14, INK, 2.5)
      );
    case "wheel-of-fortune":
      return group(
        circle(CX, CY, 40, "none", `stroke="${c1}" stroke-width="6"`) + line(CX - 40, CY, CX + 40, CY, c1, 4) +
          line(CX, CY - 40, CX, CY + 40, c1, 4) + line(CX - 28, CY - 28, CX + 28, CY + 28, c1, 4) +
          line(CX - 28, CY + 28, CX + 28, CY - 28, c1, 4) + circle(CX, CY, 10, c4) +
          sparkle(CX - 48, CY - 20, 6, c4) + sparkle(CX + 50, CY + 14, 6, c4)
      );
    case "justice":
      return group(
        mascot(CX, CY + 10, 1, body, cheek) + line(CX, CY - 38, CX, CY - 4, INK, 3) + line(CX - 22, CY - 30, CX + 22, CY - 30, INK, 3) +
          circle(CX - 22, CY - 16, 8, c1) + circle(CX + 22, CY - 16, 8, c1) +
          line(CX - 22, CY - 30, CX - 22, CY - 24, INK, 2) + line(CX + 22, CY - 30, CX + 22, CY - 24, INK, 2)
      );
    case "hanged-man":
      return group(
        line(CX - 34, CY - 44, CX + 34, CY - 44, "#B79A6B", 5) +
          line(CX + 6, CY - 44, CX + 6, CY - 20, c1, 3) +
          group(mascot(CX + 6, CY + 12, 0.9, body, cheek, { closedEyes: true }), `rotate(180 ${CX + 6} ${CY + 12})`) +
          sparkle(CX - 26, CY - 4, 5, c4) + sparkle(CX - 14, CY + 20, 4, c4)
      );
    case "death":
      return group(
        `<path d="M ${CX - 26},${CY + 20} Q ${CX - 30},${CY - 4} ${CX - 20},${CY - 20}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` +
          flower(CX - 20, CY - 22, 9, "#C9C2B8", "#ADA69A") +
          `<path d="M ${CX + 20},${CY + 20} Q ${CX + 24},${CY - 6} ${CX + 22},${CY - 24}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` +
          flower(CX + 22, CY - 26, 11, c1, c4) + mascot(CX, CY + 26, 0.75, body, cheek)
      );
    case "temperance":
      return group(
        mascot(CX, CY, 1, body, cheek) + ellipse(CX - 34, CY + 30, 10, 7, c2) + ellipse(CX + 34, CY + 30, 10, 7, c2) +
          wavyPath(CX - 26, CY + 22, CX + 26, 10, c1, 3)
      );
    case "devil":
      return group(
        mascot(CX, CY, 1, body, cheek) +
          `<path d="M ${CX - 12},${CY - 40} L ${CX - 6},${CY - 30} L ${CX - 16},${CY - 30} Z" fill="${c1}"/>` +
          `<path d="M ${CX + 12},${CY - 40} L ${CX + 6},${CY - 30} L ${CX + 16},${CY - 30} Z" fill="${c1}"/>` +
          circle(CX - 14, CY + 40, 7, "none", `stroke="${INK}" stroke-width="3"`) +
          circle(CX + 14, CY + 40, 7, "none", `stroke="${INK}" stroke-width="3"`)
      );
    case "tower":
      return group(
        rect(CX - 20, CY + 6, 40, 30, 4, c2) + rect(CX - 14, CY - 22, 28, 30, 4, c1) +
          line(CX - 6, CY - 18, CX + 4, CY + 4, INK, 2) +
          sparkle(CX + 30, CY - 30, 6, c4) + sparkle(CX - 34, CY - 10, 5, c4) +
          mascot(CX - 2, CY + 40, 0.7, body, cheek, { mouth: "o" })
      );
    case "star":
      return group(
        starN(CX, CY - 66, 16, 7, 5, c4) + ellipse(CX, CY + 40, 40, 12, c2, 0, 'opacity="0.7"') +
          mascot(CX - 4, CY + 4, 0.95, body, cheek) + ellipse(CX - 30, CY + 16, 8, 6, c2) + ellipse(CX + 30, CY + 16, 8, 6, c2)
      );
    case "moon":
      return group(
        crescent(CX, CY - 60, 24, 0.5, c4, 200) + circle(CX - 30, CY - 62, 2, INK) + circle(CX + 24, CY - 50, 2, INK) +
          mascot(CX, CY + 14, 0.95, body, cheek, { closedEyes: true }) +
          dottedPath([[CX - 30, CY + 44], [CX - 10, CY + 48], [CX + 10, CY + 48], [CX + 30, CY + 44]], INK, 2.4)
      );
    case "sun":
      return group(
        circle(CX, CY - 10, 30, c4, 'opacity="0.9"') +
          [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const rad = (a * Math.PI) / 180;
            return line(CX + Math.cos(rad) * 38, CY - 10 + Math.sin(rad) * 38, CX + Math.cos(rad) * 48, CY - 10 + Math.sin(rad) * 48, c4, 4);
          }).join("") +
          mascot(CX, CY, 0.95, body, cheek) + flower(CX + 34, CY + 42, 8, c1, c4)
      );
    case "judgement":
      return group(
        `<path d="M ${CX - 10},${CY - 20} L ${CX + 14},${CY - 30} L ${CX + 14},${CY - 8} Z" fill="${c2}"/>` +
          circle(CX + 16, CY - 19, 6, c2) + sparkle(CX + 30, CY - 30, 7, c4) + sparkle(CX + 36, CY - 14, 5, c4) +
          mascot(CX - 10, CY + 10, 1, body, cheek)
      );
    case "world":
      return group(
        [0, 60, 120, 180, 240, 300].map((a) => {
          const rad = (a * Math.PI) / 180;
          return leaf(CX + Math.cos(rad) * 46, CY + Math.sin(rad) * 46, 12, 20, c2, a);
        }).join("") +
          mascot(CX, CY, 0.95, body, cheek) + sparkle(CX - 44, CY, 5, c4) + sparkle(CX + 44, CY, 5, c4)
      );
    default:
      return mascot(CX, CY, 1, body, cheek);
  }
}

// ---------------------------------------------------------------------
// Minor Arcana illustrations (56 = 4 suits x 14 ranks)
// ---------------------------------------------------------------------

function gridPositions(n, boxW, boxH, cx, cy) {
  const cols = n <= 3 ? n : n <= 6 ? 3 : 5;
  const rows = Math.ceil(n / cols);
  const cellW = boxW / cols;
  const cellH = boxH / rows;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const itemsInRow = row === rows - 1 ? n - row * cols : cols;
    const rowOffset = (cols - itemsInRow) / 2;
    const x = cx - boxW / 2 + cellW * (col + rowOffset + 0.5);
    const y = cy - boxH / 2 + cellH * (row + 0.5);
    pts.push([x, y]);
  }
  return pts;
}

const RANK_NUMBER = { ace: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

function minorIllustration(suit, rank, accent) {
  const body = lighten(accent, 70);
  const cheek = accent;
  const accentDark = accent;

  if (rank in RANK_NUMBER) {
    const n = RANK_NUMBER[rank];
    const symbols = gridPositions(n, 132, 76, CX, CY - 92)
      .map(([x, y]) => suitSymbol(suit, x, y, 0.85, accentDark))
      .join("");
    return group(symbols + mascot(CX, CY + 38, 0.82, body, cheek));
  }

  if (rank === "page") {
    return group(
      mascot(CX, CY + 6, 1, body, cheek, { mouth: "o" }) +
        rect(CX + 24, CY + 10, 14, 12, 2, accentDark) +
        suitSymbol(suit, CX - 28, CY - 6, 0.8, accentDark) +
        sparkle(CX + 30, CY - 20, 5, accentDark)
    );
  }
  if (rank === "knight") {
    return group(
      ellipse(CX, CY + 34, 34, 9, lighten(accent, 30)) +
        mascot(CX, CY, 1.02, body, cheek) +
        suitSymbol(suit, CX + 30, CY - 24, 0.9, accentDark) +
        line(CX - 30, CY + 6, CX - 40, CY - 4, accentDark, 3)
    );
  }
  if (rank === "queen") {
    const crownY = CY - 48;
    return group(
      `<path d="M ${CX - 12},${crownY} L ${CX - 6},${CY - 62} L ${CX},${CY - 52} L ${CX + 6},${CY - 62} L ${CX + 12},${crownY} Z" fill="${accentDark}"/>` +
        circle(CX, CY - 52, 2.4, "#FFF7E0") +
        mascot(CX, CY + 4, 1, body, cheek) +
        suitSymbol(suit, CX + 26, CY + 20, 0.75, accentDark)
    );
  }
  // king
  return group(
    rect(CX - 24, CY + 30, 48, 14, 4, lighten(accent, 20)) +
      mascot(CX, CY, 1, body, cheek) +
      `<path d="M ${CX - 16},${CY - 44} L ${CX - 9},${CY - 60} L ${CX},${CY - 48} L ${CX + 9},${CY - 60} L ${CX + 16},${CY - 44} Z" fill="${accentDark}"/>` +
      circle(CX - 9, CY - 60, 2.6, "#FFF7E0") + circle(CX + 9, CY - 60, 2.6, "#FFF7E0") + circle(CX, CY - 48, 2.6, "#FFF7E0") +
      suitSymbol(suit, CX + 28, CY + 12, 0.85, accentDark)
  );
}

// ---------------------------------------------------------------------
// Card frame + back
// ---------------------------------------------------------------------

function fontStack() {
  return "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif";
}

function scatterBackground(seedIndex, accent) {
  const spots = [[42, 92], [256, 106], [40, 372], [258, 352]];
  const kinds = ["sparkle", "leaf", "heart", "sparkle"];
  let out = "";
  spots.forEach(([x, y], i) => {
    const kind = kinds[(i + seedIndex) % kinds.length];
    const r = 9 + ((i * 5 + seedIndex * 3) % 5);
    if (kind === "sparkle") out += sparkle(x, y, r * 0.8, accent);
    else if (kind === "leaf") out += leaf(x, y, r, r * 1.7, lighten(accent, 30), (i * 47 + seedIndex * 13) % 60 - 30);
    else out += heart(x, y, r * 0.6, accent);
  });
  return `<g opacity="0.4">${out}</g>`;
}

function cardSvg({ id, group: groupKey, accent, badge, koreanName, englishName, illustrationSvg, seedIndex }) {
  const g = GROUPS[groupKey];
  const gid = `bg-${id}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="${g.bgFrom}"/>
      <stop offset="1" stop-color="${g.bgTo}"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="26" fill="url(#${gid})"/>
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="20" fill="none" stroke="${accent}" stroke-width="2" stroke-opacity="0.55" stroke-dasharray="1 7" stroke-linecap="round"/>
  ${scatterBackground(seedIndex, accent)}
  <circle cx="42" cy="46" r="18" fill="${accent}" opacity="0.92"/>
  <text x="42" y="52" text-anchor="middle" font-family="${fontStack()}" font-size="14" font-weight="700" fill="#ffffff">${badge}</text>
  ${illustrationSvg}
  <line x1="80" y1="378" x2="220" y2="378" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.7"/>
  <text x="150" y="406" text-anchor="middle" font-family="${fontStack()}" font-size="${koreanName.length > 8 ? 17 : 22}" font-weight="700" fill="${INK}">${koreanName}</text>
  <text x="150" y="428" text-anchor="middle" font-family="${fontStack()}" font-size="10" letter-spacing="1" fill="${INK}" opacity="0.65">${englishName.toUpperCase()}</text>
</svg>
`;
}

function backSvg() {
  const accent = "#B78CE0";
  const gid = "back-main";
  let pattern = "";
  const rows = 6;
  const cols = 4;
  const kinds = [wandSymbol, cupSymbol, swordSymbol, pentacleSymbol];
  const colors = [GROUPS.wands.accent, GROUPS.cups.accent, GROUPS.swords.accent, GROUPS.pentacles.accent];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 40 + c * 74 + (r % 2 === 0 ? 0 : 37);
      const y = 40 + r * 68;
      if (x > W - 30 || y > H - 30) continue;
      const idx = (r + c) % kinds.length;
      pattern += kinds[idx](x, y, 0.5, colors[idx]);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F5EAFD"/>
      <stop offset="1" stop-color="#E4F0FB"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="26" fill="url(#${gid})"/>
  <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="20" fill="none" stroke="${accent}" stroke-width="2.5"/>
  <g opacity="0.5">${pattern}</g>
  <circle cx="${W / 2}" cy="${H / 2}" r="46" fill="${accent}" opacity="0.95"/>
  <circle cx="${W / 2}" cy="${H / 2}" r="46" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.7"/>
  ${mascot(W / 2, H / 2 + 4, 0.8, lighten(accent, 60), accent)}
</svg>
`;
}

// ---------------------------------------------------------------------
// Card catalog (id + badge + Korean/English names only — full meanings
// live in src/data. Order here only affects deterministic background
// scatter, not gameplay.)
// ---------------------------------------------------------------------

const MAJOR = [
  ["00-fool", "fool", "0", "바보", "The Fool"],
  ["01-magician", "magician", "I", "마법사", "The Magician"],
  ["02-high-priestess", "high-priestess", "II", "여사제", "The High Priestess"],
  ["03-empress", "empress", "III", "여황제", "The Empress"],
  ["04-emperor", "emperor", "IV", "황제", "The Emperor"],
  ["05-hierophant", "hierophant", "V", "교황", "The Hierophant"],
  ["06-lovers", "lovers", "VI", "연인", "The Lovers"],
  ["07-chariot", "chariot", "VII", "전차", "The Chariot"],
  ["08-strength", "strength", "VIII", "힘", "Strength"],
  ["09-hermit", "hermit", "IX", "은둔자", "The Hermit"],
  ["10-wheel-of-fortune", "wheel-of-fortune", "X", "운명의 수레바퀴", "Wheel of Fortune"],
  ["11-justice", "justice", "XI", "정의", "Justice"],
  ["12-hanged-man", "hanged-man", "XII", "매달린 사람", "The Hanged Man"],
  ["13-death", "death", "XIII", "죽음", "Death"],
  ["14-temperance", "temperance", "XIV", "절제", "Temperance"],
  ["15-devil", "devil", "XV", "악마", "The Devil"],
  ["16-tower", "tower", "XVI", "탑", "The Tower"],
  ["17-star", "star", "XVII", "별", "The Star"],
  ["18-moon", "moon", "XVIII", "달", "The Moon"],
  ["19-sun", "sun", "XIX", "태양", "The Sun"],
  ["20-judgement", "judgement", "XX", "심판", "Judgement"],
  ["21-world", "world", "XXI", "세계", "The World"],
];

const SUITS = [
  { id: "wands", koreanName: "완드", englishName: "Wands" },
  { id: "cups", koreanName: "컵", englishName: "Cups" },
  { id: "swords", koreanName: "소드", englishName: "Swords" },
  { id: "pentacles", koreanName: "펜타클", englishName: "Pentacles" },
];

const RANKS = [
  ["ace", "A", "에이스", "Ace"],
  ["two", "2", "2", "Two"],
  ["three", "3", "3", "Three"],
  ["four", "4", "4", "Four"],
  ["five", "5", "5", "Five"],
  ["six", "6", "6", "Six"],
  ["seven", "7", "7", "Seven"],
  ["eight", "8", "8", "Eight"],
  ["nine", "9", "9", "Nine"],
  ["ten", "10", "10", "Ten"],
  ["page", "P", "페이지", "Page"],
  ["knight", "N", "기사", "Knight"],
  ["queen", "Q", "퀸", "Queen"],
  ["king", "K", "킹", "King"],
];

// ---------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------

mkdirSync(OUT_DIR, { recursive: true });

let count = 0;
const majorAccents = GROUPS.major.accentCycle;

MAJOR.forEach(([id, shortId, badge, koreanName, englishName], index) => {
  const accent = majorAccents[index % majorAccents.length];
  const svg = cardSvg({
    id,
    group: "major",
    accent,
    badge,
    koreanName,
    englishName,
    illustrationSvg: majorIllustration(shortId, accent),
    seedIndex: index,
  });
  writeFileSync(path.join(OUT_DIR, `${id}.svg`), svg, "utf8");
  count++;
});

SUITS.forEach((suitDef) => {
  const g = GROUPS[suitDef.id];
  RANKS.forEach(([rank, badge, rankKo, rankEn], rIndex) => {
    const id = `${suitDef.id}-${rank}`;
    const koreanName = `${suitDef.koreanName}의 ${rankKo}`;
    const englishName = `${rankEn} of ${suitDef.englishName}`;
    const svg = cardSvg({
      id,
      group: suitDef.id,
      accent: g.accent,
      badge,
      koreanName,
      englishName,
      illustrationSvg: minorIllustration(suitDef.id, rank, g.accent),
      seedIndex: rIndex,
    });
    writeFileSync(path.join(OUT_DIR, `${id}.svg`), svg, "utf8");
    count++;
  });
});

writeFileSync(path.join(OUT_DIR, "back.svg"), backSvg(), "utf8");

console.log(`Generated ${count} card SVGs + 1 back into ${OUT_DIR}`);
