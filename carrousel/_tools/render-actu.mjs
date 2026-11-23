// Pays d'Omer — visuel des posts d'actualité (1080x1350), rendu par GitHub Actions.
// Entrée : un ou plusieurs fichiers actu/rendu/*.txt déposés par le scénario Make 8237576.
//   creneau: matin | midi | soir
//   categorie: essentiel | alerte | travaux | commerce | economie | vie-locale | sport | sortir | nature
//   date: lundi 23 novembre
//   titre: titre court du post
//   chapo: une phrase de résumé
//   ---
//   <texte complet du post>
// Sortie : le JPEG de même nom à côté du .txt.
// Usage : node carrousel/_tools/render-actu.mjs actu/rendu/2026-11-23-matin-073012.txt [...]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const fonts = path.join(here, "node_modules", "@fontsource");

const C = { ink: "#0F1E2E", paper: "#F7F8F6", teal: "#2F6E78", brick: "#D9825A", ochre: "#E3B23C", mist: "#9FB3BC", grey: "#5D6B72", rule: "#D8DEDB", tealLight: "#BFD6DA" };
const SERIF = "font-family:'Fraunces',Georgia,serif;";
const SANS = "font-family:'Public Sans',system-ui,sans-serif;";
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nb = (s) => esc(s).replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« ");
const dataFont = (p) => `url('data:font/woff2;base64,${fs.readFileSync(p).toString("base64")}') format('woff2')`;
const fontCss = [
  ...[300, 500].map((w) => `@font-face{font-family:'Fraunces';font-weight:${w};font-style:normal;src:${dataFont(`${fonts}/fraunces/files/fraunces-latin-${w}-normal.woff2`)}}`),
  `@font-face{font-family:'Fraunces';font-weight:300;font-style:italic;src:${dataFont(`${fonts}/fraunces/files/fraunces-latin-300-italic.woff2`)}}`,
  ...[400, 600, 700].map((w) => `@font-face{font-family:'Public Sans';font-weight:${w};src:${dataFont(`${fonts}/public-sans/files/public-sans-latin-${w}-normal.woff2`)}}`),
].join("");

const THEMES = {
  teal: { bg: C.teal, kicker: C.ochre, title: C.paper, head: C.tealLight, ring: "rgba(247,248,246,.4)" },
  ink: { bg: C.ink, kicker: C.ochre, title: C.paper, head: C.mist, ring: "rgba(247,248,246,.28)" },
  brick: { bg: C.brick, kicker: C.ink, title: C.ink, head: "rgba(15,30,46,.72)", ring: "rgba(15,30,46,.3)" },
  ochre: { bg: C.ochre, kicker: C.ink, title: C.ink, head: "rgba(15,30,46,.72)", ring: "rgba(15,30,46,.3)" },
};
const THEME_OF = { alerte: "brick", travaux: "ochre", commerce: "teal", economie: "ink", "vie-locale": "teal", sport: "brick", sortir: "ochre", nature: "teal", essentiel: "ink" };

