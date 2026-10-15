// Pays d'Omer — moteur de rendu des carrousels « en chiffres »
// Usage : node render.mjs <dossier du carrousel>   (lit slides.json, écrit 01.jpg … NN.jpg)
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(process.argv[2]);
const spec = JSON.parse(fs.readFileSync(path.join(dir, "slides.json"), "utf8"));
const fonts = path.join(here, "node_modules", "@fontsource");

const C = { ink: "#0F1E2E", paper: "#F7F8F6", teal: "#2F6E78", brick: "#D9825A", ochre: "#E3B23C", mist: "#9FB3BC", grey: "#5D6B72", rule: "#D8DEDB", tealLight: "#BFD6DA", tealText: "#E3ECEE", inkText: "#C9D3D8" };
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const SERIF = "font-family:'Fraunces',Georgia,serif;";
const SANS = "font-family:'Public Sans',system-ui,sans-serif;";

const dataFont = (p) => `url('data:font/woff2;base64,${fs.readFileSync(p).toString("base64")}') format('woff2')`;
const fontCss = [300, 500, 700].map((w) => `@font-face{font-family:'Fraunces';font-weight:${w};src:${dataFont(`${fonts}/fraunces/files/fraunces-latin-${w}-normal.woff2`)}}`)
  .concat([400, 500, 600, 700].map((w) => `@font-face{font-family:'Public Sans';font-weight:${w};src:${dataFont(`${fonts}/public-sans/files/public-sans-latin-${w}-normal.woff2`)}}`)).join("");

const total = spec.slides.length;
const pad = (n) => String(n).padStart(2, "0");

function header(i, dark, accent) {
  const col = dark ? C.mist : C.grey;
  return `<div style="display:flex;justify-content:space-between;align-items:center;font-size:20px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${col}"><div>${esc(spec.rubrique || "L'Audomarois en chiffres")}</div><div style="display:flex;align-items:center;gap:12px"><span style="color:${accent}">${pad(i)}</span><span>/ ${pad(total)}</span></div></div>`;
}
function footer(dark, source, accentLine) {
  const line = dark ? C.paper : C.ink; const txt = dark ? C.mist : C.grey; const site = dark ? C.paper : C.ink;
  return `<div style="display:flex;flex-direction:column;gap:22px"><div style="display:flex;flex-direction:column;gap:5px"><div style="height:3px;background:${line}"></div><div style="height:1px;background:${accentLine || C.teal}"></div></div><div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-size:18px;color:${txt}">${esc(source || "")}</div><div style="${SERIF}font-weight:500;font-size:26px;color:${site}">paysdomer.fr</div></div></div>`;
}
function surtitre(text, col) { return `<div style="font-size:22px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:${col}">${esc(text)}</div>`; }
const frame = (bg, color, inner) => `<div style="width:1080px;height:1080px;box-sizing:border-box;padding:80px;display:flex;flex-direction:column;justify-content:space-between;background:${bg};color:${color};${SANS}position:relative;overflow:hidden">${inner}</div>`;
const big = (txt, size, col) => `<div style="${SERIF}font-weight:300;font-size:${size}px;line-height:.9;letter-spacing:-.04em;color:${col};white-space:nowrap">${esc(txt)}</div>`;
const rich = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600">$1</strong>');

