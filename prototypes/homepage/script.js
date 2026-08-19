/* ===========================================================
   DevStash — Homepage Mockup
   Static prototype. No dependencies.
   =========================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------
     1. Footer year
     ------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* -------------------------------------------------------
     2. Navbar opacity on scroll
     ------------------------------------------------------- */
  var nav = document.getElementById('nav');
  if (nav) {
    var syncNav = function () {
      nav.classList.toggle('scrolled', window.scrollY > 24);
    };
    syncNav();
    window.addEventListener('scroll', syncNav, { passive: true });
  }

  /* -------------------------------------------------------
     3. Scroll-triggered fade-in
     ------------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { observer.observe(el); });
  }

  /* -------------------------------------------------------
     4. Pricing: monthly / yearly toggle
     ------------------------------------------------------- */
  var toggle = document.getElementById('billingToggle');
  var proAmount = document.getElementById('proAmount');
  var proPer = document.getElementById('proPer');
  var proNote = document.getElementById('proNote');

  var PRICING = {
    monthly: { amount: '$8',  per: '/month', note: 'Billed monthly' },
    yearly:  { amount: '$72', per: '/year',  note: 'Billed yearly — $6/month, save $24' }
  };

  if (toggle && proAmount && proPer && proNote) {
    toggle.addEventListener('click', function (event) {
      var button = event.target.closest('.bt-opt');
      if (!button || !toggle.contains(button)) return;

      var cycle = button.getAttribute('data-cycle');
      var plan = PRICING[cycle];
      if (!plan) return;

      toggle.querySelectorAll('.bt-opt').forEach(function (opt) {
        opt.classList.toggle('active', opt === button);
      });

      proAmount.textContent = plan.amount;
      proPer.textContent = plan.per;
      proNote.textContent = plan.note;
    });
  }

  /* -------------------------------------------------------
     5. Chaos field animation
     Icons drift, bounce off the walls, pulse, and flee the cursor.
     ------------------------------------------------------- */
  var field = document.getElementById('chaosField');
  if (!field) return;

  var icons = Array.prototype.slice.call(field.querySelectorAll('.chaos-icon'));
  if (!icons.length) return;

  var REPEL_RADIUS = 115;   // px — cursor influence range
  var REPEL_FORCE  = 900;   // px/s^2 at the cursor itself
  var MIN_SPEED    = 10;    // px/s — keep everything gently moving
  var MAX_SPEED    = 130;   // px/s — cap post-repulsion velocity
  var DRIFT_SPEED  = 26;    // px/s — baseline drift

  // Bounds are cached and invalidated on resize, not read per frame.
  var bounds = { w: 0, h: 0 };
  var fieldRect = null;
  var pointer = { x: 0, y: 0, active: false };

  var particles = icons.map(function (el, i) {
    var angle = Math.random() * Math.PI * 2;
    return {
      el: el,
      x: 0, y: 0,
      w: 0, h: 0,
      vx: Math.cos(angle) * DRIFT_SPEED,
      vy: Math.sin(angle) * DRIFT_SPEED,
      // Distinct phases so the pulsing never looks synchronized.
      rotPhase: Math.random() * Math.PI * 2,
      rotSpeed: 0.5 + Math.random() * 0.5,
      rotAmp: 5 + Math.random() * 7,
      sclPhase: Math.random() * Math.PI * 2,
      sclSpeed: 0.6 + Math.random() * 0.6,
      sclAmp: 0.04 + Math.random() * 0.05,
      seeded: false,
      index: i
    };
  });

  function measure() {
    var rect = field.getBoundingClientRect();
    fieldRect = rect;
    bounds.w = rect.width;
    bounds.h = rect.height;

    particles.forEach(function (p) {
      p.w = p.el.offsetWidth;
      p.h = p.el.offsetHeight;
    });
  }

  function seedPositions() {
    // Jittered 4x2 grid so icons start spread out rather than clumped.
    var cols = 4;
    var rows = Math.ceil(particles.length / cols);

    particles.forEach(function (p) {
      var col = p.index % cols;
      var row = Math.floor(p.index / cols);
      var cellW = bounds.w / cols;
      var cellH = bounds.h / rows;
      var slackX = Math.max(cellW - p.w, 0);
      var slackY = Math.max(cellH - p.h, 0);

      p.x = col * cellW + Math.random() * slackX;
      p.y = row * cellH + Math.random() * slackY;
      p.seeded = true;
    });
  }

  function clampIntoBounds() {
    particles.forEach(function (p) {
      p.x = Math.min(Math.max(p.x, 0), Math.max(bounds.w - p.w, 0));
      p.y = Math.min(Math.max(p.y, 0), Math.max(bounds.h - p.h, 0));
    });
  }

  function draw(p, time) {
    var rot = Math.sin(time * p.rotSpeed + p.rotPhase) * p.rotAmp;
    var scale = 1 + Math.sin(time * p.sclSpeed + p.sclPhase) * p.sclAmp;
    p.el.style.setProperty('--tx', p.x.toFixed(2) + 'px');
    p.el.style.setProperty('--ty', p.y.toFixed(2) + 'px');
    p.el.style.setProperty('--rot', rot.toFixed(2) + 'deg');
    p.el.style.setProperty('--scale', scale.toFixed(3));
  }

  function step(p, dt, time) {
    // Cursor repulsion — force falls off linearly to zero at REPEL_RADIUS.
    if (pointer.active) {
      var cx = p.x + p.w / 2;
      var cy = p.y + p.h / 2;
      var dx = cx - pointer.x;
      var dy = cy - pointer.y;
      var dist = Math.hypot(dx, dy);

      if (dist < REPEL_RADIUS) {
        // Guard the degenerate case where the cursor sits dead centre.
        if (dist < 0.001) {
          dx = Math.random() - 0.5;
          dy = Math.random() - 0.5;
          dist = Math.hypot(dx, dy) || 1;
        }
        var falloff = 1 - dist / REPEL_RADIUS;
        var force = REPEL_FORCE * falloff * dt;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    }

    // Ease back toward the baseline drift speed so repulsion decays.
    var speed = Math.hypot(p.vx, p.vy);
    if (speed > MAX_SPEED) {
      p.vx = (p.vx / speed) * MAX_SPEED;
      p.vy = (p.vy / speed) * MAX_SPEED;
      speed = MAX_SPEED;
    }
    if (speed > DRIFT_SPEED) {
      var decay = Math.pow(0.55, dt);
      var target = DRIFT_SPEED + (speed - DRIFT_SPEED) * decay;
      p.vx = (p.vx / speed) * target;
      p.vy = (p.vy / speed) * target;
      speed = target;
    }
    if (speed < MIN_SPEED) {
      var a = Math.random() * Math.PI * 2;
      p.vx = Math.cos(a) * MIN_SPEED;
      p.vy = Math.sin(a) * MIN_SPEED;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Bounce off the walls.
    var maxX = Math.max(bounds.w - p.w, 0);
    var maxY = Math.max(bounds.h - p.h, 0);

    if (p.x <= 0)    { p.x = 0;    p.vx = Math.abs(p.vx); }
    if (p.x >= maxX) { p.x = maxX; p.vx = -Math.abs(p.vx); }
    if (p.y <= 0)    { p.y = 0;    p.vy = Math.abs(p.vy); }
    if (p.y >= maxY) { p.y = maxY; p.vy = -Math.abs(p.vy); }

    draw(p, time);
  }

  var lastTs = 0;
  function frame(ts) {
    // Cap dt so a backgrounded tab doesn't teleport everything on return.
    var dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0;
    lastTs = ts;
    var time = ts / 1000;

    for (var i = 0; i < particles.length; i++) step(particles[i], dt, time);
    window.requestAnimationFrame(frame);
  }

  // Pointer tracking, in field-local coordinates. The rect is re-read per event
  // (not per frame) because the field shifts with the reveal transition and with
  // page scroll; pointer events are coalesced, so this stays cheap.
  window.addEventListener('pointermove', function (event) {
    fieldRect = field.getBoundingClientRect();
    var x = event.clientX - fieldRect.left;
    var y = event.clientY - fieldRect.top;
    var pad = REPEL_RADIUS;
    pointer.active = x > -pad && x < bounds.w + pad && y > -pad && y < bounds.h + pad;
    pointer.x = x;
    pointer.y = y;
  }, { passive: true });

  window.addEventListener('pointerleave', function () { pointer.active = false; });
  window.addEventListener('blur', function () { pointer.active = false; });

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      measure();
      clampIntoBounds();
    }, 120);
  });

  measure();
  seedPositions();
  particles.forEach(function (p) { draw(p, 0); });

  if (!reduceMotion) {
    window.requestAnimationFrame(frame);
  }
})();
