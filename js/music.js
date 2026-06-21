/*
 * SPDX-License-Identifier: AGPL-3.0-or-later · © 2026 · github.com/sicambria/rovas-tanulas
 *
 * music.js — Background-music controller. A quiet, looped ambient bed that
 * evokes the mood of the steppe / 5th century (see music/CREDITS.md for the
 * sources and required attributions).
 *
 * Features:
 *   • automatic start on every page load,
 *   • play / pause / resume via a floating button,
 *   • handling browser autoplay blocking: if the browser blocks the immediate
 *     start, the music begins on the first user tap.
 *
 * Independent of screen re-rendering (ui.js): it adds the button to <body>
 * once and manages it on its own.
 */
(function () {
  'use strict';

  var I18N = window.ROVAS_I18N;
  function t(key, params) { return I18N.t(key, params); }

  // ── Playlist ────────────────────────────────────────────────
  // The detailed license/attribution lives in music/CREDITS.md.
  // i18n-ignore-start — track titles, artist names and CC licenses are proper
  // nouns / standardized identifiers, never translated.
  var PLAYLIST = [
    { file: 'music/04-ripples.mp3',             title: 'Ripples',           artist: 'Kevin MacLeod',   license: 'CC BY 4.0' },
    { file: 'music/06-lotus.mp3',               title: 'Lotus',             artist: 'Kevin MacLeod',   license: 'CC BY 4.0' },
    { file: 'music/07-duduk-improvisation.ogg', title: 'April (duduk)',     artist: 'SERGO.TEL',       license: 'CC BY 3.0' },
    { file: 'music/08-senbazuru.mp3',           title: 'Ezer daru',         artist: 'Kevin MacLeod',   license: 'CC BY 4.0' },
{ file: 'music/11-tabuk.mp3',               title: 'Tabuk',             artist: 'Kevin MacLeod',   license: 'CC BY 3.0' },
    { file: 'music/12-dawn-in-the-valley.mp3',  title: 'Dawn in the Valley',artist: 'Igor Marynowski', license: 'CC BY-NC' },
    { file: 'music/13-rast-saz-semai.mp3',      title: 'Rast Saz Semai',   artist: 'Igor Marynowski', license: 'CC BY-NC' }
  ];
  // i18n-ignore-end

  var VOLUME = 0.32; // quiet bed under a children's game

  // ── Audio ───────────────────────────────────────────────────
  var idx = 2;            // current track in the list; start with April (duduk)
  var started = false;    // whether it has started at least once
  var audio = new Audio();
  audio.preload = 'none';
  audio.volume = VOLUME;

  // Wraps around at the end of the list; each track is followed by the next.
  audio.addEventListener('ended', function () {
    idx = (idx + 1) % PLAYLIST.length;
    cue();
    audio.play()['catch'](function () {}); // 'ended' only fires after a user-initiated start
  });

  function cue() {
    var tr = PLAYLIST[idx];
    audio.src = tr.file;
    reflect();
  }

  // ── Controls ────────────────────────────────────────────────
  function play() {
    if (!audio.src) cue();
    var pr = audio.play();
    if (pr && pr['catch']) {
      pr.then(function () { started = true; reflect(); })
        ['catch'](function () { armGesture(); }); // e.g. autoplay blocking
    } else {
      started = true; reflect();
    }
  }
  function pause() { audio.pause(); reflect(); }

  // Switch to another track. Preserves the playback state: if playing, the new
  // track plays immediately; if paused, it only loads (the caption updates either way).
  function jump(n) {
    idx = (n + PLAYLIST.length) % PLAYLIST.length;
    var wasPlaying = !audio.paused;
    cue();
    if (wasPlaying) audio.play()['catch'](function () {});
  }
  function next() { jump(idx + 1); }
  function prev() { jump(idx - 1); }

  function toggle() {
    if (audio.paused) { play(); } else { pause(); }
  }

  // ── Autoplay ────────────────────────────────────────────────
  // Browsers block audio until a user gesture. We attempt an immediate start on
  // load; if it is blocked, we arm a ONE-TIME, document-wide listener that starts
  // the music on the very first user interaction (tap / click / key) and then
  // detaches itself. This is the closest to true autoplay the browser allows.
  var armed = false;
  function armGesture() {
    if (armed) return; armed = true;
    function start() {
      document.removeEventListener('pointerdown', start, true);
      document.removeEventListener('keydown', start, true);
      document.removeEventListener('touchstart', start, true);
      play();
    }
    document.addEventListener('pointerdown', start, true);
    document.addEventListener('keydown', start, true);
    document.addEventListener('touchstart', start, true);
  }

  // ── Floating control panel ──────────────────────────────────
  function mkBtn(cls, glyph, label, fn) {
    var b = document.createElement('button');
    b.className = cls; b.type = 'button';
    b.textContent = glyph; b.setAttribute('aria-label', label); b.title = label;
    b.addEventListener('click', fn);
    return b;
  }

  var expanded = false;

  function setExpanded(val) {
    expanded = val;
    bar.classList.toggle('music-expanded', expanded);
    expandBtn.textContent = expanded ? '×' : '⋯';
    expandBtn.setAttribute('aria-label', expanded ? t('music.close') : t('music.open'));
    expandBtn.title = expanded ? t('music.closeTitle') : t('music.panelTitle');
  }

  var bar      = document.createElement('div'); bar.className = 'musicbar';
  var nowEl    = document.createElement('div'); nowEl.className = 'music-now';
  nowEl.setAttribute('role', 'status'); nowEl.setAttribute('aria-live', 'polite');
  var ctrls    = document.createElement('div'); ctrls.className = 'music-ctrls';
  var prevEl   = mkBtn('music-skip', '⏮', t('music.prev'), prev);
  var btn      = mkBtn('musicbtn', '🎵', t('music.play'), toggle);
  var nextEl   = mkBtn('music-skip', '⏭', t('music.next'), next);
  var expandBtn = mkBtn('music-expand', '⋯', t('music.open'), function () { setExpanded(!expanded); });
  ctrls.appendChild(prevEl); ctrls.appendChild(btn); ctrls.appendChild(nextEl); ctrls.appendChild(expandBtn);
  bar.appendChild(nowEl); bar.appendChild(ctrls);

  function reflect() {
    var playing = !audio.paused;
    var tr = PLAYLIST[idx];
    btn.textContent = playing ? '⏸' : '🎵';
    btn.classList.toggle('playing', playing);
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    var label = playing ? t('music.pause') : t('music.play');
    btn.setAttribute('aria-label', label);
    btn.title = label;
    // "Now playing" caption — small text at the top of the panel
    nowEl.textContent = '♪ ' + tr.title + ' — ' + tr.artist;
    nowEl.classList.toggle('paused', !playing);
    nowEl.title = tr.title + ' — ' + tr.artist + ' (' + tr.license + ')';
  }

  // Re-apply control labels after a UI language switch (ui.js setLang calls this).
  function relabel() {
    prevEl.setAttribute('aria-label', t('music.prev')); prevEl.title = t('music.prev');
    nextEl.setAttribute('aria-label', t('music.next')); nextEl.title = t('music.next');
    setExpanded(expanded);
    reflect();
  }

  // Persisted on/off preference (default ON). Lets the tests — and any future mute
  // toggle — suppress the autostart without disabling the controls.
  function musicEnabled() {
    try { var p = JSON.parse(localStorage.getItem('rovas-music-v1')); return !(p && p.enabled === false); }
    catch (e) { return true; }
  }

  function mount() {
    document.body.appendChild(bar);
    cue();
    if (musicEnabled()) play(); // autostart on load; browser may defer it to the first gesture
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  // for testing / debugging
  window.__ROVAS_MUSIC = {
    play: play, pause: pause, toggle: toggle, next: next, prev: prev, relabel: relabel,
    get index() { return idx; },
    get playing() { return !audio.paused; },
    get track() { return PLAYLIST[idx]; },
    playlist: PLAYLIST
  };
})();