const T = {
  // Couverture : bloc couleur + 3 chiffres teasers
  cover(s) {
    const acc = s.accent || C.teal;
    const teasers = (s.teasers || []).map((t, k) => `<div style="display:flex;flex-direction:column;gap:6px;${k < 2 ? `padding-right:24px;border-right:1px solid ${C.rule}` : ""}"><div style="${SERIF}font-weight:300;font-size:96px;line-height:.95;letter-spacing:-.03em;color:${k === 2 ? C.brick : C.ink};white-space:nowrap">${esc(t.n)}</div><div style="font-size:20px;color:${C.grey}">${esc(t.l)}</div></div>`).join("");
    return `<div style="width:1080px;height:1080px;box-sizing:border-box;display:flex;flex-direction:column;background:${C.paper};color:${C.ink};${SANS}overflow:hidden">
<div style="flex:0 0 620px;box-sizing:border-box;padding:72px 80px 64px;background:${acc};color:${C.paper};display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">
<div style="display:flex;justify-content:space-between;align-items:center;font-size:20px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${C.tealLight}"><div>Pays d'Omer</div><div style="display:flex;align-items:center;gap:14px"><div style="width:44px;height:44px;border-radius:50%;border:2px solid ${C.ochre};color:${C.ochre};display:flex;align-items:center;justify-content:center;${SERIF}font-size:24px;font-weight:500;letter-spacing:0">${esc(s.numero || "")}</div><div>${esc(s.serie || "")}</div></div></div>
<div style="display:flex;flex-direction:column;gap:18px"><div style="font-size:22px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${C.ochre}">${esc(s.kicker || "Chaque jeudi, un sujet, des chiffres sourcés")}</div><h1 style="margin:0;${SERIF}font-weight:500;font-size:${s.titleSize || 128}px;line-height:.92;letter-spacing:-.03em;color:${C.paper}">${esc(s.titre)}<br><span style="font-weight:300;font-style:italic">${esc(s.sousTitre || "en chiffres")}</span></h1></div>
<div style="position:absolute;right:-170px;top:-170px;width:460px;height:460px;border-radius:50%;border:1.5px solid rgba(247,248,246,.45)"></div><div style="position:absolute;right:-80px;top:-80px;width:280px;height:280px;border-radius:50%;border:1.5px solid rgba(247,248,246,.3)"></div></div>
<div style="flex:1 1 auto;box-sizing:border-box;padding:52px 80px 64px;display:flex;flex-direction:column;justify-content:space-between"><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px">${teasers}</div>
<div style="display:flex;flex-direction:column;gap:22px"><div style="display:flex;flex-direction:column;gap:5px"><div style="height:3px;background:${C.ink}"></div><div style="height:1px;background:${C.teal}"></div></div><div style="display:flex;justify-content:space-between;align-items:baseline"><div style="display:flex;align-items:baseline;gap:14px"><div style="${SERIF}font-weight:500;font-size:34px;letter-spacing:-.01em">Pays d'Omer</div><div style="font-size:16px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${C.grey}">La lettre de l'Audomarois</div></div><div style="font-size:22px;font-weight:600;display:flex;align-items:center;gap:10px">${total} repères, faites défiler <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg></div></div></div></div></div>`;
  },
  // Chiffre-clé + 2 repères + texte (fond papier ou marine)
  kpi(s, i) {
    const dark = s.fond === "marine"; const bg = dark ? C.ink : C.paper; const fg = dark ? C.paper : C.ink; const acc = s.accent || C.brick;
    const reps = (s.reperes || []).map((r) => `<div style="display:flex;flex-direction:column;gap:6px"><div style="${SERIF}font-weight:500;font-size:72px;line-height:1;letter-spacing:-.02em;color:${dark ? C.paper : C.ink}">${esc(r.n)}</div><div style="font-size:24px;color:${dark ? C.mist : C.grey}">${esc(r.l)}</div></div>`).join("");
    return frame(bg, fg, `${header(i, dark, acc)}<div style="display:flex;flex-direction:column;gap:10px">${surtitre(s.surtitre, dark ? C.mist : C.teal)}<div style="display:flex;align-items:baseline;gap:28px">${big(s.chiffre, s.taille || 300, dark ? C.paper : acc)}<div style="${SERIF}font-weight:500;font-size:64px;line-height:1;color:${fg};padding-bottom:14px">${esc(s.unite)}</div></div><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:40px;margin-top:36px;padding-top:32px;border-top:1px solid ${dark ? "rgba(247,248,246,.25)" : C.rule}">${reps}</div><p style="margin:36px 0 0;font-size:30px;line-height:1.4;color:${dark ? C.inkText : "#14263A"};max-width:880px">${rich(s.texte)}</p></div>${footer(dark, s.source)}`);
  },
  // Fond sarcelle : grand chiffre, accroche, 2 repères ocre
  teal(s, i) {
    const reps = (s.reperes || []).map((r) => `<div style="display:flex;flex-direction:column;gap:8px"><div style="${SERIF}font-weight:500;font-size:64px;line-height:1;letter-spacing:-.02em;color:${C.ochre}">${esc(r.n)}</div><div style="font-size:24px;line-height:1.3;color:${C.tealText}">${esc(r.l)}</div></div>`).join("");
    return frame(C.teal, C.paper, `<div style="display:flex;justify-content:space-between;align-items:center;font-size:20px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${C.tealLight}"><div>${esc(spec.rubrique || "L'Audomarois en chiffres")}</div><div style="display:flex;align-items:center;gap:12px"><span style="color:${C.ochre}">${pad(i)}</span><span>/ ${pad(total)}</span></div></div><div style="display:flex;flex-direction:column;gap:10px">${surtitre(s.surtitre, C.tealLight)}<div style="display:flex;align-items:baseline;gap:24px;flex-wrap:wrap">${big(s.chiffre, s.taille || 250, C.paper)}<div style="${SERIF}font-weight:500;font-size:64px;line-height:1;color:${C.paper};padding-bottom:12px">${esc(s.unite)}</div></div><p style="margin:28px 0 0;font-size:34px;line-height:1.35;color:${C.paper};max-width:900px;${SERIF}font-weight:500">${esc(s.accroche)}</p><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:40px;margin-top:40px;padding-top:32px;border-top:1px solid rgba(247,248,246,.35)">${reps}</div></div>${footer(true, s.source, C.ochre)}`);
  },
  // Grand chiffre + 4 petites stats
  stats(s, i) {
    const acc = s.accent || C.brick;
    const cells = (s.stats || []).map((r, k, a) => `<div style="display:flex;flex-direction:column;gap:10px;${k < a.length - 1 ? `padding-right:20px;border-right:1px solid ${C.rule}` : ""}"><div style="${SERIF}font-weight:500;font-size:80px;line-height:1;letter-spacing:-.02em;color:${C.ink}">${esc(r.n)}</div><div style="font-size:22px;line-height:1.3;color:${C.grey}">${esc(r.l)}</div></div>`).join("");
    return frame(C.paper, C.ink, `${header(i, false, acc)}<div style="display:flex;flex-direction:column;gap:10px">${surtitre(s.surtitre, C.teal)}<div style="display:flex;align-items:baseline;gap:24px">${big(s.chiffre, s.taille || 180, acc)}<div style="${SERIF}font-weight:500;font-size:48px;line-height:1.05;color:${C.ink};padding-bottom:10px">${esc(s.unite).replace(/\n/g, "<br>")}</div></div><div style="display:grid;grid-template-columns:repeat(${(s.stats || []).length || 4},minmax(0,1fr));gap:24px;margin-top:44px;padding-top:32px;border-top:1px solid ${C.rule}">${cells}</div><p style="margin:40px 0 0;font-size:30px;line-height:1.4;color:#14263A;max-width:900px">${rich(s.texte)}</p></div>${footer(false, s.source)}`);
  },
  // Fond marine : chiffre + barres comparatives
  bars(s, i) {
    const acc = s.accent || C.brick;
    const rows = (s.barres || []).map((b) => `<div style="display:flex;align-items:center;gap:20px"><div style="width:150px;font-size:20px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${b.fort ? acc : C.mist};flex-shrink:0">${esc(b.l)}</div><div style="flex-grow:1;height:26px;display:flex"><div style="width:${Math.round((b.pct || 0) * 100)}%;height:100%;background:${b.fort ? acc : "#6FA3AB"}"></div></div><div style="width:210px;text-align:right;white-space:nowrap;${SERIF}font-size:32px;color:${b.fort ? acc : C.paper};flex-shrink:0">${esc(b.v)}</div></div>`).join("");
    return frame(C.ink, C.paper, `${header(i, true, acc)}<div style="display:flex;flex-direction:column;gap:10px">${surtitre(s.surtitre, C.mist)}<div style="display:flex;align-items:baseline;gap:24px">${big(s.chiffre, s.taille || 260, C.paper)}<div style="${SERIF}font-weight:500;font-size:56px;line-height:1.05;color:${C.paper};padding-bottom:12px">${esc(s.unite)}<br><span style="font-size:32px;font-weight:400;color:${C.mist}">${esc(s.sousUnite || "")}</span></div></div><div style="display:flex;flex-direction:column;gap:18px;margin-top:48px;padding-top:32px;border-top:1px solid rgba(247,248,246,.25)">${rows}</div><p style="margin:40px 0 0;font-size:30px;line-height:1.4;color:${C.inkText};max-width:900px">${rich(s.texte)}</p></div>${footer(true, s.source)}`);
  },
  // Deux cartes côte à côte
  cards(s, i) {
    const acc = s.accent || C.brick;
    const cards = (s.cartes || []).map((c, k) => `<div style="display:flex;flex-direction:column;gap:14px;padding:36px;background:#FFFFFF;border:1px solid ${C.rule}"><div style="font-size:20px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${k === 0 ? acc : C.teal}">${esc(c.kicker)}</div>${big(c.chiffre, 150, C.ink)}<div style="${SERIF}font-weight:500;font-size:36px;line-height:1.1;color:${C.ink}">${esc(c.unite)}</div><div style="height:1px;background:${C.rule};margin:10px 0"></div><div style="display:flex;align-items:baseline;gap:14px"><div style="${SERIF}font-weight:500;font-size:56px;line-height:1;color:${C.ink}">${esc(c.n2)}</div><div style="font-size:22px;line-height:1.3;color:${C.grey}">${esc(c.l2).replace(/\n/g, "<br>")}</div></div></div>`).join("");
    return frame(C.paper, C.ink, `${header(i, false, acc)}<div style="display:flex;flex-direction:column;gap:10px">${surtitre(s.surtitre, C.teal)}<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:48px;margin-top:12px">${cards}</div><p style="margin:40px 0 0;font-size:30px;line-height:1.4;color:#14263A;max-width:900px">${rich(s.texte)}</p></div>${footer(false, s.source)}`);
  },
  // Sources + prochain épisode (fond marine)
  sources(s, i) {
    const acc = s.accent || C.brick;
    const rows = (s.sources || []).map((r) => `<div style="display:flex;gap:24px;padding:18px 0;border-bottom:1px solid rgba(247,248,246,.18)"><div style="width:70px;${SERIF}font-size:28px;color:${acc};flex-shrink:0">${esc(r.n)}</div><div style="font-size:23px;line-height:1.35;color:${C.inkText}">${esc(r.t)}</div></div>`).join("");
    return frame(C.ink, C.paper, `${header(i, true, acc)}<div style="display:flex;flex-direction:column;gap:36px"><h2 style="margin:0;${SERIF}font-weight:300;font-size:92px;line-height:1;letter-spacing:-.02em;color:${C.paper}">${esc(s.titre || "Chaque chiffre a une source.").replace(/\n/g, "<br>")}</h2><div style="display:flex;flex-direction:column;border-top:1px solid rgba(247,248,246,.25)">${rows}</div><div style="display:flex;align-items:center;justify-content:space-between;gap:32px;padding:30px 36px;background:${acc};color:${C.ink}"><div style="display:flex;flex-direction:column;gap:4px"><div style="font-size:18px;font-weight:700;letter-spacing:.18em;text-transform:uppercase">Prochain épisode</div><div style="${SERIF}font-weight:500;font-size:34px;line-height:1.1">${esc(s.prochain || "")}</div></div><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg></div></div><div style="display:flex;flex-direction:column;gap:22px"><div style="display:flex;flex-direction:column;gap:5px"><div style="height:3px;background:${C.paper}"></div><div style="height:1px;background:${C.teal}"></div></div><div style="display:flex;justify-content:space-between;align-items:baseline"><div style="display:flex;align-items:baseline;gap:14px"><div style="${SERIF}font-weight:500;font-size:34px;letter-spacing:-.01em">Pays d'Omer</div><div style="font-size:16px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${C.mist}">La lettre de l'Audomarois</div></div><div style="font-size:22px;font-weight:500;color:${C.inkText}">Abonnez-vous sur paysdomer.fr</div></div></div>`);
  },
};

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
for (let i = 1; i <= total; i++) {
  const s = spec.slides[i - 1];
  const fn = T[s.type];
  if (!fn) throw new Error(`Type de slide inconnu : ${s.type}`);
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${fontCss} html,body{margin:0;padding:0;background:#fff}</style></head><body>${fn(s, i)}</body></html>`;
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  const out = path.join(dir, `${pad(i)}.jpg`);
  await page.screenshot({ path: out, type: "jpeg", quality: 85, clip: { x: 0, y: 0, width: 1080, height: 1080 } });
  console.log("ok", out);
}
await browser.close();
