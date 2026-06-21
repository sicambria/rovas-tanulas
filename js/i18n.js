/*
 * SPDX-License-Identifier: AGPL-3.0-or-later · © 2026 · github.com/sicambria/rovas-tanulas
 *
 * i18n.js — Interface localization (Hungarian / English / Spanish).
 *
 * Two layers are localized, by two different mechanisms:
 *
 *   1. UI CHROME (buttons, instructions, feedback, aria-labels) — looked up by
 *      key with t(key, params). The tables live in js/strings/{hu,en,es}.js.
 *
 *   2. CONTENT (the localizable fields of data.js: the per-letter teaching word /
 *      clue / meaning + shape story lines, lesson framing, minigame names, ranks,
 *      etc.) — applied as a per-locale OVERLAY merged in place onto the shared
 *      ROVAS_DATA object. Because we mutate the same object the other modules
 *      already hold a reference to (core.js, ui.js), no read-site churn is needed.
 *      The overlays live in js/content/{en,es}.js (Hungarian needs none — it is
 *      the base). Fields NOT in an overlay (emoji, letter order, proper names,
 *      the historical `fact`, the `emotional` vignettes, the decoded ISTEN words)
 *      stay Hungarian by design: that is the artifact being studied, not interface.
 *
 * The Hungarian mnemonic words double as the decode word bank (core.fullWordBank).
 * Reading rovás means reading HUNGARIAN, so that bank must stay Hungarian even when
 * the UI is English/Spanish — so on load we snapshot each letter's Hungarian word
 * into `huWord`, which core reads for the bank while `word` carries the localized
 * mnemonic for display.
 *
 * DOM-free and require()-able from Node (for the parity tests). Loading this module
 * does NOT change the active locale — it stays 'hu' (base untouched apart from the
 * huWord snapshot) until init()/setLocale() is called, so the existing Hungarian
 * unit tests keep passing without ever touching i18n.
 */
