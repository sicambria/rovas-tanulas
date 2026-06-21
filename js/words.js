/*
 * SPDX-License-Identifier: AGPL-3.0-or-later · © 2026 · github.com/sicambria/rovas-tanulas
 *
 * words.js — Splitting Hungarian words into rovás glyphs + the word bank.
 *
 * Rovás writes the two-letter (and the three-letter Dzs) sounds with a SINGLE
 * glyph, so a word must be split into glyphs by longest-match (e.g. CSILLAG →
 * Cs·I·L·L·A·G, not C·S·I…). This digraph correctness is critical.
 *
 * In the game we display left-to-right (child-friendly, matching the reveal);
 * rovás was originally written right-to-left — we highlight this as a fun fact.
 */
(function (root) {
  'use strict';

  var GLYPHS = (typeof require !== 'undefined') ? require('./glyphs.js') : root.ROVAS_GLYPHS;
  var ORDER = GLYPHS.ORDER;

  // uppercase form → canonical letter label (e.g. "CS" → "Cs", "DZS" → "Dzs")
  var LOOKUP = {};
  ORDER.forEach(function (l) { LOOKUP[l.toUpperCase()] = l; });
  // descending by length, so we look for the longest match first
  var FORMS = Object.keys(LOOKUP).sort(function (a, b) { return b.length - a.length; });

  // Splits a Hungarian word into an array of rovás glyphs. Returns null on an unknown letter.
  function wordToRunes(word) {
    var s = String(word).toUpperCase().replace(/\s+/g, '');
    var out = [];
    for (var i = 0; i < s.length;) {
      var matched = null;
      for (var f = 0; f < FORMS.length; f++) {
        var form = FORMS[f];
        if (s.substr(i, form.length) === form) { matched = form; break; }
      }
      if (!matched) return null; // letter outside the standard alphabet (q, w, x, y, ë…)
      out.push(LOOKUP[matched]);
      i += matched.length;
    }
    return out;
  }

  function isValid(word) { return wordToRunes(word) !== null; }

  // Curated, child-friendly word list — only from the standard 40 letters.
  // (The 40 keywords come from data.js; buildBank merges these with them.)
  var EXTRA = [
    'Ló', 'Nap', 'Tűz', 'Víz', 'Fa', 'Ég', 'Kő', 'Hó', 'Hold', 'Csillag',
    'Erdő', 'Falu', 'Sátor', 'Lovas', 'Hun', 'Attila', 'Király', 'Nyár', 'Tél',
    'Ház', 'Kéz', 'Láb', 'Szem', 'Fül', 'Szív', 'Madár', 'Hal', 'Méh', 'Róka',
    'Bagoly', 'Szarvas', 'Gomba', 'Alma', 'Körte', 'Dió', 'Méz', 'Só', 'Kenyér',
    'Eső', 'Szél', 'Felhő', 'Villám', 'Folyó', 'Hegy', 'Mező', 'Virág',
    'Dal', 'Mese', 'Álom', 'Béke', 'Isten'
  ];

  // Returns a deduplicated word list (keywords + extras), filtered by validity.
  function buildBank(keywordWords) {
    var seen = {}, bank = [];
    (keywordWords || []).concat(EXTRA).forEach(function (w) {
      var key = String(w).toLowerCase();
      if (seen[key]) return;
      if (!isValid(w)) return;
      seen[key] = 1;
      bank.push(w);
    });
    return bank;
  }

  // Only the words for which the player has learned EVERY glyph.
  function wordsForLearned(bank, learned) {
    var set = {}; (learned || []).forEach(function (l) { set[l] = 1; });
    return bank.filter(function (w) {
      var runes = wordToRunes(w);
      return runes && runes.every(function (r) { return set[r]; });
    });
  }

  var api = {
    wordToRunes: wordToRunes,
    isValid: isValid,
    EXTRA: EXTRA,
    buildBank: buildBank,
    wordsForLearned: wordsForLearned
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ROVAS_WORDS = api;
})(typeof window !== 'undefined' ? window : globalThis);
