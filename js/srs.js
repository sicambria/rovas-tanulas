/*
 * SPDX-License-Identifier: AGPL-3.0-or-later · © 2026 · github.com/sicambria/rovas-tanulas
 *
 * srs.js — Spaced repetition (Leitner boxes) for durably fixing the letters.
 *
 * Pure logic: every function takes a clock (now, ms), making it deterministic
 * and testable from Node. Cards live in the state.srs map: letter → card.
 */
(function (root) {
  'use strict';

  var DAY = 86400000;
  // 5 boxes with increasing intervals (ms). A hard letter returns often, an easy one rarely.
  var INTERVALS = [1 * DAY, 2 * DAY, 4 * DAY, 8 * DAY, 16 * DAY];
  var MAX_BOX = INTERVALS.length;

  function newCard(now) {
    // New letter: box 1, due immediately (so the first recall comes soon after learning).
    return { box: 1, dueAt: now, reps: 0, lapses: 0, last: now };
  }

  function intervalFor(box) { return INTERVALS[Math.min(Math.max(box, 1), MAX_BOX) - 1]; }

  // Result of one recall → a new card (non-mutating).
  function review(card, correct, now) {
    var c = { box: card.box, dueAt: card.dueAt, reps: card.reps || 0, lapses: card.lapses || 0, last: now };
    if (correct) { c.box = Math.min((card.box || 1) + 1, MAX_BOX); c.reps = (card.reps || 0) + 1; }
    else { c.box = 1; c.lapses = (card.lapses || 0) + 1; }
    c.dueAt = now + intervalFor(c.box);
    return c;
  }

  // Ensures a card for every learned letter (creating missing ones as due now).
  function ensureCards(state, now) {
    if (!state.srs) state.srs = {};
    (state.learned || []).forEach(function (l) {
      if (!state.srs[l]) state.srs[l] = newCard(now);
    });
    return state;
  }

  // Due letters (dueAt ≤ now), longest-overdue first. Only from learned ones.
  function dueLetters(state, now) {
    var srs = state.srs || {};
    return (state.learned || [])
      .filter(function (l) { var c = srs[l]; return !c || c.dueAt <= now; })
      .sort(function (a, b) { return ((srs[a] && srs[a].dueAt) || 0) - ((srs[b] && srs[b].dueAt) || 0); });
  }

  function dueCount(state, now) { return dueLetters(state, now).length; }

  // Practice batch: the due ones; if none, free practice from the learned ones.
  function practiceBatch(state, now, max) {
    var due = dueLetters(state, now);
    var pool = due.length ? due : (state.learned || []).slice();
    return pool.slice(0, max || 12);
  }

  // Records a recall in the state.
  function record(state, letter, correct, now) {
    if (!state.srs) state.srs = {};
    var card = state.srs[letter] || newCard(now);
    state.srs[letter] = review(card, correct, now);
    return state;
  }

  var api = {
    DAY: DAY, INTERVALS: INTERVALS, MAX_BOX: MAX_BOX,
    newCard: newCard, review: review, ensureCards: ensureCards,
    dueLetters: dueLetters, dueCount: dueCount, practiceBatch: practiceBatch, record: record
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ROVAS_SRS = api;
})(typeof window !== 'undefined' ? window : globalThis);
