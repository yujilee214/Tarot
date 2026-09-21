// Generates original, cute pastel-illustration SVG art for each tarot deck.
// Run with: node scripts/generate-card-art.mjs
//
// Output: public/cards/<deckId>/<cardId>.svg  and  public/cards/<deckId>/back.svg
//
// Style: flat, hand-drawn-feeling vector shapes (rounded blobs, thick ink
// outlines, soft pastel fills) composed from a small primitive library.
// Each deck has its own mascot creature + colour palette + background
// motif set; each Major Arcana card has its own accessory composition so
// every card reads as a small, distinct scene.

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = path.join(__dirname, "..", "public", "cards");

const W = 300;
const H = 460;

// ---------------------------------------------------------------------
// Small SVG primitive helpers
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

// four-point "sparkle" star, good for magic twinkles
function sparkle(cx, cy, size, fill, rotate = 0) {
  const o = size;
  const i = size * 0.32;
  const pts = [
    [cx, cy - o],
    [cx + i, cy - i],
    [cx + o, cy],
    [cx + i, cy + i],
    [cx, cy + o],
    [cx - i, cy + i],
    [cx - o, cy],
    [cx - i, cy - i],
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
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    d += `${i === 0 ? "M" : "L"}${round(x)},${round(y)} `;
  }
  d += "Z";
  return `<path d="${d}" fill="${fill}"/>`;
}

// crescent moon via two overlapping arcs
function crescent(cx, cy, r, innerRatio, fill, rotate = 0) {
  const ir = r * innerRatio;
  const d = `M ${round(cx - r)},${round(cy)} A ${round(r)},${round(r)} 0 1,0 ${round(cx + r)},${round(cy)} A ${round(ir)},${round(r * 0.98)} 0 1,1 ${round(cx - r)},${round(cy)} Z`;
  const t = rotate ? ` transform="rotate(${rotate} ${round(cx)} ${round(cy)})"` : "";
  return `<path d="${d}" fill="${fill}"${t}/>`;
}

// simple pointed leaf shape
function leaf(cx, cy, w, h, fill, rotate = 0, extra = "") {
  const d = `M ${round(cx)},${round(cy - h / 2)} C ${round(cx + w / 2)},${round(cy - h / 4)} ${round(cx + w / 2)},${round(cy + h / 4)} ${round(cx)},${round(cy + h / 2)} C ${round(cx - w / 2)},${round(cy + h / 4)} ${round(cx - w / 2)},${round(cy - h / 4)} ${round(cx)},${round(cy - h / 2)} Z`;
  const t = rotate ? ` transform="rotate(${rotate} ${round(cx)} ${round(cy)})"` : "";
  return `<path d="${d}" fill="${fill}"${t} ${extra}/>`;
}

// tiny 5-petal flower blob
function flower(cx, cy, r, petalFill, centerFill, rotate = 0) {
  let petals = "";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 2 * Math.PI;
    const px = cx + Math.cos(a) * r * 0.72;
    const py = cy + Math.sin(a) * r * 0.72;
    petals += ellipse(px, py, r * 0.62, r * 0.44, petalFill, (a * 180) / Math.PI);
  }
  const t = rotate ? ` transform="rotate(${rotate} ${round(cx)} ${round(cy)})"` : "";
  return group(petals + circle(cx, cy, r * 0.42, centerFill), t.trim().replace(/^transform="|"$/g, ""));
}

function heart(cx, cy, s, fill) {
  const d = `M ${round(cx)},${round(cy + s * 0.75)} C ${round(cx - s * 1.3)},${round(cy - s * 0.2)} ${round(cx - s * 0.5)},${round(cy - s * 1.15)} ${round(cx)},${round(cy - s * 0.35)} C ${round(cx + s * 0.5)},${round(cy - s * 1.15)} ${round(cx + s * 1.3)},${round(cy - s * 0.2)} ${round(cx)},${round(cy + s * 0.75)} Z`;
  return `<path d="${d}" fill="${fill}"/>`;
}

