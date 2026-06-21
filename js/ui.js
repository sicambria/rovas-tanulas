/*
 * SPDX-License-Identifier: AGPL-3.0-or-later · © 2026 · github.com/sicambria/rovas-tanulas
 *
 * ui.js — The game's interface and screen control (mobile-first).
 * The logic lives in the core.js / recognizer.js / srs.js / users.js modules;
 * this layer renders and handles events.
 */
(function () {
  'use strict';

  var CORE = window.ROVAS_CORE;
  var DATA = window.ROVAS_DATA;
  var GLYPHS = window.ROVAS_GLYPHS;
  // as filled silhouettes. The recognizer and the drawing "ghost" use the
  // centerlines from glyphs.js.
  var OUTLINES = (window.ROVAS_GLYPH_OUTLINES || {}).OUTLINES || {};
  // "Straightened" (balanced) glyph set: the same skeleton with clean, even
  // lines (glyph-balanced.js). The recognizer accepts both, because the
  // recognizer templates are built from the shared centerline skeleton (glyphs.js).
  var BALANCED = (window.ROVAS_GLYPH_BALANCED || {}).OUTLINES || {};
  var GLYPH_STYLE_KEY = 'rovas-glyph-style';
  var glyphStyle = (function () { try { return localStorage.getItem(GLYPH_STYLE_KEY) || 'forrai'; } catch (e) { return 'forrai'; } })();
  function activeOutlines() { return glyphStyle === 'balanced' ? BALANCED : OUTLINES; }
  function setGlyphStyle(s) { glyphStyle = (s === 'balanced') ? 'balanced' : 'forrai'; try { localStorage.setItem(GLYPH_STYLE_KEY, glyphStyle); } catch (e) {} }
  var REC = window.ROVAS_RECOGNIZER;
  var DRAW = window.ROVAS_DRAW;

  // Recognizer debug: opt-in via `localStorage rovas-rec-debug=1` or `?recdebug` in the URL.
  // without guessing at thresholds. No-op in normal play.
  function recDebugOn() {
    try { if (localStorage.getItem('rovas-rec-debug') === '1') return true; } catch (e) {}
    try { return location.search.indexOf('recdebug') >= 0; } catch (e) { return false; }
  }
  function recDebug(label, target, pad, j) {
    if (!recDebugOn() || !pad) return;
    var pts = pad.getPoints();
    var bb = { w: 0, h: 0 };
    if (pts.length) {
      var xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
      bb = { w: +(Math.max.apply(null, xs) - Math.min.apply(null, xs)).toFixed(1), h: +(Math.max.apply(null, ys) - Math.min.apply(null, ys)).toFixed(1) };
    }
    var bestDist = null;
    try { var r = REC.recognize(pts); bestDist = r.ranked.length ? Math.round(r.ranked[0].distance) : null; } catch (e) {}
    console.log('[rec]', label, JSON.stringify({
      target: target, ok: j.ok, best: j.best, rank: j.rank,
      targetDist: isFinite(j.distance) ? Math.round(j.distance) : j.distance, bestDist: bestDist,
      reason: j.reason, numPoints: pts.length, strokeCount: pad.strokeCount(), bbox: bb
    }));
  }
  var USERS = window.ROVAS_USERS;
  var SRS = window.ROVAS_SRS;
  var I18N = window.ROVAS_I18N;
  var FLAGS = window.ROVAS_FLAGS || { svg: function () { return ''; } };
  // UI-chrome lookup. Content (data.js fields) is localized separately, in place,
  // by i18n.js — so `DATA` reads below stay unchanged.
  function t(key, params) { return I18N.t(key, params); }
  var app = document.getElementById('app');
  var SAVE_PREFIX = 'rovas-save-v1';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function now() { return Date.now(); }

  // ── State ───────────────────────────────────────────────────
  var currentUserId = null;
  var state = CORE.createState();
  var view = { screen: 'boot' };
  var run = null;   // active lesson
  var quiz = null;  // active exam/practice
  var pads = [];    // active drawing canvases

  function saveKeyFor(id) { return SAVE_PREFIX + (id ? (':' + id) : ''); }
  function loadStateFor(id) {
    try { var s = JSON.parse(localStorage.getItem(saveKeyFor(id))); if (s) return CORE.migrate(s); } catch (e) {}
    return CORE.createState();
  }
  function legacyState() {
    try { var s = JSON.parse(localStorage.getItem(SAVE_PREFIX)); if (s) return CORE.migrate(s); } catch (e) {}
    return null;
  }
  function save() { if (!currentUserId) return; try { localStorage.setItem(saveKeyFor(currentUserId), JSON.stringify(state)); } catch (e) {} }

  // ── Small helpers ───────────────────────────────────────────
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function teacher(id) { return DATA.teachers[id]; }
  function letterInfo(l) { return DATA.letters[l]; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function sample(a, n) { return shuffle(a).slice(0, n); }
  function charById(id) { return DATA.characters.filter(function (c) { return c.id === id; })[0]; }

  // ── Rovás glyph SVG ─────────────────────────────────────────
  function glyphPaths(letter, cls, styleOverride) {
    var map = styleOverride === 'balanced' ? BALANCED : (styleOverride === 'forrai' ? OUTLINES : activeOutlines());
    var o = map[letter];
    if (o) return '<path class="' + (cls || 'rune-path') + '" d="' + o + '"/>';
    // fallback: if for some reason there is no vector, the old line form
    return ((GLYPHS.GLYPHS[letter]) || []).map(function (d) { return '<path class="' + (cls || 'rune-path') + '" d="' + d + '"/>'; }).join('');
  }
  function glyphSVG(letter, label, styleOverride) {
    return '<svg viewBox="0 0 100 100" role="img" aria-label="' + esc(label || t('a11y.runeSign', { letter: letter })) + '">' + glyphPaths(letter, null, styleOverride) + '</svg>';
  }
  function runeRow(runes) {
    return '<span class="runerow">' + runes.slice().reverse().map(function (r) { return '<span class="rr">' + glyphSVG(r) + '</span>'; }).join('') + '</span>';
  }
  function animateDraw(scope) {
    if (reduced) return;
    var paths = scope.querySelectorAll('.rune-path');
    var delay = 0;
    Array.prototype.forEach.call(paths, function (p) {
      var len; try { len = p.getTotalLength(); } catch (e) { len = 220; }
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len; p.style.transition = 'none';
      p.getBoundingClientRect();
      var dur = Math.min(640, Math.max(280, len * 2.6));
      p.style.transition = 'stroke-dashoffset ' + dur + 'ms ease ' + delay + 'ms';
      p.style.strokeDashoffset = '0'; delay += dur * 0.62;
    });
  }

  // ── Rendering ───────────────────────────────────────────────
  function go(screen, data) { view = Object.assign({ screen: screen }, data || {}); render(); window.scrollTo(0, 0); }
  function render() { var fn = SCREENS[view.screen]; app.innerHTML = fn ? fn() : '<div class="screen"><p>' + esc(t('common.errGeneric')) + '</p></div>'; afterRender(); }

  function destroyPads() { pads.forEach(function (p) { try { p.destroy(); } catch (e) {} }); pads = []; }
  function mountPads() {
    destroyPads();
    if (!DRAW) return;
    Array.prototype.forEach.call(app.querySelectorAll('.padmount'), function (host) {
      var p = DRAW.DrawPad(host, { ghost: host.dataset.ghost || null, size: +host.dataset.size || undefined, onChange: function () { var h = document.getElementById('drawhint'); if (h && !host.dataset.keephint) h.textContent = ''; } });
      host._pad = p; pads.push(p);
    });
  }
  function afterRender() {
    var stage = app.querySelector('[data-draw]'); if (stage) animateDraw(stage);
    mountPads();
    var focusEl = app.querySelector('[data-focus]');
    if (focusEl) { focusEl.setAttribute('tabindex', '-1'); try { focusEl.focus({ preventScroll: true }); } catch (e) {} }
    // Deferred so the first-profile onboarding help (shown ~350ms after landing on the
    // village) wins; if it is open, maybeShowMusicTip skips and is retried on its close.
    if (view.screen === 'village') setTimeout(maybeShowMusicTip, 450);
  }

  // ── HUD ─────────────────────────────────────────────────────
  function hud(opts) {
    opts = opts || {};
    var due = SRS.dueCount(state, now());
    return '<div class="hud" role="status" aria-label="' + esc(t('hud.scores')) + '">' +
      '<div class="scores">' +
        '<span class="s-star" title="' + esc(t('hud.wisdom')) + '">⭐ ' + state.wisdom + '</span>' +
        '<span class="s-heart" title="' + esc(t('hud.heart')) + '">❤️ ' + state.hearts + '</span>' +
        '<span class="s-rune" title="' + esc(t('hud.runes')) + '">📜 ' + CORE.learnedCount(state) + '/40</span>' +
      '</div>' +
      (opts.home ? '<button class="iconbtn" data-action="goVillage" aria-label="' + esc(t('hud.home')) + '">🏠</button>' : '') +
      (opts.profile === false ? '' : '<button class="iconbtn" data-action="switchProfile" aria-label="' + esc(t('hud.profile')) + '">👤</button>') +
      '<button class="iconbtn" data-action="help" aria-label="' + esc(t('hud.help')) + '">?</button>' +
    '</div>';
  }

  // A small reading-direction reminder on the right edge of practice screens: rovás is
  // written RIGHT-TO-LEFT (unlike Hungarian Latin) — shown as a left arrow + tiny caption.
  function rtlSideHint() {
    return '<div class="rtl-side" role="note" aria-label="' + esc(t('rtl.aria')) + '">' +
      '<span class="rtl-arrow" aria-hidden="true">←</span>' +
      '<span class="rtl-cap" aria-hidden="true">' + t('rtl.caption') + '</span>' +
    '</div>';
  }

  // App version shown bottom-right on the home + profile screens. Bump APP_BUILD on every
  // deploy together with the CACHE gen in sw.js — a stale client then visibly shows an old
  // number, which answers the recurring „is the latest live on github.io?" question.
  var APP_VERSION = '1.0.0';
  var APP_BUILD = 40; // ⇆ keep in step with CACHE 'rovas-v40' in sw.js
  function versionBadge() {
    return '<div class="version-badge" aria-label="' + esc(t('version.badge', { version: APP_VERSION, build: APP_BUILD })) + '">' +
      'v' + esc(APP_VERSION) + ' · b' + APP_BUILD + '</div>';
  }

  // Final-exam rank is stored as a stable key ('master' | 'scribe' | 'apprentice');
  // translate at display. Tolerates legacy saves that stored a Hungarian string.
  function examRankLabel(rank) {
    if (rank === 'master' || rank === 'scribe' || rank === 'apprentice') return t('examRank.' + rank);
    return rank || '';
  }

  // Device-wide language picker, shown on the pre-login screens (intro + profiles).
  // Auto-detected on first run; the choice persists in localStorage (rovas-lang-v1).
  // Flag + native-name dropdown. With 15 locales a flat button row no longer
  // fits on a phone, so this is a <details> popover: the summary shows the
  // current flag + name; the panel lists every language. Selecting one fires
  // setLang, which re-renders the whole screen (collapsing the popover) — so no
  // open/close state has to be tracked here. Flags are inline SVG (js/flags.js).
  function langSwitcher() {
    if (I18N.LOCALES.length === 1) return ''; // single-language build: no picker
    var cur = I18N.getLocale();
    var opts = I18N.LOCALES.map(function (loc) {
      var name = t('lang.' + loc);
      return '<button class="lang-opt' + (loc === cur ? ' on' : '') + '" role="option"' +
        ' data-action="setLang" data-lang="' + loc + '"' + (loc === cur ? ' aria-selected="true"' : '') +
        ' aria-label="' + esc(t('lang.optionAria', { lang: name })) + '">' +
        FLAGS.svg(loc) + '<span class="lang-name">' + esc(name) + '</span>' +
        (loc === cur ? '<span class="lang-tick" aria-hidden="true">✓</span>' : '') + '</button>';
    }).join('');
    var curName = t('lang.' + cur);
    return '<details class="lang-dd">' +
      '<summary class="lang-current" aria-label="' + esc(t('lang.label')) + ': ' + esc(curName) + '">' +
        FLAGS.svg(cur) + '<span class="lang-name">' + esc(curName) + '</span>' +
        '<svg class="lang-caret" viewBox="0 0 10 6" aria-hidden="true" focusable="false"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</summary>' +
      '<div class="lang-menu" role="listbox" aria-label="' + esc(t('lang.groupAria')) + '">' + opts + '</div>' +
    '</details>';
  }

  // ── Screens ─────────────────────────────────────────────────
  var SCREENS = {};

  SCREENS.boot = function () { return '<div class="screen"></div>'; };

  SCREENS.intro = function () {
    var sample2 = ['N', 'E', 'T', 'S', 'I'].map(function (l) { return glyphSVG(l, t('a11y.signOf', { letter: l })); }).join('');
    return '<div class="screen center" data-draw>' +
      '<div class="title-wrap grow">' +
        '<div class="title-rovas" aria-hidden="true">' + sample2 + '</div>' +
        '<h1 class="bigtitle" data-focus>' + esc(DATA.intro.title) + '</h1>' +
        '<div class="subtitle">' + esc(DATA.intro.subtitle) + '</div>' +
        '<div class="flame" aria-hidden="true">🔥</div>' +
        '<div class="intro-lines">' + DATA.intro.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div>' +
      '</div>' +
      '<div class="footer-actions stack">' +
        '<button class="btn" data-action="begin">' + esc(t('intro.begin')) + '</button>' +
        (USERS.count() > 0 ? '<button class="btn ghost" data-action="switchProfile">' + esc(t('intro.chooseProfile')) + '</button>' : '') +
        '<button class="btn ghost small" data-action="help" style="margin:0 auto">' + esc(t('intro.help')) + '</button>' +
      '</div>' +
      langSwitcher() +
      versionBadge() +
    '</div>';
  };

  // ── Profiles ────────────────────────────────────────────────
  SCREENS.profiles = function () {
    var users = USERS.listUsers();
    var rows = users.map(function (u) {
      var ch = charById(u.character);
      return '<div class="profile-row">' +
        '<button class="profile" data-action="pickProfile" data-id="' + u.id + '" aria-label="' + esc(t('profiles.loginAria', { name: u.name })) + '">' +
          '<span class="pavatar" aria-hidden="true">' + (ch ? ch.emoji : '👤') + '</span>' +
          '<span class="pname">' + esc(u.name) + '</span>' +
          '<span class="parrow" aria-hidden="true">' + (u.protected ? '🔒 ' : '') + '→</span>' +
        '</button>' +
        '<button class="iconbtn small-del" data-action="deleteProfile" data-id="' + u.id + '" aria-label="' + esc(t('profiles.deleteAria', { name: u.name })) + '">🗑</button>' +
      '</div>';
    }).join('');
    return '<div class="screen">' +
      '<div class="center"><h2 data-focus>' + esc(t('profiles.title')) + '</h2><p class="muted">' + esc(t('profiles.subtitle')) + '</p></div>' +
      '<div class="profiles grow">' + rows +
        '<button class="btn ghost newprofile" data-action="newProfile">' + esc(t('profiles.newProfile')) + '</button>' +
      '</div>' +
      langSwitcher() +
      versionBadge() +
    '</div>';
  };

  SCREENS.createProfile = function () {
    var selected = view.newChar || null;
    var chars = DATA.characters.map(function (c) {
      return '<button class="char mini' + (selected === c.id ? ' sel' : '') + '" data-action="pickChar" data-id="' + c.id + '" aria-pressed="' + (selected === c.id) + '">' +
        '<span class="face" aria-hidden="true">' + c.emoji + '</span><span class="cname">' + esc(c.name) + '</span>' +
      '</button>';
    }).join('');
    return '<div class="screen">' +
      '<div class="center"><h2 data-focus>' + esc(t('create.title')) + '</h2></div>' +
      '<div class="pf-form stack grow">' +
        '<label class="field"><span>' + esc(t('create.nameLabel')) + '</span><input id="pf-name" class="txt" type="text" maxlength="16" autocomplete="off" placeholder="' + esc(t('create.namePlaceholder')) + '" value="' + esc(view.pfName || '') + '"></label>' +
        '<div class="field"><span>' + esc(t('create.chooseHero')) + '</span><div class="chars2">' + chars + '</div></div>' +
        '<label class="field"><span>' + esc(t('create.passLabel')) + '</span><input id="pf-pass" class="txt" type="password" maxlength="24" autocomplete="off" placeholder="' + esc(t('create.passPlaceholder')) + '"></label>' +
        '<p class="muted" style="font-size:.82rem;margin:0">' + esc(t('create.passNote')) + '</p>' +
        '<div id="pf-error" class="form-error" aria-live="assertive"></div>' +
      '</div>' +
      '<div class="footer-actions stack">' +
        '<button class="btn" data-action="createProfileSubmit">' + esc(t('create.submit')) + '</button>' +
        (USERS.count() > 0 ? '<button class="btn ghost" data-action="switchProfile">' + esc(t('common.back')) + '</button>' : '') +
      '</div>' +
    '</div>';
  };

  SCREENS.password = function () {
    var u = USERS.get(view.userId);
    var ch = u && charById(u.character);
    return '<div class="screen">' +
      '<div class="center grow stack" style="justify-content:center;display:flex;flex-direction:column">' +
        '<div style="font-size:3.4rem" aria-hidden="true">' + (ch ? ch.emoji : '👤') + '</div>' +
        '<h2 data-focus>' + esc(u ? u.name : '') + '</h2>' +
        '<label class="field"><span>' + esc(t('password.label')) + '</span><input id="pw-input" class="txt" type="password" autocomplete="off" placeholder="' + esc(t('password.placeholder')) + '"></label>' +
        '<div id="pw-error" class="form-error" aria-live="assertive"></div>' +
      '</div>' +
      '<div class="footer-actions stack">' +
        '<button class="btn" data-action="doLogin">' + esc(t('password.login')) + '</button>' +
        '<button class="btn ghost" data-action="switchProfile">' + esc(t('common.back')) + '</button>' +
      '</div>' +
    '</div>';
  };

  // ── Village ─────────────────────────────────────────────────
  SCREENS.village = function () {
    var char = charById(state.character);
    var finished = CORE.allLessonsComplete(state);
    var next = CORE.nextUnlockedLesson(state);
    var due = SRS.dueCount(state, now());
    var learned = CORE.learnedCount(state);
    var rows = DATA.lessons.map(function (les) {
      var done = state.lessons[les.num] && state.lessons[les.num].completed;
      var isCurrent = les.num === next;
      var locked = !CORE.isLessonUnlocked(state, les.num);
      var tch = teacher(les.teacher);
      // The final lesson is locked until every other lesson is completed.
      var cls = 'lesson' + (done ? ' done' : '') + (isCurrent ? ' current' : '') + (locked ? ' locked' : '');
      var stateIcon = locked ? '🔒' : (done ? '✅' : (isCurrent ? '▶️' : '·'));
      var lessonAria = t('village.lessonAria', { num: les.num, title: les.title, teacher: tch.name }) +
        (done ? t('village.completedSuffix') : '') + (locked ? t('village.lockedSuffix') : '');
      return '<button class="' + cls + '"' +
        (locked ? ' aria-disabled="true"' : ' data-action="openLesson"') + ' data-num="' + les.num + '"' +
        ' aria-label="' + esc(lessonAria) + '">' +
        '<span class="badge" aria-hidden="true">' + tch.emoji + '</span>' +
        '<span class="meta">' +
          '<span class="lnum">' + esc(t('village.lessonNum', { num: les.num, game: DATA.minigames[les.minigame].name })) + '</span>' +
          '<span class="ltitle">' + esc(les.title) + '</span>' +
          '<span class="lteacher">' + esc(tch.name) + ' — ' + les.letters.join(' · ') + '</span>' +
        '</span>' +
        '<span class="state" aria-hidden="true">' + stateIcon + '</span>' +
      '</button>';
    }).join('');

    // No lockdowns: all practice/exam tools are always available.
    var tools = '<div class="village-tools">' +
      '<button class="vtool" data-action="openPractice"><span class="vt-ic">🎯</span><span class="vt-tx">' + esc(t('village.practice')) + (due ? ' <b>(' + due + ')</b>' : '') + '</span></button>' +
      '<button class="vtool" data-action="openExam"><span class="vt-ic">🎓</span><span class="vt-tx">' + esc(t('village.exam')) + '</span></button>' +
      '<button class="vtool" data-action="showNumbers"><span class="vt-ic">🔢</span><span class="vt-tx">' + esc(t('village.numbers')) + '</span></button>' +
      '<button class="vtool" data-action="openAlphabets"><span class="vt-ic">📖</span><span class="vt-tx">' + esc(t('village.alphabets')) + '</span></button>' +
    '</div>';

    var decodeCta = finished
      ? '<div class="decode-cta"><h3 style="margin-bottom:6px">' + esc(t('village.decodeTitle')) + '</h3>' +
          '<p class="muted" style="margin-bottom:12px">' + esc(t('village.decodeSub')) + '</p>' +
          '<button class="btn" data-action="goDecode">' + esc(t('village.decodeBtn')) + '</button></div>'
      : '';

    return '<div class="screen" style="padding-top:0">' + hud() +
      '<div class="village-head"><h2 data-focus>' + (char ? char.emoji + ' ' : '') + esc(t('village.title')) + '</h2>' +
        '<div class="progress-ring">' + esc(t('village.progress', { learned: learned, unlocked: CORE.unlockedCount(state) })) + '</div></div>' +
      tools +
      decodeCta +
      '<div class="lessons" role="list" style="margin-top:12px">' + rows + '</div>' +
      difficultyToggle() +
    '</div>';
  };

  // Post-creation difficulty picker (also reachable later via the village toggle). Each option
  // shows a one-line description; choosing it stores the level and continues into the village.
  SCREENS.pickDifficulty = function () {
    var cur = (state && state.difficulty) || 'intermediate';
    var opts = DIFF_LEVELS.map(function (lv) {
      return '<button class="diff-opt' + (lv === cur ? ' sel' : '') + '" data-action="pickDifficultyChoice" data-level="' + lv + '" aria-pressed="' + (lv === cur) + '">' +
        '<span class="diff-name">' + esc(t('difficulty.' + lv)) + '</span>' +
        '<span class="diff-desc muted">' + esc(t('difficulty.' + lv + 'Desc')) + '</span>' +
      '</button>';
    }).join('');
    return '<div class="screen">' +
      '<div class="center"><h2 data-focus>' + esc(t('difficulty.prompt')) + '</h2><p class="muted">' + esc(t('difficulty.promptSub')) + '</p></div>' +
      '<div class="diff-opts stack grow">' + opts + '</div>' +
    '</div>';
  };

  function glyphGrid(styleOverride) {
    return '<div class="rune-grid abc-grid" data-draw>' + GLYPHS.ORDER.map(function (l) {
      return '<div class="gcell"><div>' + glyphSVG(l, null, styleOverride) + '</div><div class="gl">' + l + '</div></div>';
    }).join('') + '</div>';
  }
  // Per-profile difficulty (recognizer leniency). Shown on the village hub so it can be
  // changed at any time; the same three levels are offered on the post-creation picker.
  var DIFF_LEVELS = ['beginner', 'intermediate', 'master'];
  function difficultyToggle() {
    var cur = (state && state.difficulty) || 'intermediate';
    var btns = DIFF_LEVELS.map(function (lv) {
      return '<button class="seg-btn' + (lv === cur ? ' on' : '') + '" data-action="setDifficulty" data-level="' + lv + '"' +
        (lv === cur ? ' aria-pressed="true"' : '') +
        ' aria-label="' + esc(t('difficulty.optionAria', { level: t('difficulty.' + lv) })) + '">' + esc(t('difficulty.' + lv)) + '</button>';
    }).join('');
    return '<div class="card dim difficulty-toggle"><h3 style="margin-bottom:4px">' + esc(t('difficulty.title')) + '</h3>' +
      '<p class="muted" style="font-size:.82rem;margin:0 0 8px">' + esc(t('difficulty.note')) + '</p>' +
      '<div class="seg" role="group" aria-label="' + esc(t('difficulty.groupAria')) + '">' + btns + '</div></div>';
  }
  function styleToggle() {
    return '<div class="card dim style-toggle"><h3 style="margin-bottom:4px">' + esc(t('style.title')) + '</h3>' +
      '<p class="muted" style="font-size:.82rem;margin:0 0 8px">' + esc(t('style.note')) + '</p>' +
      '<div class="seg" role="group" aria-label="' + esc(t('style.groupAria')) + '">' +
      '<button class="seg-btn' + (glyphStyle === 'forrai' ? ' on' : '') + '" data-action="glyphStyle" data-style="forrai"' + (glyphStyle === 'forrai' ? ' aria-pressed="true"' : '') + '>' + esc(t('style.forrai')) + '</button>' +
      '<button class="seg-btn' + (glyphStyle === 'balanced' ? ' on' : '') + '" data-action="glyphStyle" data-style="balanced"' + (glyphStyle === 'balanced' ? ' aria-pressed="true"' : '') + '>' + esc(t('style.balanced')) + '</button>' +
      '</div></div>';
  }

  SCREENS.alphabets = function () {
    var a = DATA.alphabets;
    var blocks = a.variants.map(function (v) {
      var media;
      if (v.kind === 'glyphs') {
        media = glyphGrid('forrai');
      } else if (v.kind === 'balanced') {
        media = glyphGrid('balanced');
      } else {
        media = '<img class="abc-img" src="' + v.img + '" alt="' + esc(v.title) + '" loading="lazy">';
      }
      return '<div class="abc-block"><h3>' + esc(v.title) + '</h3>' + media + '<p class="muted">' + esc(v.note) + '</p></div>';
    }).join('');
    return '<div class="screen" style="padding-top:0">' + hud() +
      '<div class="center"><h2 data-focus>' + esc(t('alphabets.title')) + '</h2></div>' +
      '<p>' + esc(a.intro) + '</p>' + styleToggle() + blocks +
      '<div class="card dim"><h3 style="margin-bottom:6px">' + esc(t('alphabets.whyTitle')) + '</h3><ul class="why-list">' +
        a.why.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' +
        '<p class="muted" style="font-size:.8rem;margin:8px 0 0">' + esc(a.source) + '</p></div>' +
      '<div class="footer-actions"><button class="btn ghost" data-action="goVillage">' + esc(t('common.backVillageHome')) + '</button></div>' +
    '</div>';
  };

  SCREENS.lessonIntro = function () {
    var les = CORE.getLesson(run.num);
    var tch = teacher(les.teacher);
    var chips = les.letters.map(function (l) { return '<div class="chip"><div data-draw>' + glyphSVG(l) + '</div><div class="cl">' + l + '</div></div>'; }).join('');
    return '<div class="screen" data-draw>' +
      '<div class="teacher-hero stack">' +
        '<div class="tface" aria-hidden="true">' + tch.emoji + '</div>' +
        '<div><div class="tname" data-focus>' + esc(tch.name) + '</div><div class="trole">' + esc(tch.role) + '</div></div>' +
        '<h2 style="margin:4px 0">' + esc(t('lessonIntro.heading', { num: les.num, title: les.title })) + '</h2>' +
        '<p class="place">' + esc(les.place) + '</p><p>' + esc(les.intro) + '</p>' +
      '</div>' +
      '<div class="letter-preview">' + chips + '</div>' +
      '<p class="center muted">' + esc(t('lessonIntro.minigame', { name: DATA.minigames[les.minigame].name })) + '</p>' +
      '<div class="footer-actions stack">' +
        '<button class="btn" data-action="startLetters">' + esc(t('lessonIntro.start')) + '</button>' +
        '<button class="btn ghost" data-action="goVillage">' + esc(t('common.backVillage')) + '</button>' +
      '</div>' +
    '</div>';
  };

  // Beat sequence: story (0), the sign (1), tracing (2), from-memory (3), hint (4), fact (5).
  var BEAT_COUNT = 6;

  SCREENS.letterBeat = function () {
    var les = CORE.getLesson(run.num);
    var letter = les.letters[run.letterIdx];
    var info = letterInfo(letter);
    var beat = run.beat;
    var dots = '';
    for (var bi = 0; bi < BEAT_COUNT; bi++) { dots += '<span class="dot ' + (bi < beat ? 'done' : (bi === beat ? 'active' : '')) + '"></span>'; }

    var body = '', footer;
    if (beat === 0) {
      body = '<div class="card beat-text story">' + info.story.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>';
    } else if (beat === 1) {
      body = '<div class="rune-stage" data-draw><div class="rune-frame">' + glyphSVG(letter, t('a11y.signOf', { letter: letter }) + ': ' + info.word) + '</div></div>' +
        '<p class="center muted">' + t('beat.thisRune', { letter: letter }) + '</p>';
    } else if (beat === 2) { // tracing (over the ghost template)
      body = '<p class="center mg-instr">' + esc(t('beat.trace')) + '</p>' +
        '<div class="draw-wrap"><div class="padmount" data-ghost="' + letter + '" data-letter="' + letter + '"></div></div>' +
        '<div class="draw-controls"><button class="btn ghost small" data-action="drawClear">' + esc(t('draw.clear')) + '</button><button class="btn ghost small" data-action="drawUndo">' + esc(t('draw.undo')) + '</button></div>' +
        '<div id="drawhint" class="mg-feedback" aria-live="polite"></div>';
    } else if (beat === 3) { // from memory (with a peek button)
      body = '<p class="center mg-instr">' + t('beat.memory', { letter: letter }) + ' (' + info.emoji + ' ' + esc(info.word) + ')</p>' +
        '<div class="draw-wrap"><div class="padmount" data-letter="' + letter + '" id="memorypad"></div></div>' +
        '<div class="draw-controls"><button class="btn ghost small" data-action="drawClear">' + esc(t('draw.clear')) + '</button><button class="btn ghost small" data-action="peek">' + esc(t('draw.peek')) + '</button></div>' +
        '<div id="drawhint" class="mg-feedback" aria-live="polite"></div>';
    } else if (beat === 4) {
      body = '<div class="card hint-card"><div class="hint-emoji" aria-hidden="true">' + info.emoji + '</div>' +
        '<div class="hint-word">' + esc(info.word) + '</div>' +
        '<div style="display:flex;justify-content:center;margin:6px 0" data-draw><div style="width:120px;height:120px">' + glyphSVG(letter) + '</div></div>' +
        '<p style="color:var(--ink-soft)">' + esc(t('beat.connect')) + '</p></div>';
    } else {
      body = '<div class="fact"><span class="tag">' + esc(t('fact.tag')) + '</span>' + esc(info.fact) + '</div>';
    }

    if (beat === 2 || beat === 3) {
      footer = '<button class="btn" data-action="learnDrawCheck">' + esc(t('draw.check')) + '</button>' +
        '<button class="btn ghost small" data-action="learnDrawSkip" style="margin:0 auto">' + esc(t('draw.skipNext')) + '</button>';
    } else {
      var isLast = beat >= BEAT_COUNT - 1;
      var nextLabel = isLast ? (info.emotional ? t('nav.next') : (run.letterIdx < les.letters.length - 1 ? t('nav.nextLetter') : t('nav.toPractice'))) : t('nav.next');
      footer = '<button class="btn" data-action="beatNext">' + esc(nextLabel) + '</button>' +
        (beat > 0 ? '<button class="btn ghost small" data-action="beatBack" style="margin:0 auto">' + esc(t('nav.back')) + '</button>' : '');
    }

    return '<div class="screen" style="padding-top:0">' + hud({ home: true }) + rtlSideHint() +
      '<div class="beatbar" aria-hidden="true">' + dots + '</div>' +
      '<div class="letter-head"><span class="letter-emoji" aria-hidden="true">' + info.emoji + '</span>' +
        '<span class="lbig" data-focus>' + letter + '</span><span class="lword">' + esc(info.word) + '</span>' +
        '<span class="muted" style="margin-left:auto;font-size:.8rem">' + (run.letterIdx + 1) + '/' + les.letters.length + '</span></div>' +
      '<div class="grow">' + body + '</div>' +
      '<div class="footer-actions stack">' + footer + '</div>' +
    '</div>';
  };

  SCREENS.emotional = function () {
    var les = CORE.getLesson(run.num);
    var info = letterInfo(les.letters[run.letterIdx]);
    var emo = info.emotional;
    if (view.emoResult != null) {
      var choice = emo.choices[view.emoResult];
      var gotHeart = choice.kind === 'heart';
      return '<div class="screen emo-result" style="padding-top:0">' + hud({ home: true }) +
        '<div class="grow stack" style="justify-content:center;align-content:center;display:grid">' +
          (gotHeart ? '<div class="center"><div class="heart-pop" aria-hidden="true">❤️</div><p class="center muted">' + esc(t('emo.gotHeart')) + '</p></div>' : '') +
          '<div class="card beat-text"><p>' + esc(choice.result) + '</p></div></div>' +
        '<div class="footer-actions"><button class="btn" data-action="emoContinue" data-focus>' + esc(t('nav.next')) + '</button></div></div>';
    }
    return '<div class="screen emo" style="padding-top:0">' + hud({ home: true }) +
      '<div class="grow stack" style="justify-content:center;display:flex;flex-direction:column">' +
        '<div class="center" style="font-size:2.2rem">💛</div>' +
        '<div class="card"><p class="prompt" data-focus tabindex="-1">' + esc(emo.prompt) + '</p></div>' +
        '<div class="choices">' + emo.choices.map(function (c, i) {
          return '<button class="choice" data-action="emoChoose" data-i="' + i + '"><span class="lead" aria-hidden="true">' + (c.kind === 'heart' ? '💛' : '🤍') + '</span>' + esc(c.label) + '</button>';
        }).join('') + '</div></div></div>';
  };

  SCREENS.minigame = function () {
    var les = CORE.getLesson(run.num);
    var q = run.questions[run.qIdx];
    var mg = DATA.minigames[les.minigame];
    var stim;
    if (q.stimulus.kind === 'rune') stim = '<div class="rune-frame" data-draw>' + glyphSVG(q.stimulus.letter) + '</div>';
    else if (q.stimulus.kind === 'word') stim = '<div class="word-stim"><span class="we" aria-hidden="true">' + q.stimulus.emoji + '</span><span class="ww">' + esc(q.stimulus.word) + '</span></div>';
    else stim = '<div class="clue-stim"><span class="ce" aria-hidden="true">' + q.stimulus.emoji + '</span>' + esc(q.stimulus.text) + '</div>';
    var opts = q.options.map(function (o) {
      if (q.answerMode === 'word') return '<button class="opt word" data-action="answer" data-letter="' + o.letter + '"><span class="oe" aria-hidden="true">' + o.emoji + '</span><span>' + esc(o.word) + '</span></button>';
      return '<button class="opt rune" data-action="answer" data-letter="' + o.letter + '" aria-label="' + esc(t('a11y.signOf', { letter: o.letter })) + '">' + glyphSVG(o.letter, t('a11y.signOf', { letter: o.letter })) + '</button>';
    }).join('');
    return '<div class="screen" style="padding-top:0">' + hud({ home: true }) + rtlSideHint() +
      '<div class="mg-head"><h3 style="margin:0" data-focus>' + esc(mg.name) + '</h3><span class="mg-progress">' + (run.qIdx + 1) + ' / ' + run.questions.length + '</span></div>' +
      '<p class="mg-instr">' + esc(mg.instr) + '</p><div class="mg-stim">' + stim + '</div>' +
      '<div class="' + (q.answerMode === 'word' ? 'options' : 'options runes') + '">' + opts + '</div>' +
      '<div class="mg-feedback" id="mgfb" aria-live="assertive"></div></div>';
  };

  SCREENS.lessonComplete = function () {
    var les = CORE.getLesson(run.num);
    var allDone = CORE.allLessonsComplete(state);
    return '<div class="screen" style="padding-top:0">' + hud() +
      '<div class="celebrate grow"><div class="big" aria-hidden="true">🎉</div>' +
        '<h2 data-focus>' + esc(t('complete.title')) + '</h2><p class="muted">' + esc(les.title) + ' — ' + les.letters.join(' · ') + '</p>' +
        '<div class="summary-row"><span class="s-star">⭐ ' + run.wisdom + '/' + run.questions.length + '</span>' +
          (run.hearts ? '<span class="s-heart">❤️ ' + run.hearts + '</span>' : '') +
          '<span class="s-rune">📜 +' + les.letters.length + '</span></div>' +
        '<p>' + esc(t('complete.learned', { n: CORE.learnedCount(state) })) + '</p></div>' +
      relicCard(run.num) +
      '<div class="footer-actions stack">' +
        (allDone ? '<button class="btn" data-action="goDecode" data-focus>' + esc(t('village.decodeBtn')) + '</button>' : '') +
        '<button class="btn' + (allDone ? ' ghost' : '') + '" data-action="goVillage">' + esc(t('common.backVillageHome')) + '</button></div></div>';
  };

  // ── Exam ────────────────────────────────────────────────────
  // Titles/descriptions come from the UI-chrome tables (exam.tests.<key>); only
  // the keys and structural fields (icon, min/minWords) live here.
  var EXAM_TESTS = [
    { key: 'letters', icon: '🔤', min: 4 },
    { key: 'words', icon: '🔁', minWords: 4 },
    { key: 'letterdraw', icon: '✍️', min: 1 },
    { key: 'worddraw', icon: '📝', minWords: 1 }
  ];

  SCREENS.examHub = function () {
    // No lockdowns: every exam (incl. the final) is always available. When the
    // player hasn't learned enough yet, the builders fall back to the full
    // alphabet/word bank so the exam still has material.
    var tiles = EXAM_TESTS.map(function (et) {
      var best = state.exam.best[et.key];
      var bestTxt = best ? Math.round(best.ratio * 100) + '%' : '—';
      return '<button class="exam-test" data-action="startExamTest" data-key="' + et.key + '">' +
        '<span class="et-ic" aria-hidden="true">' + et.icon + '</span>' +
        '<span class="et-meta"><span class="et-title">' + esc(t('exam.tests.' + et.key + '.title')) + '</span><span class="et-desc">' + esc(t('exam.tests.' + et.key + '.desc')) + '</span></span>' +
        '<span class="et-best">' + bestTxt + '</span></button>';
    }).join('');
    var fin = '<button class="btn final-exam" data-action="startFinal">' +
      esc(t('exam.final')) +
      (state.exam.passedFinal ? ' ✅' : '') + '</button>';
    return '<div class="screen" style="padding-top:0">' + hud() +
      '<div class="center"><h2 data-focus>' + esc(t('exam.title')) + '</h2><p class="muted">' + esc(t('exam.subtitle')) + '</p></div>' +
      '<div class="exam-tests grow">' + tiles + '</div>' +
      '<div class="footer-actions stack">' + fin + '<button class="btn ghost" data-action="goVillage">' + esc(t('common.backVillage')) + '</button></div></div>';
  };

  // ── Practice hub ────────────────────────────────────────────
  // Free practice covering every letter and every mode/variation, in any
  // order, with no lockdowns. Letter modes draw from all 40 glyphs; word
  // modes from the full word bank; "smart" is the spaced-repetition batch.
  // Titles/descriptions come from the UI-chrome tables (practice.modes.<key>).
  var PRACTICE_MODES = [
    { key: 'smart',      icon: '🧠' },
    { key: 'r2w',        icon: '🔤' },
    { key: 'w2r',        icon: '🔁' },
    { key: 'clue',       icon: '💡' },
    { key: 'wordfwd',    icon: '📖' },
    { key: 'wordback',   icon: '✍️' },
    { key: 'letterdraw', icon: '✏️' },
    { key: 'worddraw',   icon: '📝' }
  ];

  SCREENS.practiceHub = function () {
    var due = SRS.dueCount(state, now());
    var tiles = PRACTICE_MODES.map(function (pm) {
      var badge = (pm.key === 'smart' && due) ? '<span class="et-best">' + due + '</span>' : '';
      return '<button class="exam-test" data-action="startPractice" data-key="' + pm.key + '">' +
        '<span class="et-ic" aria-hidden="true">' + pm.icon + '</span>' +
        '<span class="et-meta"><span class="et-title">' + esc(t('practice.modes.' + pm.key + '.title')) + '</span><span class="et-desc">' + esc(t('practice.modes.' + pm.key + '.desc')) + '</span></span>' +
        badge + '</button>';
    }).join('');
    return '<div class="screen" style="padding-top:0">' + hud() +
      '<div class="center"><h2 data-focus>' + esc(t('practice.title')) + '</h2><p class="muted">' + esc(t('practice.subtitle')) + '</p></div>' +
      '<div class="exam-tests grow">' + tiles + '</div>' +
      '<div class="footer-actions stack"><button class="btn ghost" data-action="goVillage">' + esc(t('common.backVillage')) + '</button></div></div>';
  };

  function buildPracticeItems(key) {
    var all = GLYPHS.ORDER.slice();
    var words = CORE.fullWordBank();
    if (key === 'smart') {
      var batch = SRS.practiceBatch(state, now(), 10);
      if (!batch.length) batch = sample(all, 10);
      var pool = state.learned.length >= 4 ? state.learned.slice() : all;
      return batch.map(function (l, i) { return (i % 2 === 0) ? mcqLetter(l, pool, i % 4 === 0 ? 'r2w' : 'w2r') : { type: 'draw', letter: l }; });
    }
    if (key === 'r2w')  return sample(all, 12).map(function (l) { return mcqLetter(l, all, 'r2w'); });
    if (key === 'w2r')  return sample(all, 12).map(function (l) { return mcqLetter(l, all, 'w2r'); });
    if (key === 'clue') return sample(all, 12).map(function (l) { return mcqLetter(l, all, 'clue'); });
    if (key === 'wordfwd')  return sample(words, Math.min(8, words.length)).map(function (w) { return wordItem(w, words, 'fwd'); });
    if (key === 'wordback') return sample(words, Math.min(8, words.length)).map(function (w) { return wordItem(w, words, 'back'); });
    if (key === 'letterdraw') return sample(all, 8).map(function (l) { return { type: 'draw', letter: l }; });
    if (key === 'worddraw') {
      var short = words.filter(function (w) { return CORE.wordToRunes(w).length <= 5; });
      return sample(short.length ? short : words, Math.min(4, (short.length ? short : words).length)).map(function (w) { return { type: 'worddraw', word: w, runes: CORE.wordToRunes(w) }; });
    }
    return [];
  }

  // Exam/practice question builders ──────────────────────────────
  // Pools: prefer what the player has learned, but fall back to the full
  // alphabet / word bank so every exam & practice has material in any order
  // (lockdowns are gone — a fresh player can jump straight to any of them).
  function poolLetters() {
    return state.learned.length >= 4 ? state.learned.slice() : GLYPHS.ORDER.slice();
  }
  function poolWords() {
    var w = CORE.wordBank(state);
    return w.length >= 4 ? w : CORE.fullWordBank();
  }
  function mcqLetter(letter, pool, mode) {
    var others = pool.filter(function (l) { return l !== letter; });
    var opts = shuffle([letter].concat(sample(others, Math.min(3, others.length))));
    return { type: 'mcq', mode: mode, letter: letter, options: opts };
  }
  function wordItem(word, words, dir) {
    var runes = CORE.wordToRunes(word);
    var others = words.filter(function (w) { return w !== word; });
    if (dir === 'fwd') {
      return { type: 'wordmcq', dir: 'fwd', word: word, runes: runes, options: shuffle([word].concat(sample(others, Math.min(3, others.length)))) };
    }
    var optWords = shuffle([word].concat(sample(others, Math.min(3, others.length))));
    return { type: 'wordmcq', dir: 'back', word: word, runes: runes, options: optWords.map(function (w) { return { word: w, runes: CORE.wordToRunes(w) }; }) };
  }

  function buildExamItems(key) {
    var learned = poolLetters();
    var words = poolWords();
    if (key === 'letters') {
      return sample(learned, Math.min(8, learned.length)).map(function (l, i) { return mcqLetter(l, learned, i % 2 ? 'w2r' : 'r2w'); });
    }
    if (key === 'words') {
      return sample(words, Math.min(6, words.length)).map(function (w, i) { return wordItem(w, words, i % 2 ? 'back' : 'fwd'); });
    }
    if (key === 'letterdraw') {
      return sample(learned, Math.min(5, learned.length)).map(function (l) { return { type: 'draw', letter: l }; });
    }
    if (key === 'worddraw') {
      var short = words.filter(function (w) { return CORE.wordToRunes(w).length <= 5; });
      return sample(short.length ? short : words, Math.min(3, (short.length ? short : words).length)).map(function (w) { return { type: 'worddraw', word: w, runes: CORE.wordToRunes(w) }; });
    }
    return [];
  }
  function buildFinalItems() {
    var learned = poolLetters();
    var words = poolWords();
    var items = [];
    sample(learned, 6).forEach(function (l, i) { items.push(mcqLetter(l, learned, i % 2 ? 'w2r' : 'r2w')); });
    sample(words, 3).forEach(function (w, i) { items.push(wordItem(w, words, i % 2 ? 'back' : 'fwd')); });
    sample(learned, 4).forEach(function (l) { items.push({ type: 'draw', letter: l }); });
    var short = words.filter(function (w) { return CORE.wordToRunes(w).length <= 5; });
    sample(short.length ? short : words, 2).forEach(function (w) { items.push({ type: 'worddraw', word: w, runes: CORE.wordToRunes(w) }); });
    return shuffle(items);
  }

  // Shared runner for the quiz (exam or practice) ───────────────
  SCREENS.quiz = function () {
    var item = quiz.items[quiz.idx];
    var head = '<div class="mg-head"><h3 style="margin:0" data-focus>' + esc(quiz.title) + '</h3><span class="mg-progress">' + (quiz.idx + 1) + ' / ' + quiz.items.length + '</span></div>';
    var body;
    if (item.type === 'mcq') {
      if (item.mode === 'r2w') {
        body = '<p class="mg-instr">' + esc(t('quiz.r2w')) + '</p><div class="mg-stim"><div class="rune-frame" data-draw>' + glyphSVG(item.letter) + '</div></div>' +
          '<div class="options">' + item.options.map(function (l) { var info = letterInfo(l); return '<button class="opt word" data-action="quizPick" data-letter="' + l + '"><span class="oe" aria-hidden="true">' + info.emoji + '</span><span>' + esc(info.word) + '</span></button>'; }).join('') + '</div>';
      } else if (item.mode === 'clue') {
        var infoC = letterInfo(item.letter);
        body = '<p class="mg-instr">' + esc(t('quiz.clue')) + '</p><div class="mg-stim"><div class="clue-stim"><span class="ce" aria-hidden="true">' + infoC.emoji + '</span>' + esc(infoC.clue) + '</div></div>' +
          '<div class="options runes">' + item.options.map(function (l) { return '<button class="opt rune" data-action="quizPick" data-letter="' + l + '" aria-label="' + esc(t('a11y.signOf', { letter: l })) + '">' + glyphSVG(l) + '</button>'; }).join('') + '</div>';
      } else {
        var info0 = letterInfo(item.letter);
        body = '<p class="mg-instr">' + esc(t('quiz.w2r')) + '</p><div class="mg-stim"><div class="word-stim"><span class="we" aria-hidden="true">' + info0.emoji + '</span><span class="ww">' + esc(info0.word) + '</span></div></div>' +
          '<div class="options runes">' + item.options.map(function (l) { return '<button class="opt rune" data-action="quizPick" data-letter="' + l + '" aria-label="' + esc(t('a11y.signOf', { letter: l })) + '">' + glyphSVG(l) + '</button>'; }).join('') + '</div>';
      }
    } else if (item.type === 'wordmcq') {
      if (item.dir === 'fwd') {
        body = '<p class="mg-instr">' + esc(t('quiz.wordfwd')) + '</p><div class="mg-stim word-runes" data-draw>' + runeRow(item.runes) + '</div>' +
          '<div class="options">' + item.options.map(function (w) { return '<button class="opt word" data-action="quizPickWord" data-word="' + esc(w) + '"><span>' + esc(w) + '</span></button>'; }).join('') + '</div>';
      } else {
        body = '<p class="mg-instr">' + t('quiz.wordback', { word: esc(item.word) }) + '</p>' +
          '<div class="options wordrows">' + item.options.map(function (o, i) { return '<button class="opt wordrow-opt" data-action="quizPickWord" data-word="' + esc(o.word) + '" aria-label="' + esc(t('a11y.wordInRunes', { word: o.word })) + '">' + runeRow(o.runes) + '</button>'; }).join('') + '</div>';
      }
    } else if (item.type === 'draw') {
      var di = letterInfo(item.letter);
      body = '<p class="mg-instr">' + t('draw.fromMemory', { letter: item.letter }) + ' <span class="muted">(' + di.emoji + ' ' + esc(di.word) + ')</span></p>' +
        '<div class="draw-wrap"><div class="padmount" data-letter="' + item.letter + '"></div></div>' +
        '<div class="draw-controls"><button class="btn ghost small" data-action="drawClear">' + esc(t('draw.clear')) + '</button><button class="btn ghost small" data-action="peek">' + esc(t('draw.peek')) + '</button></div>' +
        '<div id="drawhint" class="mg-feedback" aria-live="polite"></div>' +
        '<div class="footer-actions stack"><button class="btn" data-action="quizDrawCheck">' + esc(t('draw.check')) + '</button><button class="btn ghost small" data-action="quizDrawSkip" style="margin:0 auto">' + esc(t('draw.skip')) + '</button></div>';
    } else if (item.type === 'worddraw') {
      var cells = item.runes.slice().reverse().map(function (r, i) { return '<div class="wordcell"><div class="wc-target" aria-label="' + esc(t('worddraw.targetAria', { letter: r })) + '">' + esc(r) + '</div><div class="padmount small" data-letter="' + r + '" data-size="86"></div><button class="btn ghost wc-clear" data-action="wordCellClear" aria-label="' + esc(t('worddraw.cellClearAria', { letter: r })) + '">' + esc(t('draw.clear')) + '</button><div class="wc-lbl" id="wc-' + i + '"></div></div>'; }).join('');
      body = '<p class="mg-instr">' + t('worddraw.perCell', { word: esc(item.word) }) + '</p>' +
        '<div class="wordcells">' + cells + '</div>' +
        '<div id="drawhint" class="mg-feedback" aria-live="polite"></div>' +
        '<div class="footer-actions stack"><button class="btn" data-action="quizWordCheck">' + esc(t('draw.check')) + '</button><button class="btn ghost small" data-action="quizDrawSkip" style="margin:0 auto">' + esc(t('draw.skip')) + '</button></div>';
    }
    var footer = (item.type === 'draw' || item.type === 'worddraw') ? '' : '<div class="mg-feedback" id="mgfb" aria-live="assertive"></div>';
    return '<div class="screen" style="padding-top:0">' + hud({ home: true }) + rtlSideHint() + head + '<div class="grow">' + body + '</div>' + footer + '</div>';
  };

  SCREENS.examResult = function () {
    var key = quiz.key, isFinal = key === 'final';
    var ratio = quiz.total ? quiz.correct / quiz.total : 0;
    var pct = Math.round(ratio * 100);
    var passed = ratio >= 0.8;
    var rankLine = '';
    if (isFinal && state.exam.rank) rankLine = '<div class="rank-badge"><div class="muted">' + esc(t('exam.rankLabel')) + '</div><div class="rk">' + esc(examRankLabel(state.exam.rank)) + '</div></div>';
    return '<div class="screen" style="padding-top:0">' + hud() +
      '<div class="celebrate grow"><div class="big" aria-hidden="true">' + (passed ? '🎉' : '💪') + '</div>' +
        '<h2 data-focus>' + (isFinal ? esc(t('exam.finalTitle')) : esc(quiz.title)) + '</h2>' +
        '<div class="big-score">' + pct + '%</div>' +
        '<p class="muted">' + esc(t('exam.correctOf', { c: quiz.correct, t: quiz.total })) + '</p>' +
        rankLine +
        '<p>' + (passed ? esc(t('exam.passed')) : esc(t('exam.failed'))) + '</p></div>' +
      '<div class="footer-actions stack">' +
        '<button class="btn" data-action="openExam" data-focus>' + esc(t('exam.backToExams')) + '</button>' +
        '<button class="btn ghost" data-action="goVillage">' + esc(t('common.backVillage')) + '</button></div></div>';
  };

  SCREENS.reviewDone = function () {
    var due = SRS.dueCount(state, now());
    return '<div class="screen" style="padding-top:0">' + hud() +
      '<div class="celebrate grow"><div class="big" aria-hidden="true">🔁</div>' +
        '<h2 data-focus>' + esc(t('review.title')) + '</h2>' +
        '<div class="big-score">' + quiz.correct + ' / ' + quiz.total + '</div>' +
        '<p class="muted">' + esc(t('review.recall')) + '</p>' +
        '<p>' + (due ? esc(t('review.due', { n: due })) : esc(t('review.allFresh'))) + '</p></div>' +
      '<div class="footer-actions stack">' +
        (due ? '<button class="btn" data-action="startReview" data-focus>' + esc(t('review.keepGoing')) + '</button>' : '') +
        '<button class="btn ghost" data-action="goVillage">' + esc(t('common.backVillageHome')) + '</button></div></div>';
  };

  SCREENS.decode = function () {
    var seq = DATA.isten.sequence;
    var cells = seq.slice().reverse().map(function (s, i) {
      return '<div class="decode-cell" data-cell="' + i + '"><div data-draw>' + glyphSVG(s.letter, s.fromWord) + '</div><div class="dl">' + s.letter + '</div><div class="dw">' + esc(s.emoji + ' ' + s.fromWord) + '</div></div>';
    }).join('');
    // When the UI is not Hungarian, the overlay supplies `isten.explain`: a short
    // note that the glyphs spell ISTEN ("God") in Hungarian and why (the secret is
    // the Hungarian artifact, kept in every language).
    var explain = DATA.isten.explain ? '<p class="muted decode-explain" style="opacity:0;transition:opacity .6s">' + esc(DATA.isten.explain) + '</p>' : '';
    return '<div class="screen center" style="padding-top:0">' + hud() +
      '<div class="grow stack" style="display:flex;flex-direction:column;justify-content:center">' +
        '<h2 data-focus>' + esc(t('decode.title')) + '</h2><p class="muted">' + esc(t('decode.rtl')) + '</p>' +
        '<div class="decode-row">' + cells + '</div>' +
        '<div class="isten-word" id="istenword" aria-live="polite"></div>' +
        '<p class="muted" id="istensub" style="opacity:0;transition:opacity .6s">' + esc(DATA.isten.subtitle) + '</p>' + explain + '</div>' +
      '<div class="footer-actions"><button class="btn" id="decodeNext" data-action="goEnding" style="opacity:0;transition:opacity .5s" disabled>' + esc(t('nav.next')) + '</button></div></div>';
  };

  SCREENS.ending = function () {
    var rank = CORE.rankFor(state.hearts);
    var grid = GLYPHS.ORDER.map(function (l) { return '<div class="gcell"><div>' + glyphSVG(l) + '</div><div class="gl">' + l + '</div></div>'; }).join('');
    return '<div class="screen" style="padding-top:0">' + hud() +
      '<div class="center"><h2 data-focus>' + esc(t('ending.title')) + '</h2>' + DATA.isten.text.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      '<div class="rank-badge"><div class="muted">' + esc(t('ending.rankLabel')) + '</div><div class="rk">' + esc(rank) + '</div>' +
        '<div class="summary-row" style="margin-bottom:0"><span class="s-star">⭐ ' + state.wisdom + '</span><span class="s-heart">❤️ ' + state.hearts + '</span><span class="s-rune">📜 40/40</span></div></div>' +
      '<div class="fact" style="margin:12px 0"><span class="tag">' + esc(t('ending.goodToKnow')) + '</span>' + esc(DATA.isten.rtlNote) + '</div>' +
      '<h3 class="center">' + esc(t('ending.allRunes')) + '</h3><div class="rune-grid">' + grid + '</div>' +
      '<div class="footer-actions stack">' +
        '<button class="btn" data-action="openExam">' + esc(t('ending.examBtn')) + '</button>' +
        '<button class="btn ghost" data-action="goVillage">' + esc(t('common.backVillageHome')) + '</button></div></div>';
  };

  // ── Rovás-relic card (at the end of a lesson) ───────────────
  function relicCard(num) {
    var r = DATA.relics[num];
    if (!r) return '';
    var media;
    if (r.type === 'photo') {
      media = '<img class="relic-img" src="assets/relics/' + r.img + '.jpg" alt="' + esc(t('relic.imgAlt', { name: r.name })) + '" loading="lazy">';
    } else {
      var runes = CORE.wordToRunes(r.text) || [];
      media = '<div class="relic-runes" data-draw>' + runeRow(runes) + '</div>';
    }
    return '<div class="relic-card">' +
      '<div class="relic-tag">' + esc(t('relic.tag')) + '</div>' + media +
      '<div class="relic-cap"><b>' + esc(r.name) + '</b> · ' + esc(r.date) +
        '<div class="muted">' + esc(r.place) + '</div>' + esc(r.note) + '</div>' +
    '</div>';
  }

  function numberSVG(v) {
    var s = (GLYPHS.NUMBERS && GLYPHS.NUMBERS[v]) || [];
    return '<svg viewBox="0 0 100 100" class="numsvg" aria-hidden="true">' + s.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</svg>';
  }
  function showNumbers() {
    var nm = DATA.numerals;
    var signs = nm.signs.map(function (s) {
      return '<div class="numsign">' + numberSVG(s.v) + '<div class="nv">' + s.v + '</div><div class="nd">' + esc(s.desc) + '</div></div>';
    }).join('');
    var ex = nm.examples.map(function (e) {
      return '<div class="numex"><span class="ne-n">' + e.n + '</span><span class="ne-eq">=</span><span class="ne-r">' + e.signs.map(numberSVG).join('') + '</span><div class="muted">(' + esc(e.say) + ')</div></div>';
    }).join('');
    showOverlay('<h2>' + esc(t('numbers.title')) + '</h2><p>' + esc(nm.intro) + '</p>' +
      '<div class="numsigns">' + signs + '</div>' +
      '<h3 style="margin-top:10px">' + esc(t('numbers.examples')) + '</h3><div class="numexamples">' + ex + '</div>' +
      '<p class="muted" style="font-size:.9rem">' + esc(nm.tip) + '</p>' +
      '<button class="btn" data-action="closeOverlay" style="margin-top:8px">' + esc(t('common.gotIt')) + '</button>');
  }

  // ── Help ────────────────────────────────────────────────────
  function showHelp() {
    var items = t('help.items');
    showOverlay('<h2>' + esc(t('help.title')) + '</h2>' + items.map(function (it) { return '<div class="help-item"><span class="hi" aria-hidden="true">' + it[0] + '</span><span class="ht">' + it[1] + '</span></div>'; }).join('') +
      '<button class="btn" data-action="closeOverlay" style="margin-top:8px">' + esc(t('common.gotIt')) + '</button>');
  }
  // One-time tip pointing at the (easily missed) music control, shown on the first
  // visit to the village. Self-gates on a saved flag; if another overlay (e.g. the
  // onboarding help) is open, it waits and is retried from closeOverlay().
  function maybeShowMusicTip() {
    if (!state || state.musicTipSeen) return;
    if (view.screen !== 'village') return;
    if (document.querySelector('.overlay')) return; // don't stack — retried on close
    state.musicTipSeen = true; save();
    showOverlay('<h2>' + esc(t('music.tipTitle')) + '</h2>' +
      '<p>' + t('music.tipBody') + '</p>' +
      '<button class="btn" data-action="closeOverlay" style="margin-top:8px">' + esc(t('common.gotIt')) + '</button>');
  }
  function showOverlay(html) {
    var ov = document.createElement('div'); ov.className = 'overlay'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = '<div class="modal">' + html + '</div>';
    ov.addEventListener('click', function (e) { if (e.target === ov) closeOverlay(); });
    document.body.appendChild(ov);
    var btn = ov.querySelector('.btn'); if (btn) btn.focus();
    document.addEventListener('keydown', escClose);
  }
  function escClose(e) { if (e.key === 'Escape') closeOverlay(); }
  function closeOverlay() { var ov = document.querySelector('.overlay'); if (ov) ov.remove(); document.removeEventListener('keydown', escClose); setTimeout(maybeShowMusicTip, 0); }

  var toastTimer;
  function toast(msg) {
    var t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
  function drawHint(msg, cls) { var h = document.getElementById('drawhint'); if (h) { h.className = 'mg-feedback ' + (cls || ''); h.textContent = msg; } }

  // ── Actions ─────────────────────────────────────────────────
  var ACTIONS = {
    help: showHelp,
    showNumbers: showNumbers,
    closeOverlay: closeOverlay,
    begin: function () { go('createProfile', { newChar: null, pfName: '' }); },
    switchProfile: function () { if (USERS.count() > 0) go('profiles'); else go('createProfile', { newChar: null }); },
    newProfile: function () { go('createProfile', { newChar: null, pfName: '' }); },
    pickProfile: function (d) {
      var u = USERS.get(d.id);
      if (u && !u.protected) { enterUser(d.id); }   // no password → log in directly
      else go('password', { userId: d.id });
    },
    pickChar: function (d) { view.pfName = (document.getElementById('pf-name') || {}).value || view.pfName || ''; go('createProfile', { newChar: d.id, pfName: view.pfName }); },
    deleteProfile: function (d) {
      var u = USERS.get(d.id); if (!u) return;
      if (!confirm(t('confirm.deleteProfile', { name: u.name }))) return;
      USERS.deleteUser(d.id); go('profiles');
    },
    createProfileSubmit: function (d, btn) {
      var name = (document.getElementById('pf-name') || {}).value || '';
      var pass = (document.getElementById('pf-pass') || {}).value || '';
      var character = view.newChar;
      var err = document.getElementById('pf-error');
      if (!name.trim()) { if (err) err.textContent = t('err.enterName'); return; }
      if (!character) { if (err) err.textContent = t('err.chooseHero'); return; }
      btn.setAttribute('disabled', ''); // the password is optional
      var hadUsers = USERS.count() > 0;
      USERS.createUser({ name: name.trim(), character: character, password: pass }).then(function (u) {
        currentUserId = u.id; USERS.setLast(u.id);
        var legacy = !hadUsers ? legacyState() : null;
        state = legacy || CORE.createState();
        state.character = character;
        if (legacy) { try { localStorage.removeItem(SAVE_PREFIX); } catch (e) {} }
        SRS.ensureCards(state, now()); save();
        go('pickDifficulty'); // choose difficulty, then continue to the village (onboarding fires there)
      });
    },
    doLogin: function (d, btn) {
      var pw = (document.getElementById('pw-input') || {}).value || '';
      btn.setAttribute('disabled', '');
      USERS.verify(view.userId, pw).then(function (okk) {
        if (okk) { enterUser(view.userId); }
        else { var er = document.getElementById('pw-error'); if (er) er.textContent = t('err.wrongPassword'); btn.removeAttribute('disabled'); var inp = document.getElementById('pw-input'); if (inp) { inp.value = ''; inp.focus(); } }
      });
    },

    locked: function () { toast(t('toast.locked')); },
    examLocked: function () { toast(t('toast.examLocked')); },
    openLesson: function (d) { if (!CORE.isLessonUnlocked(state, +d.num)) return; run = { num: +d.num, letterIdx: 0, beat: 0, wisdom: 0, hearts: 0, questions: null, qIdx: 0 }; go('lessonIntro'); },
    goVillage: function () { run = null; quiz = null; go('village'); },
    glyphStyle: function (d) { setGlyphStyle(d.style); render(); },
    setDifficulty: function (d) {
      if (!state || DIFF_LEVELS.indexOf(d.level) < 0) return;
      state.difficulty = d.level; save();
      toast(t('difficulty.saved', { level: t('difficulty.' + d.level) }));
      render();
    },
    pickDifficultyChoice: function (d) {
      if (state && DIFF_LEVELS.indexOf(d.level) >= 0) state.difficulty = d.level;
      save();
      go('village');
      if (!state.onboardingSeen) { state.onboardingSeen = true; save(); setTimeout(showHelp, 350); }
    },
    setLang: function (d) {
      I18N.setLocale(d.lang);
      if (window.__ROVAS_MUSIC && window.__ROVAS_MUSIC.relabel) window.__ROVAS_MUSIC.relabel();
      render();
    },
    startLetters: function () { run.letterIdx = 0; run.beat = 0; go('letterBeat'); },

    beatNext: function () {
      if (run.beat < BEAT_COUNT - 1) { run.beat++; render(); return; }
      var letter = CORE.getLesson(run.num).letters[run.letterIdx];
      if (letterInfo(letter).emotional) { go('emotional'); return; }
      advanceLetter();
    },
    beatBack: function () { if (run.beat > 0) { run.beat--; render(); } },
    drawClear: function () { if (pads[0]) pads[0].clear(); drawHint(''); },
    // Word-draw has one pad per cell; clear ONLY the cell whose button was pressed (a global
    // clear-all would wipe the good cells). Position-independent → immune to the RTL reverse.
    wordCellClear: function (d, btn) {
      var cell = btn && btn.closest('.wordcell'); if (!cell) return;
      var host = cell.querySelector('.padmount');
      if (host && host._pad) host._pad.clear();
      var lbl = cell.querySelector('.wc-lbl'); if (lbl) { lbl.textContent = ''; lbl.className = 'wc-lbl'; }
      drawHint('');
    },
    drawUndo: function () { if (pads[0]) pads[0].undo(); },
    peek: function () {
      if (!pads[0]) return;
      var letter = app.querySelector('.padmount').dataset.letter;
      pads[0].setGhost(letter);
      setTimeout(function () { if (pads[0]) pads[0].setGhost(null); }, 700);
    },
    learnDrawCheck: function () {
      var host = app.querySelector('.padmount'); if (!host || !host._pad) return;
      var letter = host.dataset.letter;
      var j = REC.judge(letter, host._pad.getPoints(), { difficulty: state.difficulty });
      if (j.ok) {
        drawHint(j.mirrored ? t('draw.mirrored') : (j.close ? t('draw.almostAccepted') : t('draw.nice')), 'good');
        if (run.beat === 3) { SRS.record(state, letter, true, now()); save(); }
        setTimeout(function () { ACTIONS.learnDrawSkip(); }, reduced ? 200 : 850);
      } else if (j.reason === 'tooFew' || j.reason === 'tooSmall') {
        drawHint(t('draw.bigger'), 'bad');
      } else {
        drawHint(t('draw.notQuite'), 'bad');
      }
    },
    learnDrawSkip: function () {
      if (run.beat < BEAT_COUNT - 1) { run.beat++; render(); return; }
      advanceLetter();
    },

    emoChoose: function (d) {
      var letter = CORE.getLesson(run.num).letters[run.letterIdx];
      var emo = letterInfo(letter).emotional;
      if (emo.choices[+d.i].kind === 'heart') run.hearts++;
      go('emotional', { emoResult: +d.i });
    },
    emoContinue: function () { advanceLetter(); },

    answer: function (d, btn) {
      if (run.answered) return;
      var q = run.questions[run.qIdx];
      var correct = CORE.checkAnswer(q, d.letter);
      run.answered = true;
      var allOpts = app.querySelectorAll('.opt');
      Array.prototype.forEach.call(allOpts, function (o) { o.setAttribute('disabled', ''); });
      var fb = document.getElementById('mgfb');
      if (correct) {
        btn.classList.add('correct');
        if (run.firstAttempt) run.wisdom++;
        if (fb) { fb.className = 'mg-feedback good'; fb.textContent = pick(DATA.feedback.right); }
        setTimeout(nextQuestion, reduced ? 250 : 900);
      } else {
        btn.classList.add('wrong'); run.firstAttempt = false;
        var right = Array.prototype.filter.call(allOpts, function (o) { return o.dataset.letter === q.letter; })[0];
        if (right) right.classList.add('correct');
        if (fb) { fb.className = 'mg-feedback bad'; fb.textContent = pick(DATA.feedback.wrong); }
        setTimeout(function () { run.answered = false; go('minigame'); }, reduced ? 600 : 1500);
      }
    },

    // Quiz (exam + practice)
    quizPick: function (d, btn) { quizMcqAnswer(d.letter === quiz.items[quiz.idx].letter, btn, '.opt', function (o) { return o.dataset.letter === quiz.items[quiz.idx].letter; }); },
    quizPickWord: function (d, btn) { var it = quiz.items[quiz.idx]; quizMcqAnswer(d.word === it.word, btn, '.opt', function (o) { return o.dataset.word === it.word; }); },
    quizDrawCheck: function () {
      var host = app.querySelector('.padmount'); if (!host || !host._pad) return;
      var j = REC.judge(host.dataset.letter, host._pad.getPoints(), { difficulty: state.difficulty, strict: quiz.mode === 'exam' });
      recDebug('draw', host.dataset.letter, host._pad, j);
      if (j.ok) { drawHint(j.mirrored ? t('draw.mirrored') : t('draw.exact'), 'good'); quizScore(true, 1); setTimeout(quizNext, reduced ? 200 : 800); }
      else if (j.reason === 'tooFew' || j.reason === 'tooSmall') { drawHint(t('draw.bigger'), 'bad'); }
      else { drawHint(t('draw.notQuiteSkip'), 'bad'); }
    },
    quizDrawSkip: function () { quizScore(false, 1); quizNext(); },
    quizWordCheck: function () {
      var hosts = app.querySelectorAll('.padmount');
      var item = quiz.items[quiz.idx], okCount = 0;
      Array.prototype.forEach.call(hosts, function (host, i) {
        var j = host._pad ? REC.judge(host.dataset.letter, host._pad.getPoints(), { difficulty: state.difficulty, strict: quiz.mode === 'exam' }) : { ok: false };
        recDebug('word cell ' + i, host.dataset.letter, host._pad, j);
        var lbl = document.getElementById('wc-' + i);
        if (lbl) { lbl.textContent = j.ok ? '✓' : '✗'; lbl.className = 'wc-lbl ' + (j.ok ? 'good' : 'bad'); }
        if (j.ok) okCount++;
      });
      drawHint(t('worddraw.score', { ok: okCount, total: hosts.length }), okCount === hosts.length ? 'good' : 'bad');
      quizScore(okCount, hosts.length);
      var checkBtn = app.querySelector('[data-action="quizWordCheck"]');
      if (checkBtn) { checkBtn.textContent = t('nav.next'); checkBtn.setAttribute('data-action', 'quizWordNext'); }
      var skipBtn = app.querySelector('[data-action="quizDrawSkip"]');
      if (skipBtn) { skipBtn.style.display = 'none'; }
    },
    quizWordNext: function () { quizNext(); },

    openExam: function () { quiz = null; go('examHub'); },
    openAlphabets: function () { go('alphabets'); },
    openPractice: function () { quiz = null; go('practiceHub'); },
    startExamTest: function (d) { startQuiz('exam', d.key, t('exam.tests.' + d.key + '.title'), buildExamItems(d.key)); },
    startFinal: function () { startQuiz('exam', 'final', t('exam.finalTitle'), buildFinalItems()); },
    startPractice: function (d) {
      var mode = PRACTICE_MODES.filter(function (pm) { return pm.key === d.key; })[0];
      startQuiz('review', d.key, mode ? t('practice.modes.' + mode.key + '.title') : t('practice.fallbackTitle'), buildPracticeItems(d.key));
    },
    // Alias kept for the "keep practicing" button on the practice-done screen.
    startReview: function () { ACTIONS.startPractice({ key: 'smart' }); },

    goDecode: function () { go('decode'); setTimeout(playDecode, reduced ? 50 : 600); },
    goEnding: function () { state.istenSolved = true; state.finished = true; save(); go('ending'); }
  };

  // ── Quiz control ────────────────────────────────────────────
  function startQuiz(mode, key, title, items) {
    items = items.filter(Boolean);
    if (!items.length) { toast(t('toast.noMaterial')); return; }
    quiz = { mode: mode, key: key, title: title, items: items, idx: 0, correct: 0, total: 0, answered: false };
    go('quiz');
  }
  function quizMcqAnswer(correct, btn, sel, isRightFn) {
    if (quiz.answered) return; quiz.answered = true;
    var opts = app.querySelectorAll(sel);
    Array.prototype.forEach.call(opts, function (o) { o.setAttribute('disabled', ''); });
    var item = quiz.items[quiz.idx];
    if (correct) btn.classList.add('correct');
    else { btn.classList.add('wrong'); var right = Array.prototype.filter.call(opts, isRightFn)[0]; if (right) right.classList.add('correct'); }
    var fb = document.getElementById('mgfb'); if (fb) { fb.className = 'mg-feedback ' + (correct ? 'good' : 'bad'); fb.textContent = correct ? pick(DATA.feedback.right) : pick(DATA.feedback.wrong); }
    recordSrs(item, correct);
    quizScore(correct ? 1 : 0, 1, true);
    setTimeout(quizNext, reduced ? 350 : (correct ? 850 : 1300));
  }
  function quizScore(correct, total, fromMcq) {
    quiz.correct += correct; quiz.total += total;
    if (!fromMcq) recordSrs(quiz.items[quiz.idx], correct >= total);
  }
  // Update spaced-repetition only for letters the player has actually learned,
  // so practising the full alphabet never leaves orphan cards that dueLetters
  // (which iterates state.learned) could never surface.
  function recordSrs(item, correct) {
    if (quiz.mode !== 'review' || !item || !item.letter) return;
    if (state.learned.indexOf(item.letter) === -1) return;
    SRS.record(state, item.letter, correct, now()); save();
  }
  function quizNext() {
    quiz.answered = false; quiz.idx++;
    if (quiz.idx >= quiz.items.length) { finishQuiz(); return; }
    go('quiz');
  }
  function finishQuiz() {
    if (quiz.mode === 'exam') {
      if (quiz.key === 'final') CORE.completeFinalExam(state, quiz.correct, quiz.total);
      else CORE.recordExamResult(state, quiz.key, quiz.correct, quiz.total);
      save(); go('examResult');
    } else { save(); go('reviewDone'); }
  }

  function advanceLetter() {
    run.letterIdx++; run.beat = 0;
    if (run.letterIdx >= CORE.getLesson(run.num).letters.length) { startMinigame(); return; }
    go('letterBeat');
  }
  function startMinigame() { run.questions = CORE.buildQuestions(run.num); run.qIdx = 0; run.wisdom = 0; run.answered = false; run.firstAttempt = true; go('minigame'); }
  function nextQuestion() { run.answered = false; run.qIdx++; if (run.qIdx >= run.questions.length) { finishLesson(); return; } run.firstAttempt = true; go('minigame'); }
  function finishLesson() { CORE.completeLesson(state, run.num, { wisdom: run.wisdom, hearts: run.hearts }); save(); go('lessonComplete'); }

  function playDecode() {
    var cells = app.querySelectorAll('.decode-cell');
    var word = document.getElementById('istenword'), sub = document.getElementById('istensub'), nextBtn = document.getElementById('decodeNext');
    var letters = DATA.isten.sequence.map(function (s) { return s.letter; });
    var i = 0, step = reduced ? 200 : 900;
    (function reveal() {
      if (i < cells.length) { cells[cells.length - 1 - i].classList.add('on'); if (word) word.textContent = letters.slice(0, i + 1).join(''); i++; setTimeout(reveal, step); }
      else { if (word) word.textContent = DATA.isten.word; if (sub) sub.style.opacity = '1'; var ex = document.querySelector('.decode-explain'); if (ex) ex.style.opacity = '1'; if (nextBtn) { nextBtn.style.opacity = '1'; nextBtn.removeAttribute('disabled'); nextBtn.focus(); } }
    })();
  }

  // ── Event delegation ────────────────────────────────────────
  document.addEventListener('click', function (e) {
    // Collapse an open language popover when clicking anywhere outside it.
    var dd = document.querySelector('.lang-dd[open]');
    if (dd && !dd.contains(e.target)) dd.removeAttribute('open');
    var t = e.target.closest('[data-action]');
    if (!t || t.hasAttribute('disabled')) return;
    var fn = ACTIONS[t.dataset.action];
    if (fn) fn(t.dataset, t, e);
  });
  // Enter in the password/name fields
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    if (view.screen === 'password') { var b = app.querySelector('[data-action="doLogin"]'); if (b) b.click(); }
    else if (view.screen === 'createProfile' && e.target && e.target.id === 'pf-pass') { var b2 = app.querySelector('[data-action="createProfileSubmit"]'); if (b2) b2.click(); }
  });

  // ── Ember background ────────────────────────────────────────
  (function embers() {
    if (reduced) return;
    var host = document.getElementById('embers'); if (!host) return;
    for (var i = 0; i < 14; i++) {
      var e = document.createElement('span'); e.className = 'ember';
      e.style.left = (Math.random() * 100) + '%';
      e.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
      var dur = 7 + Math.random() * 8;
      e.style.animationDuration = dur + 's'; e.style.animationDelay = (-Math.random() * dur) + 's';
      e.style.width = e.style.height = (3 + Math.random() * 4) + 'px';
      host.appendChild(e);
    }
  })();

  // ── Startup ─────────────────────────────────────────────────
  function enterUser(id) {
    currentUserId = id; USERS.setLast(id);
    state = loadStateFor(id); SRS.ensureCards(state, now()); save();
    go('village');
  }

  function boot() {
    I18N.init();   // auto-detect locale (or restore the saved choice) + apply content
    if (USERS.count() > 0) go('profiles');
    else go('intro');
  }
  boot();

  // for testing / debugging
  window.__ROVAS = {
    get state() { return state; }, get run() { return run; }, get quiz() { return quiz; },
    get view() { return view; }, get userId() { return currentUserId; },
    go: go, boot: boot,
    // e2e: "draws in" the correct letter on every drawing surface (based on data-letter)
    autoDraw: function (jitter, mirror) {
      Array.prototype.forEach.call(app.querySelectorAll('.padmount'), function (host) {
        if (host._pad && host.dataset.letter) host._pad.injectPoints(host.dataset.letter, jitter || 0, mirror || false);
      });
    }
  };
})();
