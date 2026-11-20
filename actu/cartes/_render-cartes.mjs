// Pays d'Omer — cartes de rubrique pour les posts d'actualité (1080x1350, 4:5)
// Même langage visuel que les carrousels « en chiffres » (Fraunces / Public Sans, palette Blanc marine).
// Usage : node render-cartes.mjs <dossier de sortie>
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire("/opt/npm-tools/node_modules/");
const { chromium } = require("playwright");

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || path.join(here, "out"));
const fonts = path.join(here, "node_modules", "@fontsource");

const C = { ink: "#0F1E2E", paper: "#F7F8F6", teal: "#2F6E78", brick: "#D9825A", ochre: "#E3B23C", mist: "#9FB3BC", grey: "#5D6B72", rule: "#D8DEDB", tealLight: "#BFD6DA" };
const SERIF = "font-family:'Fraunces',Georgia,serif;";
const SANS = "font-family:'Public Sans',system-ui,sans-serif;";
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const dataFont = (p) => `url('data:font/woff2;base64,${fs.readFileSync(p).toString("base64")}') format('woff2')`;
const fontCss = [
  ...[300, 500].map((w) => `@font-face{font-family:'Fraunces';font-weight:${w};font-style:normal;src:${dataFont(`${fonts}/fraunces/files/fraunces-latin-${w}-normal.woff2`)}}`),
  `@font-face{font-family:'Fraunces';font-weight:300;font-style:italic;src:${dataFont(`${fonts}/fraunces/files/fraunces-latin-300-italic.woff2`)}}`,
  ...[400, 600, 700].map((w) => `@font-face{font-family:'Public Sans';font-weight:${w};src:${dataFont(`${fonts}/public-sans/files/public-sans-latin-${w}-normal.woff2`)}}`),
].join("");

// fond du bloc haut, couleur du surtitre, couleur du titre, couleur de l'en-tête, couleur des cercles
const THEMES = {
  teal: { bg: C.teal, kicker: C.ochre, title: C.paper, head: C.tealLight, ring: "rgba(247,248,246,.4)" },
  ink: { bg: C.ink, kicker: C.ochre, title: C.paper, head: C.mist, ring: "rgba(247,248,246,.28)" },
  brick: { bg: C.brick, kicker: C.ink, title: C.ink, head: "rgba(15,30,46,.72)", ring: "rgba(15,30,46,.3)" },
  ochre: { bg: C.ochre, kicker: C.ink, title: C.ink, head: "rgba(15,30,46,.72)", ring: "rgba(15,30,46,.3)" },
};

const CARTES = [
  { slug: "essentiel", theme: "ink", kicker: "Chaque jour à 7 h 30", titre: "L'essentiel", sous: "du matin", size: 150, chiffres: [["5", "infos locales"], ["1", "minute de lecture"], ["7 h 30", "tous les matins"]] },
  { slug: "alerte", theme: "brick", kicker: "À savoir maintenant", titre: "Alerte", sous: "info pratique", mots: ["Météo", "Routes", "Réseaux"] },
  { slug: "travaux", theme: "ochre", kicker: "Ce qui change sur vos trajets", titre: "Travaux", sous: "& circulation", mots: ["Chantiers", "Déviations", "Stationnement"] },
  { slug: "commerce", theme: "teal", kicker: "Ça ouvre, ça bouge, ça change", titre: "Commerce", sous: "& artisans", mots: ["Ouvertures", "Reprises", "Nouveautés"] },
  { slug: "economie", theme: "ink", kicker: "Ceux qui font travailler l'Audomarois", titre: "Économie", sous: "& emploi", mots: ["Entreprises", "Emploi", "Industrie"] },
  { slug: "vie-locale", theme: "teal", kicker: "Ce qui change au quotidien", titre: "Vie locale", sous: "près de chez vous", mots: ["Écoles", "Santé", "Services"] },
  { slug: "sport", theme: "brick", kicker: "Les résultats et les exploits d'ici", titre: "Sport", sous: "côté clubs", mots: ["Clubs", "Résultats", "Rendez-vous"] },
  { slug: "sortir", theme: "ochre", kicker: "À voir, à faire ces jours-ci", titre: "Sortir", sous: "dans l'Audomarois", size: 150, mots: ["Concerts", "Marchés", "Expos"] },
  { slug: "nature", theme: "teal", kicker: "L'eau, la terre, le vivant", titre: "Marais", sous: "& nature", mots: ["Marais", "Aa", "Environnement"] },
];