// soft blobby cloud from overlapping circles
function cloudBlob(cx, cy, s, fill) {
  return group(
    circle(cx - s * 0.9, cy + s * 0.15, s * 0.55, fill) +
      circle(cx - s * 0.15, cy - s * 0.25, s * 0.7, fill) +
      circle(cx + s * 0.75, cy + s * 0.1, s * 0.58, fill) +
      ellipse(cx, cy + s * 0.45, s * 1.35, s * 0.55, fill)
  );
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
// Deck palettes
// ---------------------------------------------------------------------

const DECKS = {
  garden: {
    bgFrom: "#FFF6EC",
    bgTo: "#FBDCE6",
    accent: "#F1A0BE",
    ink: "#5B4636",
    mascotBody: "#C6ECD4",
    mascotBody2: "#AEE0C2",
    cheeks: "#F6A9C0",
    palette: ["#F6A9C0", "#B7E4C7", "#FFE2AE", "#BFE3F2"],
    motif: "garden",
  },
  night: {
    bgFrom: "#E9E4F7",
    bgTo: "#CBDCF2",
    accent: "#8C8CD9",
    ink: "#332F5C",
    mascotBody: "#D9D3F6",
    mascotBody2: "#C5BDF0",
    cheeks: "#F6C6D0",
    palette: ["#8C8CD9", "#C9C2EC", "#BBD6F2", "#FBE28A"],
    motif: "night",
  },
  shop: {
    bgFrom: "#F5EAFD",
    bgTo: "#E4F6EA",
    accent: "#B78CE0",
    ink: "#4A2F5E",
    mascotBody: "#DCC2F2",
    mascotBody2: "#CBA8ED",
    cheeks: "#F3B6D0",
    palette: ["#C9A6EA", "#F3B6D0", "#A8DFC0", "#FBF0DD"],
    motif: "shop",
  },
};

// ---------------------------------------------------------------------
// Mascot per deck
// ---------------------------------------------------------------------

function mascot(deckId, cx, cy, scale = 1, opts = {}) {
  const d = DECKS[deckId];
  const s = scale;
  const { closedEyes = false, mouth = "smile" } = opts;

  const eyes = closedEyes
    ? sleepyEye(cx - 12 * s, cy - 4 * s, 5 * s, d.ink, 2.5 * s) +
      sleepyEye(cx + 12 * s, cy - 4 * s, 5 * s, d.ink, 2.5 * s)
    : circle(cx - 12 * s, cy - 6 * s, 3.2 * s, d.ink) + circle(cx + 12 * s, cy - 6 * s, 3.2 * s, d.ink);

  const mouthShape =
    mouth === "o"
      ? ellipse(cx, cy + 8 * s, 4 * s, 5 * s, d.ink)
      : smileCurve(cx, cy + 3 * s, 8 * s, 6 * s, d.ink, 2.5 * s);

  const cheeks = circle(cx - 19 * s, cy + 4 * s, 4.5 * s, d.cheeks, 'opacity="0.85"') +
    circle(cx + 19 * s, cy + 4 * s, 4.5 * s, d.cheeks, 'opacity="0.85"');

  const face = eyes + mouthShape + cheeks;

  if (deckId === "garden") {
    const body =
      ellipse(cx - 22 * s, cy - 44 * s, 8 * s, 18 * s, d.mascotBody2, -18) +
      ellipse(cx + 22 * s, cy - 44 * s, 8 * s, 18 * s, d.mascotBody2, 18) +
      ellipse(cx, cy, 38 * s, 34 * s, d.mascotBody) +
      ellipse(cx - 16 * s, cy + 32 * s, 9 * s, 6 * s, d.mascotBody2) +
      ellipse(cx + 16 * s, cy + 32 * s, 9 * s, 6 * s, d.mascotBody2);
    return group(body + face);
  }

  if (deckId === "night") {
    const body =
      cloudBlob(cx, cy, 36 * s, d.mascotBody) +
      sparkle(cx - 24 * s, cy - 20 * s, 8 * s, "#FBE28A");
    return group(body + face);
  }

  // shop: teardrop imp with tiny horns
  const body =
    `<path d="M ${round(cx)},${round(cy - 40 * s)} C ${round(cx + 34 * s)},${round(cy - 34 * s)} ${round(cx + 36 * s)},${round(cy + 20 * s)} ${round(cx)},${round(cy + 36 * s)} C ${round(cx - 36 * s)},${round(cy + 20 * s)} ${round(cx - 34 * s)},${round(cy - 34 * s)} ${round(cx)},${round(cy - 40 * s)} Z" fill="${d.mascotBody}"/>` +
    ellipse(cx - 10 * s, cy - 38 * s, 4 * s, 7 * s, d.mascotBody2, -20) +
    ellipse(cx + 10 * s, cy - 38 * s, 4 * s, 7 * s, d.mascotBody2, 20);
  return group(body + face);
}

// ---------------------------------------------------------------------
// Deck-specific background scatter motifs
// ---------------------------------------------------------------------

function motifShape(deckId, kind, cx, cy, r, palette) {
  const [c1, c2, c3, c4] = palette;
  switch (kind) {
    case "flower":
      return flower(cx, cy, r, c1, c4);
    case "leaf":
      return leaf(cx, cy, r * 1.1, r * 1.8, c2, Math.random() * 60 - 30);
    case "heart":
      return heart(cx, cy, r * 0.7, c1);
    case "star":
      return sparkle(cx, cy, r, c4);
    case "star5":
      return starN(cx, cy, r, r * 0.42, 5, c4);
    case "cloud":
      return cloudBlob(cx, cy, r, c3);
    case "moon":
      return crescent(cx, cy, r, 0.55, c1);
    case "bottle":
      return bottlePrim(cx, cy, r * 0.06, c2, c1);
    case "key":
      return keyPrim(cx, cy, r * 0.06, c1);
    case "candle":
      return candlePrim(cx, cy, r * 0.07, c4, c1);
    default:
      return "";
  }
}

const MOTIF_SETS = {
  garden: ["flower", "leaf", "heart", "flower", "leaf"],
  night: ["star", "cloud", "star5", "star", "cloud"],
  shop: ["bottle", "key", "candle", "star", "bottle"],
};

function scatterBackground(deckId, seedIndex) {
  const d = DECKS[deckId];
  const set = MOTIF_SETS[deckId];
  const spots = [
    [46, 92],
    [252, 108],
    [44, 372],
    [256, 350],
    [150, 88],
  ];
  let out = "";
  spots.forEach(([x, y], i) => {
    const kind = set[(i + seedIndex) % set.length];
    const r = 12 + ((i * 7 + seedIndex * 3) % 6);
    out += group(motifShape(deckId, kind, x, y, r, d.palette), "") ;
  });
  return `<g opacity="0.55">${out}</g>`;
}

// ---------------------------------------------------------------------
// Small object primitives used by both accessories and card backs
// ---------------------------------------------------------------------

function bottlePrim(cx, cy, s, bodyFill, liquidFill) {
  return group(
    rect(cx - 5 * s, cy - 30 * s, 10 * s, 10 * s, 2 * s, "#B79A6B") +
      `<path d="M ${round(cx - 9 * s)},${round(cy - 20 * s)} L ${round(cx - 13 * s)},${round(cy - 4 * s)} C ${round(cx - 15 * s)},${round(cy + 22 * s)} ${round(cx + 15 * s)},${round(cy + 22 * s)} ${round(cx + 13 * s)},${round(cy - 4 * s)} L ${round(cx + 9 * s)},${round(cy - 20 * s)} Z" fill="${bodyFill}" fill-opacity="0.9"/>` +
      `<path d="M ${round(cx - 12 * s)},${round(cy + 2 * s)} C ${round(cx - 13 * s)},${round(cy + 18 * s)} ${round(cx + 13 * s)},${round(cy + 18 * s)} ${round(cx + 12 * s)},${round(cy + 2 * s)} Z" fill="${liquidFill}"/>` +
      sparkle(cx, cy - 8 * s, 4 * s, "#FFFFFF", 0)
  );
}

function keyPrim(cx, cy, s, fill) {
  return group(
    circle(cx - 14 * s, cy, 9 * s, "none", `stroke="${fill}" stroke-width="${4 * s}"`) +
      rect(cx - 6 * s, cy - 2.5 * s, 26 * s, 5 * s, 2 * s, fill) +
      rect(cx + 12 * s, cy + 2.5 * s, 4 * s, 6 * s, 1 * s, fill) +
      rect(cx + 18 * s, cy + 2.5 * s, 4 * s, 9 * s, 1 * s, fill)
  );
}

function candlePrim(cx, cy, s, flameFill, bodyFill) {
  return group(
    rect(cx - 6 * s, cy - 6 * s, 12 * s, 30 * s, 2 * s, bodyFill) +
      circle(cx, cy - 8 * s, 9 * s, "#FFF7E0", 'opacity="0.6"') +
      `<path d="M ${round(cx)},${round(cy - 20 * s)} C ${round(cx + 6 * s)},${round(cy - 12 * s)} ${round(cx + 3 * s)},${round(cy - 6 * s)} ${round(cx)},${round(cy - 4 * s)} C ${round(cx - 3 * s)},${round(cy - 6 * s)} ${round(cx - 6 * s)},${round(cy - 12 * s)} ${round(cx)},${round(cy - 20 * s)} Z" fill="${flameFill}"/>`
  );
}

// ---------------------------------------------------------------------
// Per-card center illustration (mascot + accessory), keyed by short id
// ---------------------------------------------------------------------

const CX = 150;
const CY = 232;

function illustration(deckId, shortId) {
  const d = DECKS[deckId];
  const [c1, c2, c3, c4] = d.palette;
  const ink = d.ink;

  switch (shortId) {
    case "fool":
      return group(
        sparkle(CX - 46, CY - 70, 8, c4) +
          sparkle(CX + 50, CY - 60, 6, c4, 20) +
          mascot(deckId, CX, CY, 1.05, { mouth: "o" }) +
          ellipse(CX + 40, CY + 38, 12, 9, c2) +
          line(CX + 40, CY + 30, CX + 40, CY + 18, "#B79A6B", 3)
      );
    case "magician":
      return group(
        line(CX + 30, CY - 10, CX + 54, CY - 54, ink, 4) +
          starN(CX + 56, CY - 58, 9, 4, 5, c4) +
          mascot(deckId, CX - 6, CY + 4, 1) +
          sparkle(CX - 40, CY - 30, 6, c1)
      );
    case "high-priestess":
      return group(
        crescent(CX, CY - 78, 22, 0.55, c3, 200) +
          mascot(deckId, CX, CY + 8, 1) +
          rect(CX - 22, CY + 42, 44, 10, 3, c1) +
          line(CX, CY + 42, CX, CY + 52, ink, 2)
      );
    case "empress":
      return group(
        mascot(deckId, CX, CY + 6, 1) +
          flower(CX - 16, CY - 46, 9, c1, c4) +
          flower(CX, CY - 52, 10, c1, c4) +
          flower(CX + 16, CY - 46, 9, c1, c4) +
          leaf(CX - 30, CY - 20, 10, 18, c2, -20) +
          leaf(CX + 30, CY - 20, 10, 18, c2, 20)
      );
    case "emperor":
      return group(
        rect(CX - 26, CY + 30, 52, 16, 4, c2) +
          mascot(deckId, CX, CY, 1) +
          `<path d="M ${CX - 14},${CY - 46} L ${CX - 8},${CY - 60} L ${CX},${CY - 48} L ${CX + 8},${CY - 60} L ${CX + 14},${CY - 46} Z" fill="${c4}"/>` +
          circle(CX - 8, CY - 60, 2.6, c1) +
          circle(CX + 8, CY - 60, 2.6, c1) +
          circle(CX, CY - 48, 2.6, c1)
      );
    case "lovers":
      return group(
        mascot(deckId, CX - 34, CY + 6, 0.78) +
          mascot(deckId, CX + 34, CY + 6, 0.78) +
          heart(CX, CY - 26, 11, c1)
      );
    case "chariot":
      return group(
        rect(CX - 30, CY + 6, 60, 30, 8, c2) +
          circle(CX - 24, CY + 44, 11, ink) +
          circle(CX + 24, CY + 44, 11, ink) +
          circle(CX - 24, CY + 44, 5, c4) +
          circle(CX + 24, CY + 44, 5, c4) +
          `<path d="M ${CX + 22},${CY - 10} L ${CX + 22},${CY - 34} L ${CX + 40},${CY - 24} Z" fill="${c1}"/>` +
          mascot(deckId, CX - 4, CY - 6, 0.85)
      );
    case "strength":
      return group(
        ellipse(CX + 26, CY + 14, 20, 16, c1) +
          `<path d="M ${CX + 10},${CY + 2} L ${CX + 4},${CY - 10} L ${CX + 16},${CY - 6} Z" fill="${c1}"/>` +
          circle(CX + 20, CY + 8, 2.4, ink) +
          circle(CX + 32, CY + 8, 2.4, ink) +
          mascot(deckId, CX - 16, CY + 4, 0.95)
      );
    case "hermit":
      return group(
        mascot(deckId, CX, CY + 6, 1) +
          rect(CX + 28, CY - 4, 16, 20, 3, c2) +
          circle(CX + 36, CY + 4, 6, c4) +
          line(CX + 36, CY - 4, CX + 36, CY - 14, ink, 2.5)
      );
    case "wheel-of-fortune":
      return group(
        circle(CX, CY, 40, "none", `stroke="${c1}" stroke-width="6"`) +
          line(CX - 40, CY, CX + 40, CY, c1, 4) +
          line(CX, CY - 40, CX, CY + 40, c1, 4) +
          line(CX - 28, CY - 28, CX + 28, CY + 28, c1, 4) +
          line(CX - 28, CY + 28, CX + 28, CY - 28, c1, 4) +
          circle(CX, CY, 10, c4) +
          sparkle(CX - 48, CY - 20, 6, c4) +
          sparkle(CX + 50, CY + 14, 6, c4)
      );
    case "justice":
      return group(
        mascot(deckId, CX, CY + 10, 1) +
          line(CX, CY - 38, CX, CY - 4, ink, 3) +
          line(CX - 22, CY - 30, CX + 22, CY - 30, ink, 3) +
          circle(CX - 22, CY - 16, 8, c1) +
          circle(CX + 22, CY - 16, 8, c1) +
          line(CX - 22, CY - 30, CX - 22, CY - 24, ink, 2) +
          line(CX + 22, CY - 30, CX + 22, CY - 24, ink, 2)
      );
    case "death":
      return group(
        `<path d="M ${CX - 26},${CY + 20} Q ${CX - 30},${CY - 4} ${CX - 20},${CY - 20}" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>` +
          flower(CX - 20, CY - 22, 9, "#C9C2B8", "#ADA69A") +
          `<path d="M ${CX + 20},${CY + 20} Q ${CX + 24},${CY - 6} ${CX + 22},${CY - 24}" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>` +
          flower(CX + 22, CY - 26, 11, c1, c4) +
          mascot(deckId, CX, CY + 26, 0.75)
      );
    case "temperance":
      return group(
        mascot(deckId, CX, CY, 1) +
          ellipse(CX - 34, CY + 30, 10, 7, c2) +
          ellipse(CX + 34, CY + 30, 10, 7, c2) +
          wavyPath(CX - 26, CY + 22, CX + 26, 10, c3, 3)
      );
    case "devil":
      return group(
        mascot(deckId, CX, CY, 1) +
          `<path d="M ${CX - 12},${CY - 40} L ${CX - 6},${CY - 30} L ${CX - 16},${CY - 30} Z" fill="${c1}"/>` +
          `<path d="M ${CX + 12},${CY - 40} L ${CX + 6},${CY - 30} L ${CX + 16},${CY - 30} Z" fill="${c1}"/>` +
          circle(CX - 14, CY + 40, 7, "none", `stroke="${ink}" stroke-width="3"`) +
          circle(CX + 14, CY + 40, 7, "none", `stroke="${ink}" stroke-width="3"`)
      );
    case "star":
      return group(
        starN(CX, CY - 66, 16, 7, 5, c4) +
          ellipse(CX, CY + 40, 40, 12, c3, 0, 'opacity="0.7"') +
          mascot(deckId, CX - 4, CY + 4, 0.95) +
          ellipse(CX - 30, CY + 16, 8, 6, c2) +
          ellipse(CX + 30, CY + 16, 8, 6, c2)
      );
    case "moon":
      return group(
        crescent(CX, CY - 60, 24, 0.5, c4, 200) +
          circle(CX - 30, CY - 62, 2, ink) +
          circle(CX + 24, CY - 50, 2, ink) +
          mascot(deckId, CX, CY + 14, 0.95, { closedEyes: true }) +
          dottedPath(
            [
              [CX - 30, CY + 44],
              [CX - 10, CY + 48],
              [CX + 10, CY + 48],
              [CX + 30, CY + 44],
            ],
            ink,
            2.4
          )
      );
    case "sun":
      return group(
        circle(CX, CY - 10, 30, c4, 'opacity="0.9"') +
          [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const rad = (a * Math.PI) / 180;
            const x1 = CX + Math.cos(rad) * 38;
            const y1 = CY - 10 + Math.sin(rad) * 38;
            const x2 = CX + Math.cos(rad) * 48;
            const y2 = CY - 10 + Math.sin(rad) * 48;
            return line(x1, y1, x2, y2, c4, 4);
          }).join("") +
          mascot(deckId, CX, CY, 0.95) +
          flower(CX + 34, CY + 42, 8, c1, c4)
      );
    case "judgement":
      return group(
        `<path d="M ${CX - 10},${CY - 20} L ${CX + 14},${CY - 30} L ${CX + 14},${CY - 8} Z" fill="${c2}"/>` +
          circle(CX + 16, CY - 19, 6, c2) +
          sparkle(CX + 30, CY - 30, 7, c4) +
          sparkle(CX + 36, CY - 14, 5, c4) +
          mascot(deckId, CX - 10, CY + 10, 1)
      );
    case "world":
      return group(
        [0, 60, 120, 180, 240, 300].map((a) => {
          const rad = (a * Math.PI) / 180;
          const x = CX + Math.cos(rad) * 46;
          const y = CY + Math.sin(rad) * 46;
          return leaf(x, y, 12, 20, c2, a);
        }).join("") +
          mascot(deckId, CX, CY, 0.95) +
          sparkle(CX - 44, CY, 5, c4) +
          sparkle(CX + 44, CY, 5, c4)
      );
    default:
      return mascot(deckId, CX, CY, 1);
  }
}