function parse(txt) {
  const i = txt.indexOf("\n---\n");
  const head = i >= 0 ? txt.slice(0, i) : "";
  const post = (i >= 0 ? txt.slice(i + 5) : txt).replace(/\r/g, "");
  const meta = {};
  for (const l of head.split("\n")) {
    const m = l.match(/^(\w+):\s?(.*)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  return { meta, post };
}

const head = (t, droite) => `<div style="display:flex;justify-content:space-between;align-items:center;font-size:20px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${t.head}"><div>Pays d'Omer</div><div>${esc(droite)}</div></div>`;
const rings = (t) => `<div style="position:absolute;right:-190px;top:-190px;width:520px;height:520px;border-radius:50%;border:1.5px solid ${t.ring}"></div><div style="position:absolute;right:-90px;top:-90px;width:320px;height:320px;border-radius:50%;border:1.5px solid ${t.ring}"></div>`;
const footer = (droite) => `<div style="flex:0 0 auto;display:flex;flex-direction:column;gap:20px"><div style="display:flex;flex-direction:column;gap:5px"><div style="height:3px;background:${C.ink}"></div><div style="height:1px;background:${C.teal}"></div></div><div style="display:flex;justify-content:space-between;align-items:baseline"><div style="display:flex;align-items:baseline;gap:14px"><div style="${SERIF}font-weight:500;font-size:32px;letter-spacing:-.01em">Pays d'Omer</div><div style="font-size:15px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${C.grey}">La lettre de l'Audomarois</div></div><div style="${SERIF}font-weight:500;font-size:26px">${esc(droite)}</div></div></div>`;

// L'essentiel du matin : en-tête court, puis les infos numérotées.
function essentiel(meta, post) {
  const t = THEMES.ink;
  const items = post.split("\n").map((l) => l.match(/^\s*(\d+)\.\s+(.+)$/)).filter(Boolean).slice(0, 6).map((m) => {
    let s = m[2].trim();
    let src = "";
    const p = s.match(/\s*\(([^()]{2,90})\)\.?\s*$/);
    if (p) { src = p[1]; s = s.slice(0, p.index).trim(); }
    let commune = "";
    const d = s.match(/^([^—–]{2,40}?)\s+[—–]\s+(.+)$/);
    if (d) { commune = d[1].trim(); s = d[2].trim(); }
    return { commune, fait: s.replace(/\.$/, "") + ".", src };
  });
  const lis = items.map((it, k) => `<div class="it" style="display:flex;gap:26px;padding:0 0 22px;${k < items.length - 1 ? `border-bottom:1px solid ${C.rule};margin-bottom:22px;` : ""}">
<div style="${SERIF}font-weight:300;font-size:46px;line-height:1;color:${k === 0 ? C.brick : C.teal};min-width:44px">${k + 1}</div>
<div style="display:flex;flex-direction:column;gap:8px;flex:1"><div style="font-size:17px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${C.teal}">${esc(it.commune)}${it.src ? `<span style="font-weight:600;letter-spacing:.04em;text-transform:none;color:${C.grey}"> · ${esc(it.src)}</span>` : ""}</div>
<div class="f" style="${SERIF}font-weight:500;font-size:var(--fs);line-height:1.18;letter-spacing:-.01em;color:${C.ink};text-wrap:pretty">${nb(it.fait)}</div></div></div>`).join("");
  return `<div style="width:1080px;height:1350px;box-sizing:border-box;display:flex;flex-direction:column;background:${C.paper};color:${C.ink};${SANS}overflow:hidden">
<div style="flex:0 0 auto;box-sizing:border-box;padding:56px 80px 46px;background:${t.bg};position:relative;overflow:hidden;display:flex;flex-direction:column;gap:34px">${head(t, "L'actu de l'Audomarois")}
<div style="display:flex;flex-direction:column;gap:14px"><div style="font-size:21px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${t.kicker}">${esc(meta.date || "")}</div>
<h1 style="margin:0;${SERIF}font-weight:500;font-size:92px;line-height:.95;letter-spacing:-.03em;color:${t.title}">L'essentiel <span style="font-weight:300;font-style:italic">du matin</span></h1></div>${rings(t)}</div>
<div id="corps" style="flex:1 1 auto;min-height:0;box-sizing:border-box;padding:44px 80px 0;display:flex;flex-direction:column;justify-content:flex-start;overflow:hidden">${lis}</div>
<div style="flex:0 0 auto;padding:24px 80px 52px">${footer("paysdomer.fr")}</div></div>`;
}

// Midi et soir : rubrique, titre, chapo.
function une(meta, post) {
  const t = THEMES[THEME_OF[meta.categorie] || "teal"];
  const kicker = (post.split("\n").find((l) => l.trim()) || "").trim();
  return `<div style="width:1080px;height:1350px;box-sizing:border-box;display:flex;flex-direction:column;background:${C.paper};color:${C.ink};${SANS}overflow:hidden">
<div style="flex:0 0 860px;box-sizing:border-box;padding:70px 80px 70px;background:${t.bg};display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">${head(t, meta.date || "L'actu de l'Audomarois")}
<div id="corps" style="flex:1 1 auto;display:flex;flex-direction:column;justify-content:flex-start;gap:26px;min-height:0;overflow:hidden;padding-top:40px"><div style="margin-top:auto;font-size:23px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:${t.kicker}">${esc(kicker)}</div>
<h1 class="f" style="margin:0;${SERIF}font-weight:500;font-size:var(--fs);line-height:1.02;letter-spacing:-.025em;color:${t.title};text-wrap:balance">${nb(meta.titre || "")}</h1></div>${rings(t)}</div>
<div style="flex:1 1 auto;box-sizing:border-box;padding:52px 80px 52px;display:flex;flex-direction:column;justify-content:space-between"><div style="${SERIF}font-weight:300;font-size:34px;line-height:1.25;color:${C.ink}">${nb(meta.chapo || "")}</div>${footer("paysdomer.fr")}</div></div>`;
}

const files = process.argv.slice(2).filter((f) => f.endsWith(".txt"));
if (!files.length) { console.log("Aucun fichier .txt"); process.exit(0); }
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
for (const f of files) {
  const { meta, post } = parse(fs.readFileSync(f, "utf8"));
  const matin = meta.creneau === "matin" || meta.categorie === "essentiel";
  const body = matin ? essentiel(meta, post) : une(meta, post);
  await page.setContent(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${fontCss} html,body{margin:0;padding:0;background:#fff}</style></head><body>${body}</body></html>`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  // Taille de texte la plus grande qui tient dans le cadre.
  const tailles = matin ? [38, 36, 34, 32, 30, 28, 26, 24] : [120, 108, 98, 90, 82, 74, 66, 58];
  for (const fs_ of tailles) {
    const deborde = await page.evaluate((v) => {
      document.querySelectorAll(".f").forEach((e) => e.style.setProperty("--fs", v + "px"));
      const c = document.getElementById("corps");
      return c.scrollHeight > c.clientHeight + 12;
    }, fs_);
    if (!deborde) break;
  }
  await page.waitForTimeout(100);
  const out = f.replace(/\.txt$/, ".jpg");
  await page.screenshot({ path: out, type: "jpeg", quality: 88, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  console.log("ok", out);
}
await browser.close();
