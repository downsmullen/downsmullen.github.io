/*
 * fish.js - a small school of sea bass drifting over the page (easter egg).
 *
 * HOOK IN:   <script src="js/fish.js" defer></script>            (off until the visitor opts in)
 *            <script src="js/fish.js" defer data-autostart></script>   (on by default)
 * TOGGLE:    any element with data-seabass-toggle (e.g. a real <button>) toggles the fish;
 *            if it also carries aria-pressed, that attribute is kept in sync.
 *            The choice is remembered in localStorage ("seabass" = 1/0) and wins over data-autostart.
 * API:       window.SeaBass.start() / .stop() / .toggle() / .running  (all optional).
 * BEHAVIOUR: never created under prefers-reduced-motion: reduce (also reacts to changes);
 *            paused while the tab is hidden; canvas is pointer-events:none, aria-hidden.
 *            Clicks/taps send the fish to the pointer in a burst, then they mill and relax.
 * Swimming model: carangiform travelling wave, after VectorBattles docs/research-fish-swimming.md.
 */
(function () {
  'use strict';

  var script = document.currentScript;
  var AUTOSTART = !!(script && script.hasAttribute('data-autostart'));
  var KEY = 'seabass';
  var TAU = Math.PI * 2;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function reduced() { return !!(mq && mq.matches); }
  function load() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) {} }

  // Bass body: [s, half-height, centre offset] in body lengths (from VectorBattles aquariumModels.js).
  var PROFILE = [
    [0.00, 0.006, -0.010], [0.05, 0.040, -0.005], [0.12, 0.085, 0], [0.25, 0.120, 0.005],
    [0.40, 0.125, 0.005], [0.55, 0.105, 0.005], [0.70, 0.070, 0.004], [0.82, 0.040, 0.002],
    [0.88, 0.034, 0]
  ];
  var A_TAIL = 0.08;
  var BURST_MIN = 5, BURST_MAX = 8;

  var canvas = null, ctx = null, W = 0, H = 0, dpr = 1;
  var fish = [], raf = 0, last = 0, now = 0;
  var wanted = false, attract = null;
  var ptr = { x: 0, y: 0, t: 0, ok: false };

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function wrapAngle(a) { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function makeFish(i, n) {
    var bl = rnd(28, 48);
    var hue = Math.random();
    return {
      x: rnd(0, W), y: rnd(0, H), th: rnd(0, TAU),
      bl: bl, u: rnd(1.0, 1.8),
      speed: bl * 1.2, phase: rnd(0, TAU),
      beat: i === 0 ? 1 : rnd(0.86, 0.91),         // followers beat 9-14% slower
      kappa: 0, flip: 1, wander: rnd(-1, 1),
      burstUntil: 0, burstSpeed: 0,
      orbitR: rnd(1.2, 3.2), orbitA: rnd(0, TAU), orbitDir: Math.random() < 0.5 ? -1 : 1,
      // teal -> steel blue: legible on navy and on white at low alpha
      r: Math.round(62 + hue * 30), g: Math.round(168 - hue * 28), b: Math.round(168 + hue * 40)
    };
  }

  function spawn() {
    var n = clamp(Math.round(W * H / 90000), 8, 15);
    fish = [];
    for (var i = 0; i < n; i++) fish.push(makeFish(i, n));
    // start as a loose group
    var cx = rnd(0.2 * W, 0.8 * W), cy = rnd(0.2 * H, 0.8 * H), th = rnd(0, TAU);
    for (var j = 0; j < fish.length; j++) {
      fish[j].x = cx + rnd(-120, 120); fish[j].y = cy + rnd(-80, 80); fish[j].th = th + rnd(-0.5, 0.5);
    }
  }

  function resize() {
    if (!canvas) return;
    W = window.innerWidth; H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  }

  // ---- simulation ------------------------------------------------------------
  function step(dt) {
    var n = fish.length, i, j, f, o;
    var tAttr = attract ? now - attract.t0 : 0;
    var aw = 0;
    if (attract) {
      aw = tAttr < 6 ? 1 : 1 - (tAttr - 6) / 3;         // mill 6 s, relax over 3 s
      if (aw <= 0) { attract = null; aw = 0; }
    }
    for (i = 0; i < n; i++) {
      f = fish[i];
      var bl = f.bl, fx = Math.cos(f.th), fy = Math.sin(f.th);
      var sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, cnt = 0;
      var R = bl * 6, R2 = R * R, S = bl * 1.3;
      for (j = 0; j < n; j++) {
        if (j === i) continue;
        o = fish[j];
        var dx = o.x - f.x, dy = o.y - f.y, d2 = dx * dx + dy * dy;
        if (d2 > R2 || d2 < 0.01) continue;
        var d = Math.sqrt(d2);
        cnt++; ax += Math.cos(o.th); ay += Math.sin(o.th); cx += dx; cy += dy;
        if (d < S) { var k = (S - d) / S / d; sx -= dx * k; sy -= dy * k; }
      }
      var vx = fx * 0.7, vy = fy * 0.7;
      vx += sx * 2.2; vy += sy * 2.2;
      if (cnt) {
        var al = Math.sqrt(ax * ax + ay * ay) || 1;
        vx += ax / al * 0.9; vy += ay / al * 0.9;
        var cl = Math.sqrt(cx * cx + cy * cy) / cnt;          // distance to centroid
        var cm = Math.min(1, cl / (bl * 3)) * 0.6;
        var cd = Math.sqrt(cx * cx + cy * cy) || 1;
        vx += cx / cd * cm; vy += cy / cd * cm;
      }
      // slow wander so the school drifts rather than marches
      f.wander = clamp(f.wander + rnd(-1, 1) * dt * 2, -1, 1);
      var wa = f.th + f.wander * 1.2;
      vx += Math.cos(wa) * 0.25; vy += Math.sin(wa) * 0.25;
      // edges: steer back in
      var m = bl * 2.5;
      if (f.x < m) vx += (m - f.x) / m * 2; else if (f.x > W - m) vx -= (f.x - (W - m)) / m * 2;
      if (f.y < m) vy += (m - f.y) / m * 2; else if (f.y > H - m) vy -= (f.y - (H - m)) / m * 2;

      var target = f.u * bl * (cnt ? 1 : 1.1);
      // click: seek the point, then orbit it
      if (attract && aw > 0) {
        var ang = f.orbitA + f.orbitDir * tAttr * 0.9;
        var rr = f.orbitR * bl * (tAttr < 0.8 ? 0.4 : 1);
        var px = attract.x + Math.cos(ang) * rr, py = attract.y + Math.sin(ang) * rr;
        var ex = px - f.x, ey = py - f.y, ed = Math.sqrt(ex * ex + ey * ey) || 1;
        var w = 3 * aw;
        vx += ex / ed * w; vy += ey / ed * w;
        target = Math.max(target, Math.min(f.burstSpeed || target, ed * 2 + target));
      }
      var vl = Math.sqrt(vx * vx + vy * vy);
      if (vl > 0.001) {
        // turn toward desired heading, radius ~0.4 BL at cruise
        var want = Math.atan2(vy, vx), diff = wrapAngle(want - f.th);
        var wmax = clamp(f.speed / (0.4 * bl), 2, 9);
        var om = clamp(diff * 5, -wmax, wmax);
        f.th += om * dt;
        f.kappa += (clamp(om * bl / Math.max(f.speed, bl * 0.5), -1, 1) - f.kappa) * Math.min(1, dt * 8);
      }
      var bursting = now < f.burstUntil;
      if (bursting) target = f.burstSpeed;
      var rate = bursting ? 8 : 1.5;
      f.speed += (target - f.speed) * Math.min(1, dt * rate);
      f.x += Math.cos(f.th) * f.speed * dt;
      f.y += Math.sin(f.th) * f.speed * dt;
      if (f.x < -3 * bl) f.x = W + 2 * bl; else if (f.x > W + 3 * bl) f.x = -2 * bl;
      if (f.y < -3 * bl) f.y = H + 2 * bl; else if (f.y > H + 3 * bl) f.y = -2 * bl;

      var hz = Math.max(0.7, 2.0 * f.speed / bl) * f.beat;
      f.phase = (f.phase + TAU * hz * dt) % TAU;
      // keep the back up: flip only once clearly heading the other way, and quickly
      var cth = Math.cos(f.th);
      var wantFlip = cth > 0.3 ? 1 : cth < -0.3 ? -1 : (f.flip >= 0 ? 1 : -1);
      f.flip = wantFlip;   // snap, not squash: a mid-flip fish would collapse to a line
    }
  }

  // ---- drawing -----------------------------------------------------------------
  var tmp = [];
  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineJoin = 'round'; ctx.lineWidth = 1;
    for (var i = 0; i < fish.length; i++) drawFish(fish[i]);
  }

  function drawFish(f) {
    var bl = f.bl, c = Math.cos(f.th), s = Math.sin(f.th);
    ctx.setTransform(dpr * c, dpr * s, -dpr * s, dpr * c, dpr * f.x, dpr * f.y);
    var k = f.kappa, amp = A_TAIL * (1 + 0.2 * Math.abs(k)), ph = f.phase, fl = f.flip;
    var fill = 'rgba(' + f.r + ',' + f.g + ',' + f.b + ',0.30)';
    var line = 'rgba(' + f.r + ',' + f.g + ',' + f.b + ',0.55)';
    ctx.fillStyle = fill; ctx.strokeStyle = line;

    // lateral displacement (body lengths) at position s: wave + C-bend
    function wy(sv) {
      var a = amp * (0.05 + 0.95 * sv * sv);
      return a * Math.sin(TAU * (sv - ph / TAU)) + 0.35 * k * sv * sv;
    }
    function X(sv) { return (0.5 - sv) * bl; }
    function Y(sv, up) { return (wy(sv) - up) * bl * fl; }
    var fold = 0.45 + 0.55 * Math.min(1, Math.abs(k) * 1.5 + Math.max(0, f.speed / bl - 2) * 0.3);

    // dorsal fin (spiny + soft), folded flat when cruising
    ctx.beginPath();
    ctx.moveTo(X(0.22), Y(0.22, 0.115));
    ctx.lineTo(X(0.29), Y(0.29, 0.115 + 0.135 * fold));
    ctx.lineTo(X(0.44), Y(0.44, 0.12));
    ctx.lineTo(X(0.55), Y(0.55, 0.105 + 0.085 * fold));
    ctx.lineTo(X(0.69), Y(0.69, 0.065));
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // forked tail
    ctx.beginPath();
    ctx.moveTo(X(0.86), Y(0.86, 0.03));
    ctx.lineTo(X(1.06), Y(1.06, 0.15));
    ctx.lineTo(X(0.97), Y(0.97, 0));
    ctx.lineTo(X(1.06), Y(1.06, -0.15));
    ctx.lineTo(X(0.86), Y(0.86, -0.03));
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // body: top edge nose->tail, bottom edge back, smoothed through midpoints
    var n = PROFILE.length, p, i;
    tmp.length = 0;
    for (i = 0; i < n; i++) { p = PROFILE[i]; tmp.push(X(p[0]), Y(p[0], p[2] + p[1])); }
    for (i = n - 1; i >= 0; i--) { p = PROFILE[i]; tmp.push(X(p[0]), Y(p[0], p[2] - p[1])); }
    var m = tmp.length / 2;
    ctx.beginPath();
    ctx.moveTo(tmp[0], tmp[1]);
    for (i = 1; i < m; i++) {
      var mx = (tmp[2 * i - 2] + tmp[2 * i]) / 2, my = (tmp[2 * i - 1] + tmp[2 * i + 1]) / 2;
      if (i === 1) ctx.lineTo(mx, my); else ctx.quadraticCurveTo(tmp[2 * i - 2], tmp[2 * i - 1], mx, my);
    }
    ctx.lineTo(tmp[2 * m - 2], tmp[2 * m - 1]);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // pectoral fin flutter + eye
    ctx.beginPath();
    ctx.moveTo(X(0.20), Y(0.20, -0.02));
    ctx.lineTo(X(0.34), Y(0.34, -0.06 + 0.02 * Math.sin(ph * 3)));
    ctx.lineTo(X(0.25), Y(0.25, -0.045));
    ctx.stroke();
    ctx.fillStyle = line;
    ctx.beginPath();
    ctx.arc(X(0.07), Y(0.07, 0.025), Math.max(1, bl * 0.022), 0, TAU);
    ctx.fill();
  }

  // ---- loop ----------------------------------------------------------------------
  function frame(ts) {
    raf = requestAnimationFrame(frame);
    var t = ts / 1000;
    var dt = last ? Math.min(0.05, t - last) : 0.016;
    last = t; now = t;
    step(dt); draw();
  }
  function loopOn() { if (!raf && canvas && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
  function loopOff() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  // ---- input -----------------------------------------------------------------------
  function onClick(e) {
    if (!canvas) return;
    var el = e.target;
    if (el && el.closest && el.closest('[data-seabass-toggle]')) return;
    attract = { x: e.clientX, y: e.clientY, t0: now };
    for (var i = 0; i < fish.length; i++) {
      var f = fish[i];
      f.burstSpeed = f.bl * rnd(BURST_MIN, BURST_MAX);
      f.burstUntil = now + rnd(0.5, 0.9);
      f.orbitA = Math.atan2(f.y - e.clientY, f.x - e.clientX);   // arrive from where they are
    }
  }
  function onMove(e) {
    if (!canvas || e.pointerType === 'touch') return;
    var t = e.timeStamp / 1000;
    if (ptr.ok) {
      var dt = t - ptr.t;
      if (dt > 0.001) {
        var dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
        if (Math.sqrt(dx * dx + dy * dy) / dt > 1800) startle(e.clientX, e.clientY);
      }
    }
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = t; ptr.ok = true;
  }
  function startle(px, py) {
    for (var i = 0; i < fish.length; i++) {
      var f = fish[i], dx = f.x - px, dy = f.y - py;
      if (dx * dx + dy * dy < 150 * 150) {
        f.th = Math.atan2(dy, dx) + rnd(-0.4, 0.4);
        f.burstSpeed = f.bl * rnd(BURST_MIN, BURST_MAX);
        f.burstUntil = now + rnd(0.4, 0.7);
      }
    }
  }
  function onToggleClick(e) {
    var el = e.target && e.target.closest && e.target.closest('[data-seabass-toggle]');
    if (el) toggle();
  }

  // ---- lifecycle ----------------------------------------------------------------------
  function mount() {
    if (canvas || reduced()) return;
    canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;' +
      'pointer-events:none;z-index:2147483000;background:transparent;';
    ctx = canvas.getContext('2d');
    if (!ctx) { canvas = null; return; }
    document.body.appendChild(canvas);
    resize(); spawn(); attract = null; ptr.ok = false;
    window.addEventListener('resize', resize);
    document.addEventListener('click', onClick, true);
    document.addEventListener('pointermove', onMove, { passive: true });
    loopOn();
  }
  function unmount() {
    loopOff();
    window.removeEventListener('resize', resize);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('pointermove', onMove);
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    canvas = ctx = null; fish = []; attract = null;
  }
  function syncToggles() {
    var els = document.querySelectorAll('[data-seabass-toggle][aria-pressed]');
    for (var i = 0; i < els.length; i++) els[i].setAttribute('aria-pressed', wanted ? 'true' : 'false');
  }
  function apply() { if (wanted && !reduced()) mount(); else unmount(); syncToggles(); }

  function start(persist) { wanted = true; if (persist !== false) save(true); apply(); }
  function stop(persist) { wanted = false; if (persist !== false) save(false); apply(); }
  function toggle() { if (wanted) stop(); else start(); }

  // Fish need document.body; run once it exists.
  function init() {
    var stored = load();
    wanted = stored === '1' || (stored === null && AUTOSTART);
    document.addEventListener('click', onToggleClick);
    document.addEventListener('visibilitychange', function () { if (document.hidden) loopOff(); else loopOn(); });
    if (mq) {
      var ch = function () { apply(); };
      if (mq.addEventListener) mq.addEventListener('change', ch); else if (mq.addListener) mq.addListener(ch);
    }
    apply();
  }

  window.SeaBass = {
    start: function () { start(); },
    stop: function () { stop(); },
    toggle: toggle,
    get running() { return !!canvas; }
  };

  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