// ---------------------------------------------------------------------
// Card meanings (short id, number, names) — mirrors src/data/cardMeanings.ts
// ---------------------------------------------------------------------

const CARDS = [
  ["00-fool", 0, "fool", "0", "바보"],
  ["01-magician", 1, "magician", "I", "마법사"],
  ["02-high-priestess", 2, "high-priestess", "II", "여사제"],
  ["03-empress", 3, "empress", "III", "여황제"],
  ["04-emperor", 4, "emperor", "IV", "황제"],
  ["05-lovers", 5, "lovers", "V", "연인"],
  ["06-chariot", 6, "chariot", "VI", "전차"],
  ["07-strength", 7, "strength", "VII", "힘"],
  ["08-hermit", 8, "hermit", "VIII", "은둔자"],
  ["09-wheel-of-fortune", 9, "wheel-of-fortune", "IX", "운명의 수레바퀴"],
  ["10-justice", 10, "justice", "X", "정의"],
  ["11-death", 11, "death", "XI", "죽음"],
  ["12-temperance", 12, "temperance", "XII", "절제"],
  ["13-devil", 13, "devil", "XIII", "악마"],
  ["14-star", 14, "star", "XIV", "별"],
  ["15-moon", 15, "moon", "XV", "달"],
  ["16-sun", 16, "sun", "XVI", "태양"],
  ["17-judgement", 17, "judgement", "XVII", "심판"],
  ["18-world", 18, "world", "XVIII", "세계"],
];

