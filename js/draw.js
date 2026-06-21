/*
 * SPDX-License-Identifier: AGPL-3.0-or-later · © 2026 · github.com/sicambria/rovas-tanulas
 *
 * draw.js — Reusable drawing canvas for tracing rovás glyphs.
 *
 * Pointer Events (mouse + touch + pen), devicePixelRatio-correct crisp lines,
 * scroll suppression while drawing, an optional faint "ghost" template (for
 * tracing). Returns points in the 0–100 coordinate space (matching the glyphs'
 * viewBox), so they feed directly into the recognizer (recognizer.js).
 */
(function (root) {
  'use strict';

  var GLYPHS = root.ROVAS_GLYPHS;

  function DrawPad(container, opts) {
    opts = opts || {};
    var size = Math.max(160, Math.min(opts.size || container.clientWidth || 280, 340));
    var dpr = Math.max(1, Math.min(root.devicePixelRatio || 1, 3));

    var canvas = document.createElement('canvas');
    canvas.className = 'drawpad';
    canvas.width = size * dpr; canvas.height = size * dpr;
    canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
    canvas.style.touchAction = 'none';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Rajzfelület — húzd meg a rovásjel vonalait');
    container.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    var strokes = [];       // [[{x,y}...]] in CSS pixels
    var cur = null;
    var ghost = opts.ghost || null; // letter label or null
    var onChange = opts.onChange || function () {};

    function redraw() {
      ctx.clearRect(0, 0, size, size);
      // ghost template
      if (ghost && GLYPHS.GLYPHS[ghost]) {
        ctx.save();
        ctx.scale(size / 100, size / 100);
        ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(255, 206, 107, 0.22)';
        GLYPHS.GLYPHS[ghost].forEach(function (d) { try { ctx.stroke(new Path2D(d)); } catch (e) {} });
        ctx.restore();
      }
      // the user's strokes
      ctx.lineWidth = size * 0.05; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = '#ffce6b';
      strokes.forEach(function (s) {
        if (s.length < 1) return;
        ctx.beginPath(); ctx.moveTo(s[0].x, s[0].y);
        for (var i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y);
        if (s.length === 1) { ctx.lineTo(s[0].x + 0.1, s[0].y + 0.1); }
        ctx.stroke();
      });
    }

    function pos(e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left), y: (e.clientY - r.top) };
    }
    function down(e) {
      e.preventDefault();
      cur = [pos(e)]; strokes.push(cur);
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      redraw();
    }
    function move(e) {
      if (!cur) return;
      e.preventDefault();
      var p = pos(e), last = cur[cur.length - 1];
      if (Math.abs(p.x - last.x) + Math.abs(p.y - last.y) >= 2) { cur.push(p); redraw(); }
    }
    function up(e) {
      if (!cur) return;
      cur = null; onChange();
    }

    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('pointerleave', up);

    redraw();

    // Points normalized into 0–100 space, with a per-stroke id (recognizer format).
    function getPoints() {
      var out = [];
      strokes.forEach(function (s, id) {
        s.forEach(function (p) { out.push({ x: p.x / size * 100, y: p.y / size * 100, id: id }); });
      });
      return out;
    }

    var api = {
      el: canvas,
      clear: function () { strokes = []; cur = null; redraw(); onChange(); },
      undo: function () { strokes.pop(); cur = null; redraw(); onChange(); },
      isEmpty: function () { return strokes.length === 0 || strokes.every(function (s) { return s.length < 2; }); },
      strokeCount: function () { return strokes.length; },
      getPoints: getPoints,
      setGhost: function (g) { ghost = g; redraw(); },
      // Test hook: "draws in" the template's points (stroke by stroke) so we can
      // simulate a deterministic, correct drawing in e2e tests.
      injectPoints: function (letter, jitter, mirror) {
        strokes = [];
        var R = root.ROVAS_RECOGNIZER;
        var cloud = R ? R.glyphToCloud(letter) : [];
        if (mirror && R) cloud = R.mirrorX(cloud); // test hook: draw the glyph mirrored (other direction)
        var byId = {};
        cloud.forEach(function (p) {
          var j = jitter ? (Math.random() - 0.5) * 2 * jitter : 0;
          (byId[p.id] = byId[p.id] || []).push({ x: (p.x + j) / 100 * size, y: (p.y + j) / 100 * size });
        });
        Object.keys(byId).forEach(function (k) { strokes.push(byId[k]); });
        cur = null; redraw(); onChange();
      },
      destroy: function () {
        canvas.removeEventListener('pointerdown', down);
        canvas.removeEventListener('pointermove', move);
        canvas.removeEventListener('pointerup', up);
        canvas.removeEventListener('pointercancel', up);
        canvas.removeEventListener('pointerleave', up);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    };
    return api;
  }

  root.ROVAS_DRAW = { DrawPad: DrawPad };
})(typeof window !== 'undefined' ? window : globalThis);