(function (root) {
  'use strict';

  var inNode = (typeof require !== 'undefined');

  var DATA    = inNode ? require('./data.js')        : root.ROVAS_DATA;

  // The shipped locale set. Order = display order in the language picker.
  // Hungarian is the base (no content overlay); every other locale loads a
  // strings table (js/strings/<code>.js) AND a content overlay (js/content/<code>.js).
  // To add or drop a language, edit this one list (and index.html's <script> tags).
  var LOCALES = ['hu'];

  var STRINGS = {};
  var OVERLAY = {};
  LOCALES.forEach(function (code) {
    var U = code.toUpperCase();
    STRINGS[code] = inNode ? require('./strings/' + code + '.js') : root['ROVAS_STRINGS_' + U];
    OVERLAY[code] = (code === 'hu') ? null
      : (inNode ? require('./content/' + code + '.js') : root['ROVAS_CONTENT_' + U]);
  });
  var LANG_KEY = 'rovas-lang-v1';

  // ── Deep clone / merge (plain JSON-shaped data only) ─────────
  function clone(x) {
    if (Array.isArray(x)) return x.map(clone);
    if (x && typeof x === 'object') { var o = {}; for (var k in x) if (x.hasOwnProperty(k)) o[k] = clone(x[k]); return o; }
    return x;
  }
  // Merge src into target IN PLACE. Objects recurse; arrays merge element-wise
  // (so a lessons overlay can carry just {title,intro,place} per index), and
  // primitives / mismatched element types replace.
  function deepMerge(target, src) {
    if (Array.isArray(src)) {
      for (var i = 0; i < src.length; i++) {
        if (src[i] && typeof src[i] === 'object' && target[i] && typeof target[i] === 'object') deepMerge(target[i], src[i]);
        else target[i] = clone(src[i]);
      }
      return target;
    }
    for (var k in src) {
      if (!src.hasOwnProperty(k)) continue;
      var v = src[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) {
        deepMerge(target[k], v);
      } else if (Array.isArray(v) && Array.isArray(target[k])) {
        deepMerge(target[k], v);
      } else {
        target[k] = clone(v);
      }
    }
    return target;
  }

  // ── Hungarian base snapshot (taken once, at load) ────────────
  // Freeze the Hungarian mnemonic word onto each letter so the decode word bank
  // stays Hungarian regardless of UI locale, then keep a pristine copy of the
  // whole DATA so we can restore before applying any overlay.
  (function snapshot() {
    if (DATA && DATA.letters) {
      for (var l in DATA.letters) {
        if (DATA.letters.hasOwnProperty(l) && DATA.letters[l].huWord == null) {
          DATA.letters[l].huWord = DATA.letters[l].word;
        }
      }
    }
  })();
  var BASE_HU = clone(DATA);

  // ── Locale state ─────────────────────────────────────────────
  var current = 'hu';

  // navigator.language codes that should map onto one of our locales but don't
  // share its prefix: Norwegian Bokmål/Nynorsk → 'no'.
  var ALIASES = { nb: 'no', nn: 'no' };
  function normalize(loc) {
    if (!loc) return null;
    loc = String(loc).toLowerCase();
    for (var i = 0; i < LOCALES.length; i++) if (loc === LOCALES[i] || loc.indexOf(LOCALES[i] + '-') === 0) return LOCALES[i];
    for (var a in ALIASES) if (ALIASES.hasOwnProperty(a) && (loc === a || loc.indexOf(a + '-') === 0) && LOCALES.indexOf(ALIASES[a]) >= 0) return ALIASES[a];
    return null;
  }

  // Stored choice → browser/system language → English fallback.
  function detect() {
    try { var saved = normalize(localStorage.getItem(LANG_KEY)); if (saved) return saved; } catch (e) {}
    try {
      var navs = (typeof navigator !== 'undefined') ? (navigator.languages || [navigator.language]) : [];
      for (var i = 0; i < navs.length; i++) { var n = normalize(navs[i]); if (n) return n; }
    } catch (e2) {}
    return 'hu';
  }

  // Remove keys/elements present in `target` but absent from `base`, in place.
  // deepMerge only adds/overrides — it never deletes — so without this a key that
  // exists ONLY in an overlay (e.g. isten.explain) would linger after switching
  // back to a locale whose base lacks it (en → hu would keep the English explain).
  function pruneToBase(target, base) {
    if (Array.isArray(target) && Array.isArray(base)) {
      if (target.length > base.length) target.length = base.length;
      for (var i = 0; i < target.length; i++) {
        if (target[i] && typeof target[i] === 'object' && base[i] && typeof base[i] === 'object') pruneToBase(target[i], base[i]);
      }
      return;
    }
    if (target && typeof target === 'object' && base && typeof base === 'object') {
      for (var k in target) {
        if (!target.hasOwnProperty(k)) continue;
        if (!base.hasOwnProperty(k)) { delete target[k]; continue; }
        if (target[k] && typeof target[k] === 'object') pruneToBase(target[k], base[k]);
      }
    }
  }

  // Apply a locale's content overlay onto the shared DATA object (in place).
  function applyContent(loc) {
    pruneToBase(DATA, BASE_HU);                 // drop any keys a prior overlay added
    deepMerge(DATA, clone(BASE_HU));            // restore Hungarian base values
    if (OVERLAY[loc]) deepMerge(DATA, OVERLAY[loc]);
  }

  function getLocale() { return current; }

  // Set the active locale: persist, mutate <html lang> + <title> + meta, rebuild
  // the localized content. Does NOT itself re-render — the caller (ui.js) does.
  function setLocale(loc) {
    loc = normalize(loc) || 'hu';
    current = loc;
    try { localStorage.setItem(LANG_KEY, loc); } catch (e) {}
    applyContent(loc);
    applyDocumentChrome(loc);
    return loc;
  }

  function applyDocumentChrome(loc) {
    if (typeof document === 'undefined') return;
    try {
      document.documentElement.setAttribute('lang', loc);
      var title = t('meta.title'); if (title) document.title = title;
      var desc = t('meta.description');
      var m = document.querySelector('meta[name="description"]');
      if (m && desc) m.setAttribute('content', desc);
      var skip = document.querySelector('.skiplink');
      var skipTxt = t('meta.skip');
      if (skip && skipTxt) skip.textContent = skipTxt;
    } catch (e) {}
  }

  // ── Lookup ───────────────────────────────────────────────────
  function lookup(table, key) {
    if (!table) return undefined;
    // dotted keys index nested objects/arrays: 'practice.smart.title', 'help.items'
    if (table.hasOwnProperty(key)) return table[key];
    var parts = key.split('.'), v = table;
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }

  function interpolate(s, params) {
    if (!params || typeof s !== 'string') return s;
    return s.replace(/\{(\w+)\}/g, function (m, name) { return params[name] != null ? params[name] : m; });
  }

  // t(key, params) — active locale, falling back to Hungarian, then the key itself.
  function t(key, params) {
    var v = lookup(STRINGS[current], key);
    if (v === undefined) v = lookup(STRINGS.hu, key);
    if (v === undefined) {
      // Loud in dev/test so missing keys surface; silent string in prod.
      if (typeof process !== 'undefined' && process.env && process.env.ROVAS_I18N_STRICT) throw new Error('Missing i18n key: ' + key);
      return key;
    }
    if (typeof v === 'string') return interpolate(v, params);
    return v; // arrays/objects (e.g. help.items) returned as-is
  }

  // Called by ui.js at boot: pick the locale and apply it.
  function init() { return setLocale(detect()); }

  var api = {
    LOCALES: LOCALES,
    t: t,
    detect: detect,
    init: init,
    getLocale: getLocale,
    setLocale: setLocale,
    // exposed for tests
    _strings: STRINGS,
    _overlays: OVERLAY,
    _applyContent: applyContent
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ROVAS_I18N = api;
})(typeof window !== 'undefined' ? window : globalThis);