// ---------------------------------------------------------------------
// Card frame (shared) + card back
// ---------------------------------------------------------------------

function fontStack() {
  return "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif";
}

function cardSvg(deckId, shortId, num, symbol, koreanName, englishName, seedIndex) {
  const d = DECKS[deckId];
  const gid = `bg-${deckId}-${shortId}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="${d.bgFrom}"/>
      <stop offset="1" stop-color="${d.bgTo}"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="26" fill="url(#${gid})"/>
  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="20" fill="none" stroke="${d.accent}" stroke-width="2" stroke-opacity="0.6" stroke-dasharray="1 7" stroke-linecap="round"/>
  ${scatterBackground(deckId, seedIndex)}
  <circle cx="42" cy="46" r="18" fill="${d.accent}" opacity="0.9"/>
  <text x="42" y="52" text-anchor="middle" font-family="${fontStack()}" font-size="14" font-weight="700" fill="#ffffff">${symbol}</text>
  ${illustration(deckId, shortId)}
  <line x1="90" y1="378" x2="210" y2="378" stroke="${d.accent}" stroke-width="1.5" stroke-opacity="0.7"/>
  <text x="150" y="408" text-anchor="middle" font-family="${fontStack()}" font-size="23" font-weight="700" fill="${d.ink}">${koreanName}</text>
  <text x="150" y="428" text-anchor="middle" font-family="${fontStack()}" font-size="10.5" letter-spacing="1.5" fill="${d.ink}" opacity="0.65">${englishName.toUpperCase()}</text>
</svg>
`;
}

