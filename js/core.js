/*
 * SPDX-License-Identifier: AGPL-3.0-or-later · © 2026 · github.com/sicambria/rovas-tanulas
 *
 * core.js — The game's pure (DOM-free) logic: progress, scoring, rank,
 * generating and checking minigame questions, the ISTEN reveal.
 *
 * Every function is callable and testable from Node. Randomness can be made
 * deterministic for tests via an optional seed.
 */
(function (root) {
  'use strict';

  var DATA = (typeof require !== 'undefined') ? require('./data.js') : root.ROVAS_DATA;
  var GLYPHS = (typeof require !== 'undefined') ? require('./glyphs.js') : root.ROVAS_GLYPHS;
  var WORDS = (typeof require !== 'undefined') ? require('./words.js') : root.ROVAS_WORDS;
  var SRS = (typeof require !== 'undefined') ? require('./srs.js') : root.ROVAS_SRS;

  var TOTAL_LETTERS = 40;
  var STATE_VERSION = 2;

  // ── Seeded RNG (mulberry32) — for deterministic testing ────────
  function makeRng(seed) {
    if (seed == null) {
      return Math.random;
    }
    var s = seed >>> 0;
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // ── State ──────────────────────────────────────────────────────
  function createState() {
    return {
      version: STATE_VERSION,
      character: null,
      difficulty: 'intermediate', // 'beginner' | 'intermediate' | 'master' — recognizer leniency
      lessons: {},            // num -> { completed, wisdom, hearts }
      learned: [],            // letters learned (out of the 40)
      wisdom: 0,              // ⭐ total
      hearts: 0,             // ❤️ total
      onboardingSeen: false,
      istenSolved: false,
      finished: false,
      srs: {},               // letter -> Leitner card (spaced repetition)
      exam: { best: {}, passedFinal: false, rank: null } // exam results
    };
  }

  // Safely upgrade an old save: fills in missing fields, never discards data.
  function migrate(s) {
    if (!s || typeof s !== 'object') return createState();
    s.version = STATE_VERSION;
    // Existing saves predate difficulty modes → default to 'intermediate' (legacy margin/ceil thresholds).
    if (s.difficulty !== 'beginner' && s.difficulty !== 'master') s.difficulty = 'intermediate';
    if (!s.lessons || typeof s.lessons !== 'object') s.lessons = {};
    if (!Array.isArray(s.learned)) s.learned = [];
    if (typeof s.wisdom !== 'number') s.wisdom = 0;
    if (typeof s.hearts !== 'number') s.hearts = 0;
    if (typeof s.onboardingSeen !== 'boolean') s.onboardingSeen = false;
    if (typeof s.istenSolved !== 'boolean') s.istenSolved = false;
    if (typeof s.finished !== 'boolean') s.finished = false;
    if (!s.srs || typeof s.srs !== 'object') s.srs = {};
    if (!s.exam || typeof s.exam !== 'object') s.exam = { best: {}, passedFinal: false, rank: null };
    if (!s.exam.best || typeof s.exam.best !== 'object') s.exam.best = {};
    return s;
  }

  function getLesson(num) {
    for (var i = 0; i < DATA.lessons.length; i++) {
      if (DATA.lessons[i].num === num) return DATA.lessons[i];
    }
    return null;
  }

  // Every lesson is playable in any order EXCEPT the final one ("Az utolsó
  // rovások"), which stays locked until every other lesson is completed.
  function isLessonUnlocked(state, num) {
    var lessons = DATA.lessons;
    var lastNum = lessons[lessons.length - 1].num;
    if (num !== lastNum) return true;
    for (var i = 0; i < lessons.length; i++) {
      var n = lessons[i].num;
      if (n === lastNum) continue;
      var l = state.lessons[n];
      if (!l || !l.completed) return false;
    }
    return true;
  }

  function unlockedCount(state) {
    var c = 0;
    for (var i = 1; i <= DATA.lessons.length; i++) {
      if (isLessonUnlocked(state, i)) c++;
    }
    return c;
  }

  function learnedCount(state) { return state.learned.length; }

  function allLessonsComplete(state) {
    for (var i = 0; i < DATA.lessons.length; i++) {
      var l = state.lessons[DATA.lessons[i].num];
      if (!l || !l.completed) return false;
    }
    return true;
  }

  function rankFor(hearts) {
    var ranks = DATA.scoring.ranks; // descending min
    for (var i = 0; i < ranks.length; i++) {
      if (hearts >= ranks[i].min) return ranks[i].title;
    }
    return ranks[ranks.length - 1].title;
  }

  // ── Minigame questions ─────────────────────────────────────────
  // Each question draws its choices from the letters of its own lesson.
  // type: 'recognition' (rune → word), 'matching' (word → rune),
  //       'clues' (clue → rune).
  function buildQuestions(lessonNum, opts) {
    opts = opts || {};
    var rng = makeRng(opts.seed);
    var lesson = getLesson(lessonNum);
    if (!lesson) throw new Error('Ismeretlen lecke: ' + lessonNum);
    var type = opts.type || lesson.minigame;
    var letters = lesson.letters;

    var askOrder = (opts.shuffleLetters === false) ? letters.slice() : shuffle(letters, rng);

    return askOrder.map(function (letter) {
      var info = DATA.letters[letter];
      var options = shuffle(letters, rng).map(function (l) {
        return {
          letter: l,
          word: DATA.letters[l].word,
          emoji: DATA.letters[l].emoji,
          correct: l === letter
        };
      });
      var stimulus;
      if (type === 'recognition') {
        stimulus = { kind: 'rune', letter: letter };         // show the rune
      } else if (type === 'clues') {
        stimulus = { kind: 'clue', text: info.clue, emoji: info.emoji };
      } else { // matching
        stimulus = { kind: 'word', word: info.word, emoji: info.emoji };
      }
      // recognition: the answer options are WORDS; otherwise RUNES.
      var answerMode = (type === 'recognition') ? 'word' : 'rune';
      return {
        letter: letter,
        type: type,
        answerMode: answerMode,
        stimulus: stimulus,
        options: options
      };
    });
  }

  function checkAnswer(question, chosenLetter) {
    return question.letter === chosenLetter;
  }

  function randomFeedback(correct, rng) {
    rng = rng || Math.random;
    var pool = correct ? DATA.feedback.right : DATA.feedback.wrong;
    return pool[Math.floor(rng() * pool.length)];
  }

  // ── Completing a lesson ────────────────────────────────────────
  function completeLesson(state, lessonNum, result) {
    result = result || {};
    var lesson = getLesson(lessonNum);
    if (!lesson) throw new Error('Ismeretlen lecke: ' + lessonNum);

    // Add the learned letters (no duplicates, preserving order).
    lesson.letters.forEach(function (l) {
      if (state.learned.indexOf(l) === -1) state.learned.push(l);
    });
    // The new letters enter the spaced-repetition system.
    if (SRS && SRS.ensureCards) SRS.ensureCards(state, (result.now != null ? result.now : Date.now()));

    var wisdom = result.wisdom || 0;
    var hearts = result.hearts || 0;

    var prev = state.lessons[lessonNum];
    // Scores are kept according to the best result (lessons are replayable).
    if (!prev) {
      state.lessons[lessonNum] = { completed: true, wisdom: wisdom, hearts: hearts };
      state.wisdom += wisdom;
      state.hearts += hearts;
    } else {
      if (wisdom > prev.wisdom) { state.wisdom += (wisdom - prev.wisdom); prev.wisdom = wisdom; }
      if (hearts > prev.hearts) { state.hearts += (hearts - prev.hearts); prev.hearts = hearts; }
      prev.completed = true;
    }

    if (allLessonsComplete(state)) state.finished = true;
    return state;
  }

  function nextUnlockedLesson(state) {
    for (var i = 1; i <= DATA.lessons.length; i++) {
      var l = state.lessons[i];
      if (isLessonUnlocked(state, i) && (!l || !l.completed)) return i;
    }
    return null;
  }

  function hasGlyph(letter) { return !!(GLYPHS.GLYPHS && GLYPHS.GLYPHS[letter]); }

  // ── Exam results ───────────────────────────────────────────────
  function recordExamResult(state, key, correct, total) {
    if (!state.exam) state.exam = { best: {}, passedFinal: false, rank: null };
    if (!state.exam.best) state.exam.best = {};
    var ratio = total ? correct / total : 0;
    var prev = state.exam.best[key];
    if (!prev || ratio > prev.ratio) state.exam.best[key] = { correct: correct, total: total, ratio: ratio };
    return state.exam.best[key];
  }
  function examPassed(state, key, threshold) {
    var b = state.exam && state.exam.best && state.exam.best[key];
    return !!(b && b.ratio >= (threshold == null ? 0.8 : threshold));
  }
  // Completing the final exam: records it and assigns a rank (based on hearts + exam performance).
  function completeFinalExam(state, correct, total) {
    recordExamResult(state, 'final', correct, total);
    var ratio = total ? correct / total : 0;
    state.exam.passedFinal = ratio >= 0.8;
    // Stable key, localized for display by ui.js (examRankLabel). Older saves may
    // still hold the legacy Hungarian string; ui.js tolerates that.
    state.exam.rank = ratio >= 0.95 ? 'master' : ratio >= 0.8 ? 'scribe' : 'apprentice';
    return state.exam;
  }

  // ── Word-quiz builders (words.js + the existing minigame style) ──
  function wordBank(state) {
    return WORDS.wordsForLearned(fullWordBank(), state ? state.learned : GLYPHS.ORDER);
  }

  // The complete child-friendly word bank (all 40 letters), unfiltered by
  // progress — the single source for practice/exam pools that must cover
  // every letter regardless of what has been "learned".
  function fullWordBank() {
    // Use the HUNGARIAN mnemonic word (huWord, frozen by i18n at load) for the
    // word bank — reading rovás means reading Hungarian, so the bank stays
    // Hungarian even when the UI/`.word` is localized. Falls back to `.word`
    // when i18n is not loaded (e.g. the DOM-free unit tests).
    var keywords = (GLYPHS.ORDER || []).map(function (l) { return DATA.letters[l].huWord || DATA.letters[l].word; });
    return WORDS.buildBank(keywords);
  }

  var api = {
    TOTAL_LETTERS: TOTAL_LETTERS,
    STATE_VERSION: STATE_VERSION,
    makeRng: makeRng,
    shuffle: shuffle,
    createState: createState,
    getLesson: getLesson,
    isLessonUnlocked: isLessonUnlocked,
    unlockedCount: unlockedCount,
    learnedCount: learnedCount,
    allLessonsComplete: allLessonsComplete,
    rankFor: rankFor,
    buildQuestions: buildQuestions,
    checkAnswer: checkAnswer,
    randomFeedback: randomFeedback,
    completeLesson: completeLesson,
    nextUnlockedLesson: nextUnlockedLesson,
    hasGlyph: hasGlyph,
    migrate: migrate,
    recordExamResult: recordExamResult,
    examPassed: examPassed,
    completeFinalExam: completeFinalExam,
    wordBank: wordBank,
    fullWordBank: fullWordBank,
    // convenience re-export
    wordToRunes: WORDS.wordToRunes,
    srs: SRS
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ROVAS_CORE = api;
})(typeof window !== 'undefined' ? window : globalThis);