function carte(c) {
  const t = THEMES[c.theme];
  const cells = c.chiffres
    ? c.chiffres.map(([n, l], k) => `<div style="display:flex;flex-direction:column;gap:8px;${k < 2 ? `padding-right:24px;border-right:1px solid ${C.rule}` : ""}"><div style="${SERIF}font-weight:300;font-size:92px;line-height:.95;letter-spacing:-.03em;color:${k === 2 ? C.brick : C.ink};white-space:nowrap">${esc(n)}</div><div style="font-size:22px;color:${C.grey}">${esc(l)}</div></div>`).join("")
    : c.mots.map((m, k) => `<div style="display:flex;flex-direction:column;gap:14px;${k < 2 ? `padding-right:24px;border-right:1px solid ${C.rule}` : ""}"><div style="font-size:18px;font-weight:700;letter-spacing:.2em;color:${k === 2 ? C.brick : C.teal}">0${k + 1}</div><div style="${SERIF}font-weight:500;font-size:40px;line-height:1;letter-spacing:-.01em;color:${C.ink};white-space:nowrap">${esc(m)}</div></div>`).join("");
  return `<div style="width:1080px;height:1350px;box-sizing:border-box;display:flex;flex-direction:column;background:${C.paper};color:${C.ink};${SANS}overflow:hidden">
<div style="flex:0 0 860px;box-sizing:border-box;padding:76px 80px 76px;background:${t.bg};display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">
<div style="display:flex;justify-content:space-between;align-items:center;font-size:20px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${t.head}"><div>Pays d'Omer</div><div>L'actu de l'Audomarois</div></div>
<div style="display:flex;flex-direction:column;gap:22px"><div style="font-size:23px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${t.kicker}">${esc(c.kicker)}</div><h1 style="margin:0;${SERIF}font-weight:500;font-size:${c.size || 176}px;line-height:.92;letter-spacing:-.03em;color:${t.title}">${esc(c.titre)}<br><span style="font-weight:300;font-style:italic;font-size:${Math.round((c.size || 176) * 0.74)}px">${esc(c.sous)}</span></h1></div>
<div style="position:absolute;right:-190px;top:-190px;width:520px;height:520px;border-radius:50%;border:1.5px solid ${t.ring}"></div><div style="position:absolute;right:-90px;top:-90px;width:320px;height:320px;border-radius:50%;border:1.5px solid ${t.ring}"></div></div>
<div style="flex:1 1 auto;box-sizing:border-box;padding:64px 80px 68px;display:flex;flex-direction:column;justify-content:space-between"><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px">${cells}</div>
<div style="display:flex;flex-direction:column;gap:22px"><div style="display:flex;flex-direction:column;gap:5px"><div style="height:3px;background:${C.ink}"></div><div style="height:1px;background:${C.teal}"></div></div><div style="display:flex;justify-content:space-between;align-items:baseline"><div style="display:flex;align-items:baseline;gap:14px"><div style="${SERIF}font-weight:500;font-size:34px;letter-spacing:-.01em">Pays d'Omer</div><div style="font-size:16px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${C.grey}">La lettre de l'Audomarois</div></div><div style="${SERIF}font-weight:500;font-size:28px">paysdomer.fr</div></div></div></div></div>`;
}

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
for (const c of CARTES) {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${fontCss} html,body{margin:0;padding:0;background:#fff}</style></head><body>${carte(c)}</body></html>`;
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(out, `${c.slug}.jpg`), type: "jpeg", quality: 88, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  console.log("ok", c.slug);
}
await browser.close();