function backSvg(deckId) {
  const d = DECKS[deckId];
  const gid = `back-${deckId}`;
  const set = MOTIF_SETS[deckId];
  let pattern = "";
  const rows = 6;
  const cols = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 40 + c * 74 + (r % 2 === 0 ? 0 : 37);
      const y = 40 + r * 68;
      if (x > W - 30 || y > H - 30) continue;
      const kind = set[(r + c) % set.length];
      pattern += group(motifShape(deckId, kind, x, y, 10, d.palette), "");
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${d.bgFrom}"/>
      <stop offset="1" stop-color="${d.bgTo}"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="26" fill="url(#${gid})"/>
  <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="20" fill="none" stroke="${d.accent}" stroke-width="2.5"/>
  <g opacity="0.55">${pattern}</g>
  <circle cx="${W / 2}" cy="${H / 2}" r="46" fill="${d.accent}" opacity="0.95"/>
  <circle cx="${W / 2}" cy="${H / 2}" r="46" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.7"/>
  ${mascot(deckId, W / 2, H / 2 + 4, 0.8)}
</svg>
`;
}

// ---------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------

for (const deckId of Object.keys(DECKS)) {
  const dir = path.join(OUT_ROOT, deckId);
  mkdirSync(dir, { recursive: true });

  CARDS.forEach(([id, num, shortId, symbol, koreanName], index) => {
    const englishName = id
      .split("-")
      .slice(1)
      .join(" ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const svg = cardSvg(deckId, shortId, num, symbol, koreanName, englishName, index);
    writeFileSync(path.join(dir, `${id}.svg`), svg, "utf8");
  });

  writeFileSync(path.join(dir, "back.svg"), backSvg(deckId), "utf8");
  console.log(`Generated ${CARDS.length + 1} SVGs for deck "${deckId}"`);
}

console.log("Done.");
