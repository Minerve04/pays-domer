// Pays d'Omer — calendrier de l'Avent de l'Audomarois : 24 questions-chiffres + carte de clôture (1080x1350)
// Usage : node render-avent.mjs   (lit cases.json, écrit out/2026-12-JJ.jpg et out/2026-12-JJ.json)
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(process.env.PLAYWRIGHT_ROOT || "/opt/npm-tools/node_modules/");
const { chromium } = require("playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "out");
const fonts = process.env.FONTS_ROOT || "/home/claude/cartes-build/node_modules/@fontsource";
const cases = JSON.parse(fs.readFileSync(path.join(here, "cases.json"), "utf8"));

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
const THEMES = [
  { bg: C.teal, kicker: C.ochre, title: C.paper, head: C.tealLight, ring: "rgba(247,248,246,.4)", num: C.ochre },
  { bg: C.ink, kicker: C.ochre, title: C.paper, head: C.mist, ring: "rgba(247,248,246,.28)", num: C.ochre },
  { bg: C.brick, kicker: C.ink, title: C.ink, head: "rgba(15,30,46,.72)", ring: "rgba(15,30,46,.3)", num: C.ink },
  { bg: C.ochre, kicker: C.ink, title: C.ink, head: "rgba(15,30,46,.72)", ring: "rgba(15,30,46,.3)", num: C.ink },
];
const footer = (droite) => `<div style="display:flex;flex-direction:column;gap:22px"><div style="display:flex;flex-direction:column;gap:5px"><div style="height:3px;background:${C.ink}"></div><div style="height:1px;background:${C.teal}"></div></div><div style="display:flex;justify-content:space-between;align-items:baseline"><div style="display:flex;align-items:baseline;gap:14px"><div style="${SERIF}font-weight:500;font-size:34px;letter-spacing:-.01em">Pays d'Omer</div><div style="font-size:16px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${C.grey}">La lettre de l'Audomarois</div></div><div style="font-size:22px;font-weight:600">${esc(droite)}</div></div></div>`;
const head = (t) => `<div style="display:flex;justify-content:space-between;align-items:center;font-size:20px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${t.head}"><div>Pays d'Omer</div><div>Calendrier de l'Avent</div></div>`;
const rings = (t) => `<div style="position:absolute;right:-190px;top:-190px;width:520px;height:520px;border-radius:50%;border:1.5px solid ${t.ring}"></div><div style="position:absolute;right:-90px;top:-90px;width:320px;height:320px;border-radius:50%;border:1.5px solid ${t.ring}"></div>`;

function carte(c, n) {
  const t = THEMES[(n - 1) % 4];
  const qs = c.q.length > 100 ? 62 : c.q.length > 80 ? 68 : c.q.length > 60 ? 76 : 86;
  const longest = Math.max(...c.o.map((o) => o.length));
  const os = longest > 10 ? 44 : longest > 7 ? 54 : 66;
  const cells = c.o.map((o, k) => `<div style="display:flex;flex-direction:column;gap:12px;${k < 2 ? `padding-right:24px;border-right:1px solid ${C.rule}` : ""}"><div style="font-size:22px;font-weight:700;letter-spacing:.2em;color:${C.teal}">${"ABC"[k]}</div><div style="${SERIF}font-weight:${os < 60 ? 500 : 300};font-size:${os}px;line-height:1;letter-spacing:-.02em;color:${C.ink};white-space:nowrap">${esc(o)}</div></div>`).join("");
  return `<div style="width:1080px;height:1350px;box-sizing:border-box;display:flex;flex-direction:column;background:${C.paper};color:${C.ink};${SANS}overflow:hidden">
<div style="flex:0 0 880px;box-sizing:border-box;padding:76px 80px 72px;background:${t.bg};display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">${head(t)}
<div style="display:flex;flex-direction:column;gap:30px"><div style="display:flex;align-items:center;gap:22px"><div style="width:104px;height:104px;border-radius:50%;border:2.5px solid ${t.num};color:${t.num};display:flex;align-items:center;justify-content:center;${SERIF}font-size:56px;font-weight:500">${n}</div><div style="font-size:23px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${t.kicker}">Case ${n} sur 24 · à votre avis ?</div></div>
<h1 style="margin:0;${SERIF}font-weight:500;font-size:${qs}px;line-height:1.04;letter-spacing:-.025em;color:${t.title};text-wrap:balance">${esc(c.q).replace(/ \?/g, "\u00a0?").replace(/(\S+-\S+)/g, '<span style="white-space:nowrap">$1</span>')}</h1></div>${rings(t)}</div>
<div style="flex:1 1 auto;box-sizing:border-box;padding:56px 80px 64px;display:flex;flex-direction:column;justify-content:space-between"><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px">${cells}</div>${footer("Réponse demain à 19 h")}</div></div>`;
}
function cloture() {
  const t = THEMES[1];
  const cells = [["24", "cases ouvertes"], ["24", "chiffres sourcés"], ["53", "communes"]].map(([n, l], k) => `<div style="display:flex;flex-direction:column;gap:8px;${k < 2 ? `padding-right:24px;border-right:1px solid ${C.rule}` : ""}"><div style="${SERIF}font-weight:300;font-size:92px;line-height:.95;letter-spacing:-.03em;color:${k === 2 ? C.brick : C.ink}">${n}</div><div style="font-size:22px;color:${C.grey}">${l}</div></div>`).join("");
  return `<div style="width:1080px;height:1350px;box-sizing:border-box;display:flex;flex-direction:column;background:${C.paper};color:${C.ink};${SANS}overflow:hidden">
<div style="flex:0 0 880px;box-sizing:border-box;padding:76px 80px 72px;background:${t.bg};display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">${head(t)}
<div style="display:flex;flex-direction:column;gap:22px"><div style="font-size:23px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${t.kicker}">Merci d'avoir joué</div><h1 style="margin:0;${SERIF}font-weight:500;font-size:176px;line-height:.92;letter-spacing:-.03em;color:${t.title}">Joyeux<br><span style="font-weight:300;font-style:italic">Noël</span></h1></div>${rings(t)}</div>
<div style="flex:1 1 auto;box-sizing:border-box;padding:56px 80px 64px;display:flex;flex-direction:column;justify-content:space-between"><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px">${cells}</div>${footer("paysdomer.fr")}</div></div>`;
}

const pad = (n) => String(n).padStart(2, "0");
const reponse = (c, n) => `Réponse de la case ${n} : ${c.r}, ${c.rep}. ${c.exp}\nSource : ${c.src}.`;
function texte(n) {
  if (n === 25) return `CALENDRIER DE L'AVENT DE L'AUDOMAROIS · JOYEUX NOËL\n\n${reponse(cases[23], 24)}\n\n24 cases, 24 chiffres sur l'Audomarois, tous sourcés. Merci d'avoir joué.\n\nLequel vous a le plus surpris ?\n\nL'Audomarois en chiffres revient chaque jeudi : paysdomer.fr\n#SaintOmer #Audomarois #PaysdOmer`;
  const c = cases[n - 1];
  const hier = n > 1 ? `\n\n${reponse(cases[n - 2], n - 1)}` : `\n\nJusqu'au 24 décembre, chaque soir à 19 h : un chiffre de l'Audomarois à deviner, et la réponse le lendemain.`;
  return `CALENDRIER DE L'AVENT DE L'AUDOMAROIS · CASE ${n} SUR 24\n\n${c.q}\nA. ${c.o[0]}\nB. ${c.o[1]}\nC. ${c.o[2]}\n\nVotre réponse en commentaire : A, B ou C ? Réponse demain à 19 h.${hier}\n\n#SaintOmer #Audomarois #PaysdOmer`;
}

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
for (let n = 1; n <= 25; n++) {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${fontCss} html,body{margin:0;padding:0;background:#fff}</style></head><body>${n === 25 ? cloture() : carte(cases[n - 1], n)}</body></html>`;
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  const overflow = await page.evaluate(() => { const h = document.querySelector("h1"); const p = h.closest("div[style*='880px']"); return p.scrollHeight > p.clientHeight + 1; });
  if (overflow) console.log("DÉBORDEMENT case", n);
  await page.screenshot({ path: path.join(out, `2026-12-${pad(n)}.jpg`), type: "jpeg", quality: 88, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  fs.writeFileSync(path.join(out, `2026-12-${pad(n)}.json`), JSON.stringify({ case: n, texte: texte(n) }, null, 1));
}
await browser.close();
console.log("ok", fs.readdirSync(out).length, "fichiers");
