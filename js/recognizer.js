/*
 * SPDX-License-Identifier: AGPL-3.0-or-later · © 2026 · github.com/sicambria/rovas-tanulas
 *
 * recognizer.js — Recognition of hand-drawn rovás glyphs.
 *
 * Method: the $P Point-Cloud Recognizer (Vatavu, Anthony & Wobbrock, 2012) —
 * geometric template matching, NOT a neural network. The templates are
 * generated from the existing stroke sets (js/glyphs.js), so there is no
 * training data; the module is tiny, offline, deterministic, and testable from
 * Node (no DOM dependency).
 *
 * $P ignores the order, direction, and number of strokes — which is ideal for a
 * child, because however they draw the glyph it stays recognizable.
 */
(function (root) {
  'use strict';

  var GLYPHS = (typeof require !== 'undefined') ? require('./glyphs.js') : root.ROVAS_GLYPHS;
  // Alternative template variants (SVG-straightened + Unicode 8.0 Old Hungarian + as-drawn).
  // Optional: if absent, we work only with the glyphs.js (Forrai) base templates.
  var EXTRA_MOD = (function () {
    try { return (typeof require !== 'undefined') ? require('./glyph-templates-extra.js') : root.ROVAS_GLYPH_TEMPLATES_EXTRA; }
    catch (e) { return null; }
  })();
  var EXTRA = (EXTRA_MOD && EXTRA_MOD.EXTRA) || {};
  // Lenient-only as-drawn variants — folded into matching ONLY at beginner/intermediate
  // difficulty (NOT master), so a loosely-drawn glyph the user wants accepted at the easier
  // levels (e.g. Ó as a box, U as a rounded W, an un-mirrored C) still fails at master.
  var EXTRA_LENIENT = (EXTRA_MOD && EXTRA_MOD.EXTRA_LENIENT) || {};

  var N = 32; // number of sample points after normalization

  // Similar pairs: hard to tell apart from a drawing (flag length / arc depth / depth).
  // For these, the target being in the top-2 is also acceptable.
  // (Forrai) pairs hard to tell apart from a drawing — for these the target in the top-2 also counts.
  var TWINS = {
    'Í': 'J', 'J': 'Í',
    'O': 'Ó', 'Ó': 'O',
    'Ö': 'Ő', 'Ő': 'Ö',
    'U': 'Ú', 'Ú': 'U',
    // Cs/R are mutual nearest-neighbours under $P (two parallel stems dominate the cloud),
    // so the generic top-2 forgiveness rule treats them as interchangeable regardless. The
    // GHOST shapes are now visually distinct (authentic Cs has TWO diagonals — see
    // recogniser still accepts either for the other, acceptable in a no-fail game.
    'Cs': 'R', 'R': 'Cs',
    'G': 'S', 'S': 'G'
  };

  // The robust signal is the RANK (whether the target is the best / top-2 / top-3 hit);
  // distance only serves to rule out scribbles and grossly wrong shapes, so the cap is
  // generous. This is a children's game: lean toward leniency — the goal is to praise a
  // recognizable attempt, not to punish imperfect strokes.
  var T_OK = 125;    // best===target and dist ≤ T_OK → certain success
  var T_LOOSE = 155; // target in the top-2 and dist ≤ T_LOOSE → acceptable
  var MIN_POINTS = 8; // fewer points than this = scribble/accidental touch

  // Relative-margin acceptance (added on top of the rank-based rules above): a well-drawn
  // glyph can lose to a near-twin by a hair and slip past rank≤1 — so we ALSO accept the
  // target when its distance is within MARGIN× of the BEST hit and under an absolute CEIL.
  // The ceiling still rejects grossly-wrong shapes; the margin rescues the real failure
  // mode (e.g. the well-drawn É/J/G that were rejected). Two presets: learning/practice is
  // lenient, exams are a bit stricter (smaller margin + lower ceiling), but BOTH stay far
  // more forgiving than the rank-only rules were. Numbers set empirically via the 40-glyph
  // corpus in tests/run-tests.js (run with REC_SWEEP=1 to re-tune).
  var MARGIN = 1.20, CEIL = 180;             // lenient (learn / practice) — live values
  var MARGIN_STRICT = 1.12, CEIL_STRICT = 165; // exam / final exam
  var MARGIN_LOOSE = 1.32, CEIL_LOOSE = 205;   // beginner — extra headroom (tuned via REC_SWEEP)

  // ── Per-letter PRECISION CAP ────────────────────────────────────
  // An absolute "does the drawing even resemble THIS letter?" gate, applied at EVERY
  // difficulty (beginner included). The rank/margin rules below are deliberately generous, so
  // for a distinctive letter whose VALID forms cluster tightly they will still accept a
  // *partial* shape: a one-armed hook scored distance 68 against C (rank 0!) while real
  // two-armed C ("Cél" = arrow) drawings score ≤51 — yet several other letters' legit drawings
  // score worse than 68 (V:89, Z:79…), so NO global threshold can separate them. A per-letter
  // cap does: reject the target if its distance exceeds the cap, without touching any other
  // letter's leniency. Principle: leniency should widen tolerance for the CORRECT shape, not
  // accept INCORRECT ones. Seeded from the real-test corpus (real-test/) — grow it there, and
  var SHAPE_CAP = { 'C': 58 };

  // ── Difficulty → tolerance ──────────────────────────────────────
  // A device/profile difficulty selects how forgiving judging is. Each level maps the two
  // phases (everyday practice / exam) to a {m: margin, c: ceil} pair, plus whether to fold the
  // lenient-only as-drawn variants and whether to also try the horizontal mirror (rovás is
  // historically RTL, so a mirror-correct glyph is the right shape written the other way).
  //   • beginner     — extra-lenient everywhere, incl. exams ("accept on exams")
  //   • intermediate — today's behavior: lenient practice, strict exam
  //   • master        — strict everywhere; lenient variants OFF (so loose forms can fail)
  // Back-compat: callers passing only {strict:true|false} (no difficulty) resolve to
  // intermediate exam/practice — i.e. exactly the previous two presets for margin/ceil.
  //
  // Mirror note: horizontal-mirror acceptance is now ON at EVERY difficulty (see the DIFFICULTY
  // block below) — rovás is bidirectional, so a mirror-correct drawing is the right letter in the
  // other writing direction, flagged .mirrored for the UI. (Earlier this was beginner-only out of
  // a cross-accept concern; measured globally it is 4.7%, still ≤5%, so it is enabled everywhere.)
  // Mirror is ON at EVERY difficulty: rovás is genuinely bidirectional — the standard
  // (RTL) glyphs are the mirror of the LTR forms — so a mirror-correct drawing is the right
  // letter written the other way. judge() flags such an accept (.mirrored) so the UI can say
  // "you drew it mirrored — the other writing direction". Cost: cross-accept rises ~1.9%→4.7%
  // (still ≤5%), because a few letters whose mirror is another letter (O↔Ny, P↔Ö, G→S…) gain a
  // second match. Accepted as intended; the shape-confusability gates measure with mirror OFF
  // (opts.mirror===false) since distinctness is a separate axis from direction.
  var DIFFICULTY = {
    beginner:     { practice: { m: MARGIN_LOOSE, c: CEIL_LOOSE }, exam: { m: MARGIN_LOOSE, c: CEIL_LOOSE }, lenient: true,  mirror: true },
    intermediate: { practice: { m: MARGIN, c: CEIL },             exam: { m: MARGIN_STRICT, c: CEIL_STRICT }, lenient: true,  mirror: true },
    master:       { practice: { m: MARGIN_STRICT, c: CEIL_STRICT }, exam: { m: MARGIN_STRICT, c: CEIL_STRICT }, lenient: false, mirror: true }
  };
  function resolveTolerance(opts) {
    var d = DIFFICULTY[opts && opts.difficulty] || DIFFICULTY.intermediate;
    var t = (opts && opts.strict) ? d.exam : d.practice;
    // opts.mirror===false force-disables the mirror rescue (used by the shape-confusability
    // test gates, which must measure distinctness independent of the bidirectional axis).
    var mirror = (opts && opts.mirror === false) ? false : d.mirror;
    return { margin: t.m, ceil: t.c, includeLenient: d.lenient, mirror: mirror };
  }
  // Horizontal mirror of a point cloud (about its own x-extent), preserving stroke ids.
  function mirrorX(points) {
    var mx = -Infinity, mn = Infinity;
    points.forEach(function (p) { if (p.x > mx) mx = p.x; if (p.x < mn) mn = p.x; });
    return points.map(function (p) { return { x: (mx + mn) - p.x, y: p.y, id: p.id }; });
  }

  // ── Path → point sequence (M/L/C/Q/Z) ──────────────────────────
  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }

  function pushLine(out, a, b, id) {
    var len = dist(a, b);
    var steps = Math.max(1, Math.round(len / 3));
    for (var i = 1; i <= steps; i++) {
      var t = i / steps;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, id: id });
    }
  }
  function cubic(p0, p1, p2, p3, t) {
    var u = 1 - t, uu = u * u, tt = t * t;
    return {
      x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
      y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y
    };
  }
  function quad(p0, p1, p2, t) {
    var u = 1 - t;
    return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
  }
  function pushCurve(out, fn, id, steps) {
    for (var i = 1; i <= steps; i++) { var p = fn(i / steps); out.push({ x: p.x, y: p.y, id: id }); }
  }

  function strokeToPoints(d, id) {
    var out = [];
    var re = /([MLCQZ])([^MLCQZ]*)/gi, m;
    var cur = null, start = null;
    while ((m = re.exec(d))) {
      var cmd = m[1].toUpperCase();
      var a = (m[2].match(/-?\d*\.?\d+/g) || []).map(Number);
      if (cmd === 'M') { cur = { x: a[0], y: a[1] }; start = cur; out.push({ x: cur.x, y: cur.y, id: id }); }
      else if (cmd === 'L') { for (var i = 0; i < a.length; i += 2) { var p = { x: a[i], y: a[i + 1] }; pushLine(out, cur, p, id); cur = p; } }
      else if (cmd === 'C') {
        for (var c = 0; c < a.length; c += 6) {
          var p1 = { x: a[c], y: a[c + 1] }, p2 = { x: a[c + 2], y: a[c + 3] }, p3 = { x: a[c + 4], y: a[c + 5] };
          (function (s, cp1, cp2, e) { pushCurve(out, function (t) { return cubic(s, cp1, cp2, e, t); }, id, 14); })(cur, p1, p2, p3);
          cur = p3;
        }
      } else if (cmd === 'Q') {
        for (var q = 0; q < a.length; q += 4) {
          var qp1 = { x: a[q], y: a[q + 1] }, qp2 = { x: a[q + 2], y: a[q + 3] };
          (function (s, cp, e) { pushCurve(out, function (t) { return quad(s, cp, e, t); }, id, 12); })(cur, qp1, qp2);
          cur = qp2;
        }
      } else if (cmd === 'Z') { if (cur && start) { pushLine(out, cur, start, id); cur = start; } }
    }
    return out;
  }

  function strokesToCloud(strokes) {
    var cloud = [];
    (strokes || []).forEach(function (d, i) { cloud = cloud.concat(strokeToPoints(d, i)); });
    return cloud;
  }
  function glyphToCloud(letter) { return strokesToCloud(GLYPHS.GLYPHS[letter]); }

  // ── $P normalization ───────────────────────────────────────────
  function pathLength(pts) {
    var d = 0;
    for (var i = 1; i < pts.length; i++) { if (pts[i].id === pts[i - 1].id) d += dist(pts[i], pts[i - 1]); }
    return d;
  }
  function resample(points, n) {
    var pts = points.slice();
    var I = pathLength(pts) / (n - 1) || 1e-6;
    var D = 0, out = [pts[0]];
    for (var i = 1; i < pts.length; i++) {
      if (pts[i].id === pts[i - 1].id) {
        var d = dist(pts[i - 1], pts[i]);
        if (D + d >= I) {
          var t = (I - D) / d;
          var np = { x: pts[i - 1].x + t * (pts[i].x - pts[i - 1].x), y: pts[i - 1].y + t * (pts[i].y - pts[i - 1].y), id: pts[i].id };
          out.push(np); pts.splice(i, 0, np); D = 0;
        } else D += d;
      }
    }
    while (out.length < n) out.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y, id: pts[pts.length - 1].id });
    if (out.length > n) out = out.slice(0, n);
    return out;
  }
  function scale(points) {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    points.forEach(function (p) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
    var s = Math.max(maxX - minX, maxY - minY) || 1e-6;
    return points.map(function (p) { return { x: (p.x - minX) / s, y: (p.y - minY) / s, id: p.id }; });
  }
  function translateToOrigin(points) {
    var cx = 0, cy = 0;
    points.forEach(function (p) { cx += p.x; cy += p.y; });
    cx /= points.length; cy /= points.length;
    return points.map(function (p) { return { x: p.x - cx, y: p.y - cy, id: p.id }; });
  }
  function normalize(points) { return translateToOrigin(scale(resample(points, N))); }

  // ── $P matching ────────────────────────────────────────────────
  function cloudDistance(pts, tmpl, start) {
    var n = pts.length, matched = new Array(n), sum = 0, i = start;
    do {
      var min = Infinity, index = -1;
      for (var j = 0; j < n; j++) {
        if (!matched[j]) { var d = dist(pts[i], tmpl[j]); if (d < min) { min = d; index = j; } }
      }
      matched[index] = true;
      var weight = 1 - ((i - start + n) % n) / n;
      sum += weight * min;
      i = (i + 1) % n;
    } while (i !== start);
    return sum;
  }
  function greedyMatch(pts, tmpl) {
    var eps = 0.5, step = Math.max(1, Math.floor(Math.pow(pts.length, 1 - eps))), min = Infinity;
    for (var i = 0; i < pts.length; i += step) {
      min = Math.min(min, cloudDistance(pts, tmpl, i), cloudDistance(tmpl, pts, i));
    }
    // scale to the order of 100 for easier thresholding
    return min * 100;
  }

  // ── Templates (computed once) ──────────────────────────────────
  var TEMPLATES = null;            // letter → base (Forrai) template  [backward-compatible]
  var ALL_TEMPLATES = null;        // letter → [template, …]  (base + EXTRA variants)
  var ALL_TEMPLATES_LENIENT = null;// letter → [template, …]  (base + EXTRA + EXTRA_LENIENT)
  function templates() {
    if (TEMPLATES) return TEMPLATES;
    TEMPLATES = {}; ALL_TEMPLATES = {}; ALL_TEMPLATES_LENIENT = {};
    (GLYPHS.ORDER || Object.keys(GLYPHS.GLYPHS)).forEach(function (l) {
      var base = normalize(glyphToCloud(l));
      TEMPLATES[l] = base;
      var variants = [base];
      (EXTRA[l] || []).forEach(function (strokes) {
        var c = strokesToCloud(strokes);
        if (c.length >= 2) variants.push(normalize(c));
      });
      ALL_TEMPLATES[l] = variants;
      var lenient = variants.slice();
      (EXTRA_LENIENT[l] || []).forEach(function (strokes) {
        var c = strokesToCloud(strokes);
        if (c.length >= 2) lenient.push(normalize(c));
      });
      ALL_TEMPLATES_LENIENT[l] = lenient;
    });
    return TEMPLATES;
  }
  function allTemplates(includeLenient) {
    if (!ALL_TEMPLATES) templates();
    return includeLenient ? ALL_TEMPLATES_LENIENT : ALL_TEMPLATES;
  }

  // points: [{x,y}] or [{x,y,id}] (a per-stroke id is recommended). With no id, we treat it as one stroke.
  function prepare(points) {
    var pts = points.map(function (p, i) { return { x: p.x, y: p.y, id: (p.id == null ? 0 : p.id) }; });
    return pts;
  }
  function bbox(points) {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    points.forEach(function (p) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
    return { w: maxX - minX, h: maxY - minY };
  }

  function recognize(points, opts) {
    var includeLenient = !!(opts && opts.includeLenient);
    var pts = prepare(points);
    if (pts.length < MIN_POINTS) return { best: null, score: 0, distance: Infinity, ranked: [], tooFew: true };
    var cand = normalize(pts);
    templates();
    var all = allTemplates(includeLenient);
    // a letter's distance = the best fit among ALL its authentic variants
    // (Forrai + SVG + Unicode) → drawing any of the forms is recognized.
    var ranked = Object.keys(all).map(function (l) {
      var best = Infinity, vs = all[l];
      for (var i = 0; i < vs.length; i++) { var d = greedyMatch(cand, vs[i]); if (d < best) best = d; }
      return { letter: l, distance: best };
    });
    ranked.sort(function (a, b) { return a.distance - b.distance; });
    return { best: ranked[0].letter, distance: ranked[0].distance, score: Math.max(0, 1 - ranked[0].distance / 150), ranked: ranked };
  }

  // Decide whether a (single, already-prepared) cloud represents `target`, under a resolved
  // tolerance {margin, ceil, includeLenient}. RANK is the main signal; see judge() below.
  function judgeCloud(target, pts, tol) {
    var r = recognize(pts, { includeLenient: tol.includeLenient });
    var rank = r.ranked.findIndex(function (x) { return x.letter === target; });
    var targetDist = rank >= 0 ? r.ranked[rank].distance : Infinity;
    var bestDist = r.ranked.length ? r.ranked[0].distance : Infinity;
    // Precision cap (all difficulties): the drawing must genuinely resemble the target letter,
    // else reject however good its rank — blocks partial/wrong shapes the lenient rules below
    // would otherwise wave through (e.g. a one-armed hook as C).
    var cap = SHAPE_CAP[target];
    if (cap != null && targetDist > cap) return { ok: false, close: false, reason: 'shape', best: r.best, distance: targetDist, rank: rank };
    //  • target is the best hit → certain success (generous distance cap),
    //  • target is in the top-2 → we accept it (close).
    // The top-2 already accepts ~100% of genuine drawings, whereas the top-3 would
    // let too many wrong drawings through for the Forrai-faithful (inherently similar)
    // glyphs, so we drop it. For the twin pairs (Í/J, O/Ó…) the top-2 is satisfied automatically.
    if (r.best === target && targetDist <= T_OK) return { ok: true, close: false, reason: 'match', best: r.best, distance: targetDist, rank: rank };
    if (rank <= 1 && targetDist <= T_LOOSE) return { ok: true, close: true, reason: 'close', best: r.best, distance: targetDist, rank: rank };
    // Relative-margin rescue: the target is essentially as good a fit as the winner.
    if (targetDist <= bestDist * tol.margin && targetDist <= tol.ceil) return { ok: true, close: true, reason: 'close', best: r.best, distance: targetDist, rank: rank };
    return { ok: false, close: false, reason: 'mismatch', best: r.best, distance: targetDist, rank: rank };
  }

  // Judges whether the drawing represents the `target` letter.
  // opts.difficulty = 'beginner' | 'intermediate' | 'master' (default intermediate).
  // opts.strict = true → exam phase (a bit tighter within the difficulty); false → practice.
  // (Passing only {strict} and no difficulty reproduces the previous two presets exactly.)
  // Lenient, child-friendly judgment; rovás is organic (historically carved, now hand-drawn),
  // so we lean toward praising a recognizable attempt. → { ok, close, reason, best, distance, rank, mirrored }
  function judge(target, points, opts) {
    var tol = resolveTolerance(opts || {});
    var pts = prepare(points);
    if (pts.length < MIN_POINTS) return { ok: false, close: false, reason: 'tooFew', best: null, distance: Infinity, rank: -1 };
    var size = bbox(pts);
    if (size.w < 8 && size.h < 8) return { ok: false, close: false, reason: 'tooSmall', best: null, distance: Infinity, rank: -1 };
    var v = judgeCloud(target, pts, tol);
    // Mirror rescue: rovás is written right-to-left, so an otherwise-correct glyph drawn the
    // mirrored way is the right shape — accept it (flagged .mirrored) rather than reject.
    if (!v.ok && tol.mirror) {
      var m = judgeCloud(target, mirrorX(pts), tol);
      if (m.ok) { m.mirrored = true; return m; }
    }
    return v;
  }

  var api = {
    N: N, recognize: recognize, judge: judge, templates: templates,
    glyphToCloud: glyphToCloud, normalize: normalize, greedyMatch: greedyMatch,
    mirrorX: mirrorX, strokesToCloud: strokesToCloud,
    _thresholds: function () { return { T_OK: T_OK, T_LOOSE: T_LOOSE, MIN_POINTS: MIN_POINTS, MARGIN: MARGIN, CEIL: CEIL, MARGIN_STRICT: MARGIN_STRICT, CEIL_STRICT: CEIL_STRICT, MARGIN_LOOSE: MARGIN_LOOSE, CEIL_LOOSE: CEIL_LOOSE }; },
    _setThresholds: function (o) {
      if (o.T_OK != null) T_OK = o.T_OK; if (o.T_LOOSE != null) T_LOOSE = o.T_LOOSE;
      if (o.MARGIN != null) MARGIN = o.MARGIN; if (o.CEIL != null) CEIL = o.CEIL;
      if (o.MARGIN_STRICT != null) MARGIN_STRICT = o.MARGIN_STRICT; if (o.CEIL_STRICT != null) CEIL_STRICT = o.CEIL_STRICT;
      if (o.MARGIN_LOOSE != null) MARGIN_LOOSE = o.MARGIN_LOOSE; if (o.CEIL_LOOSE != null) CEIL_LOOSE = o.CEIL_LOOSE;
      DIFFICULTY.beginner.practice = DIFFICULTY.beginner.exam = { m: MARGIN_LOOSE, c: CEIL_LOOSE };
      DIFFICULTY.intermediate.practice = { m: MARGIN, c: CEIL }; DIFFICULTY.intermediate.exam = { m: MARGIN_STRICT, c: CEIL_STRICT };
      DIFFICULTY.master.practice = DIFFICULTY.master.exam = { m: MARGIN_STRICT, c: CEIL_STRICT };
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ROVAS_RECOGNIZER = api;
})(typeof window !== 'undefined' ? window : globalThis);
