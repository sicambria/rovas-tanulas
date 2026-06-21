/*
 * SPDX-License-Identifier: AGPL-3.0-or-later · © 2026 · github.com/sicambria/rovas-tanulas
 *
 * glyphs.js — Hungarian rovás (Székely–magyar rovásírás) letterforms.
 *
 * Each glyph is an ORDERED array of strokes (SVG path "d" strings) on a
 * 0..100 viewBox. Ordered so the UI can animate stroke-by-stroke drawing,
 * which is a real pedagogical aid for an 8-year-old.
 *
 * The forms follow the **Forrai Sándor** alphabet as taught in Friedrich Klára:
 * rovás teaching reference. The shapes were derived cell by cell from that
 * guide's alphabet tables (pages 36–37). Rovás is written RIGHT-TO-LEFT.
 *
 * Note: Dz and Dzs are not part of the 39-letter Forrai ábécé (they are written
 * as ligatures there); their forms come from the modern unified standard.
 *
 * Path commands are restricted to M / L / C / Q / Z so the forms can be
 * crisply in the browser.
 */
(function (root) {
  'use strict';

  var GLYPHS = {
    // ── Lesson 1 — Ilona ──────────────────────────────
    'A': ['M64,12 L64,88', 'M64,12 L16,52', 'M16,52 L70,52'],            // 👩 Anya — stem + leftward-pointing tip
    'Á': ['M64,14 L20,40 L64,66', 'M64,14 L64,66', 'M64,66 L64,86'],     // 🤰 Áldott — rounded belly ◁ + stem
    'B': ['M20,14 L80,86', 'M80,14 L20,86'],                            // 🪚 Bak — X (sawhorse)

    // ── Lesson 2 ──────────────────────────────────────────────
    'C': ['M50,88 L50,16', 'M32,38 L50,14 L68,38'],                     // 🎯 Cél — ↑
    'Cs': ['M31,14 L29,84', 'M71,14 L68,84', 'M31,44 L71,14', 'M69,44 L30,66'],
    'D': ['M50,12 L50,88', 'M36,62 L64,40'],                            // 🗡️ Dárda — stem + diagonal crossbar across the middle (Forrai)

    // ── Lesson 3 ──────────────────────────────────────────────
    'Dz': ['M28,14 L28,86', 'M54,14 L54,86', 'M28,36 L54,22', 'M28,62 L54,48', 'M54,46 L76,46'], // 💪 Edzés — ladder + arm
    'Dzs': ['M50,14 L50,86', 'M30,16 L50,38', 'M70,16 L50,38', 'M30,54 L70,54'],                 // 🌴 Dzsungel — trunk + foliage + vine (¥)
    'E': ['M34,12 L56,32', 'M56,12 L34,32', 'M45,32 L50,62', 'M34,62 L56,82', 'M56,62 L34,82'], // 🌲 Erdő — top X + stem + bottom X (Forrai)

    // ── Lesson 4 — Göncöl ───────────────────────────────
    'É': ['M58,14 L48,27 L55,46 L51,63 L43,71 L47,83'],                 // ☁️ Égbolt — full-height S-curl, betuk skeleton (Forrai)
    'F': ['M50,16 C30,22 30,78 50,84', 'M50,16 C70,22 70,78 50,84', 'M40,42 L60,60', 'M60,42 L40,60'], // 🌍 Föld — circle + X (Forrai)
    'G': ['M25,83 L51,22 L64,41 L67,56', 'M47,83 L61,57 L67,56', 'M75,82 L67,56'], // 🔺 Gúla — Λ + bottom-right fork to junction, betuk skeleton (Forrai)

    // ── Lesson 5 ──────────────────────────────────────────────
    'Gy': ['M50,12 L50,88', 'M30,40 L70,32', 'M30,64 L70,56'],         // 🌱 Gyökér — stem + two slanted bars
    'H': ['M30,12 C74,35 74,65 30,88', 'M70,12 C26,35 26,65 70,88'],   // ⏳ Homokóra — két ív, kétszer keresztezve, középen "szem" (Forrai)
    'I': ['M50,12 L50,88', 'M34,42 L66,20'],                          // 🧭 Iránytű — | + egyenes átló 75%-nál (Forrai)

    // ── Lesson 6 ──────────────────────────────────────────────
    'Í': ['M50,12 L50,88', 'M34,24 L66,2'],                           // 🏹 Íj — | + egyenes átló a tetején (100%) (Forrai)
    'J': ['M54,14 L54,86', 'M54,14 L30,33'],                          // 🧊 Jég — | + long flag
    'K': ['M50,12 L78,50 L50,88 L22,50 Z'],                           // 🪨 Kő — rhombus ◇

    // ── Lesson 7 — Levente ───────────────────────────────
    'L': ['M51,19 L37,42 L23,83', 'M51,19 L63,48', 'M44,81 L55,55 L63,48', 'M76,83 L69,67 L63,48', 'M61,81 L69,67'], // 🐎 Ló — left stem + fan-from-junction, betuk skeleton (Forrai)
    'Ly': ['M50,16 C30,22 30,78 50,84', 'M50,16 C70,22 70,78 50,84', 'M34,72 L66,28'], // 🕳️ Lyuk — circle + diagonal slash (Forrai)
    'M': ['M66,14 L66,86', 'M66,20 L34,33 L66,46', 'M66,52 L34,65 L66,78'], // 🦅 Madár — vertical + 2 triangles

    // ── Lesson 8 ──────────────────────────────────────────────
    'N': ['M50,15 C84,33 84,67 50,85'],                               // ☀️ Nap — deep arc, open to the left
    'Ny': ['M34,15 L34,85', 'M34,15 C76,28 76,72 34,85'],             // 🐇 Nyúl — D shape
    'O': ['M34,32 C30,16 62,16 64,40 C66,64 50,84 36,78'],            // 🦁 Oroszlán — ring opening left, with curled-in ends (Forrai)

    // ── Lesson 9 ──────────────────────────────────────────────
    'Ó': ['M30,34 C30,18 54,12 62,24 C72,38 66,64 50,74 C36,82 28,68 34,58 C39,50 50,50 52,58 C53,63 47,63 44,59'], // 🗿 Óriás — large inward-coiling spiral (Forrai)
    'Ö': ['M40,12 L40,88', 'M40,50 L66,26', 'M40,50 L66,74'],         // 🐂 Ökör — stem + two arms to the right ("k") (Forrai)
    'Ő': ['M26,34 C26,18 50,12 58,24 C68,38 62,64 46,74 C32,82 24,68 30,58 C35,50 46,50 48,58 C49,63 43,63 40,59', 'M52,46 L78,28', 'M52,46 L76,62'], // 👴 Ős — spiral + right-side curl (Forrai)

    // ── Lesson 10 — Ildikó ────────────────────────────
    'P': ['M56,12 L56,88', 'M56,22 L36,38', 'M56,42 L36,52', 'M56,62 L37,70'], // 🛡️ Pajzs — right stem + three teeth down-left (Forrai)
    'R': ['M30,86 L30,15', 'M70,86 L70,17', 'M30,57 L70,31'],        // 🪟 Rács — két szár + alacsonyan futó átló (Forrai)
    'S': ['M28,84 L50,16 L72,84'],                                   // ⛺ Sátor — Λ

    // ── Lesson 11 ─────────────────────────────────────────────
    'Sz': ['M50,12 L50,88'],                                         // 🧵 Szál — |
    'T': ['M59,85 L61,15', 'M38,15 L59,39'],                         // 🔥 Tűz — vertical + single upper-left diagonal (asymmetric Y), betuk skeleton (Forrai)
    'Ty': ['M21,15 L50,44 L69,67 L78,82', 'M75,15 L50,45 L22,79', 'M23,37 L34,29 L45,17', 'M75,63 L69,71 L58,83'], // 🐔 Tyúk — X + tip serifs (small crossbars), betuk skeleton (Forrai)

    // ── Lesson 12 ─────────────────────────────────────────────
    'U': ['M22,18 L22,82', 'M78,18 L78,82', 'M22,18 L50,44 L78,18', 'M22,82 L50,56 L78,82'], // 🏘️ Utca — two sides + inward tip (Forrai)
    'Ú': ['M22,18 L22,82', 'M78,18 L78,82', 'M22,18 L78,82', 'M78,18 L22,82'], // 🧩 Útvesztő — frame + X (Forrai)
    'Ü': ['M37,16 L35,53 L64,42', 'M64,42 L62,83'],                  // 🫕 Üst — left stem + connector + straight descender, betuk skeleton (Forrai)

    // ── Lesson 13 — Királyi Hírnök ────────────────────────────
    'Ű': ['M50,16 C26,22 26,80 50,84', 'M50,16 C74,22 74,80 50,84', 'M40,20 L22,10', 'M60,20 L78,10', 'M40,80 L22,90', 'M60,80 L78,90'], // 🛸 Űrhajó — oval + four protrusions (Forrai)
    'V': ['M25,82 L25,18 L51,42 L75,18 L75,82'],                     // 💧 Víz — M with vertical sides, betuk skeleton (Forrai)
    'Z': ['M22,12 L22,84', 'M74,12 L74,84', 'M22,40 L74,16', 'M22,60 L74,36', 'M22,82 L74,56'], // 🏴 Zászló — two stems + three slanted bars (Forrai)
    'Zs': ['M50,14 L50,86', 'M30,16 L50,38', 'M70,16 L50,38']        // ⚔️ Zsákmány — Ψ forked top
  };

  // Canonical letter order (the 40 standard letters taught in the game).
  var ORDER = [
    'A','Á','B','C','Cs','D','Dz','Dzs','E','É','F','G','Gy','H','I','Í','J','K',
    'L','Ly','M','N','Ny','O','Ó','Ö','Ő','P','R','S','Sz','T','Ty','U','Ú','Ü',
    'Ű','V','Z','Zs'
  ];

  // Rovás numerals (per chapter III/5 of the Friedrich guide) — kept separate
  // from the letters so the recognizer and tests can focus on the 40 letters.
  var NUMBERS = {
    '1': ['M50,16 L50,84'],                                              // |
    '5': ['M28,22 L50,80 L72,22'],                                       // V
    '10': ['M24,16 L76,84', 'M76,16 L24,84'],                           // X
    '50': ['M28,24 L50,80 L72,24', 'M50,50 L50,84'],                    // V + stem
    '100': ['M26,18 L74,82', 'M74,18 L26,82', 'M50,10 L50,90'],         // X + |
    '1000': ['M26,18 L74,82', 'M74,18 L26,82', 'M50,10 L50,90', 'M14,50 L86,50'] // ✳
  };

  var api = { GLYPHS: GLYPHS, ORDER: ORDER, NUMBERS: NUMBERS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ROVAS_GLYPHS = api;
})(typeof window !== 'undefined' ? window : globalThis);
