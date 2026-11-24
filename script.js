/* =========================================================
   Bhabishek Dulal — Portfolio  |  script.js
   Sections: LIVE WALLPAPER · NAV MENU · PHOTO FALLBACKS
             · LIGHTBOX · FEEDBACK FORM
   The wallpaper (canvas) is the ONLY thing that animates.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- CONFIG (edit me) ---------- */
  const SUPPORT_EMAIL = "bhabishek.feedback.suppport@gmail.com";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const isNe = () => document.documentElement.lang === "ne";
  const neDigits = (n) => String(n).replace(/\d/g, (d) => "०१२३४५६७८९"[d]);

  /* =========================================================
     LIVE WALLPAPER — drifting pink particles + topographic
     waves in Inter Miami pink and brown.
     Performance rules:
       • paused when the tab is hidden
       • paused while the photo lightbox is open
       • phones: drawn at half resolution, fewer shapes, ~25 fps,
         and paused while the page is being scrolled
       • glow sprite is pre-rendered (no gradients per frame)
     ========================================================= */
  const canvas = $("#bg");
  const ctx = canvas.getContext("2d");
  const toggle = $("#motionToggle");
  const toggleLabel = $("#motionLabel");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile =
    window.matchMedia("(max-width: 820px)").matches ||
    window.matchMedia("(pointer: coarse)").matches;

  let savedPref = null;
  try { savedPref = localStorage.getItem("motion"); } catch (e) {}
  let motionOn = savedPref ? savedPref === "on" : !prefersReduced;

  const SCALE = isMobile ? 0.5 : 1;            // canvas resolution multiplier
  const MAX_PARTICLES = isMobile ? 16 : 60;
  const WAVE_LAYERS = isMobile ? 5 : 9;
  const WAVE_STEP = isMobile ? 28 : 16;
  const FRAME_MS = isMobile ? 40 : 0;          // ~25 fps on phones

  /* Pink + brown palettes for the two themes */
  const PALETTE = {
    dark: {
      bg: ["#1b0f0d", "#2a1511", "#40211b"],
      wave: "247,181,205", waveBoost: 1,
      hill: "150,96,74", glow: "247,181,205",
    },
    light: {
      bg: ["#fff3f6", "#fbe3ea", "#f3cfda"],
      wave: "184,42,99", waveBoost: 1.3,
      hill: "138,86,63", glow: "232,122,165",
    },
  };

  let W = 0, H = 0, t = 0, rafId = null, lastTs = 0;
  let lbOpen = false;       // lightbox open -> wallpaper paused
  let scrolling = false;    // phones: paused while scrolling
  let mouseX = 0, mouseY = 0, px = 0, py = 0;
  let particles = [];
  let pal = PALETTE.dark, sprite = null, baseGrad = null;

  function themeName() {
    return document.documentElement.dataset.theme === "light" ? "light" : "dark";
  }

  function buildSprite() {
    const s = document.createElement("canvas");
    s.width = s.height = 64;
    const c = s.getContext("2d");
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, `rgba(${pal.glow},1)`);
    g.addColorStop(1, `rgba(${pal.glow},0)`);
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
    sprite = s;
  }

  function buildBase() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    const n = pal.bg.length;
    pal.bg.forEach((col, i) => g.addColorStop(i / (n - 1), col));
    baseGrad = g;
  }

  function applyTheme() {
    pal = PALETTE[themeName()];
    buildSprite();
    buildBase();
    if (!rafId) draw();
  }

  function resize(force) {
    const nw = window.innerWidth, nh = window.innerHeight;
    // Phones fire "resize" while scrolling (address bar hides/shows).
    // Ignore small height-only changes so the canvas is not rebuilt constantly.
    const sameSize = Math.abs(nw - W) < 1 && Math.abs(nh - H) < 150;
    if (force !== true && sameSize && W) return;
    W = nw; H = nh;
    canvas.width = Math.round(W * SCALE);
    canvas.height = Math.round(H * SCALE);
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    const count = Math.round(Math.min(MAX_PARTICLES, (W * H) / 16000));
    particles = Array.from({ length: count }, makeParticle);
    buildBase();
    draw();
  }

  function makeParticle() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2.4 + 0.8,
      vx: (Math.random() - 0.5) * 0.25, vy: -(Math.random() * 0.35 + 0.08),
      depth: Math.random() * 0.9 + 0.1,
      tw: Math.random() * Math.PI * 2,
    };
  }

  function drawBase() {
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // Layered sine-wave "hills" that read like topographic contour lines
  function drawWaves() {
    for (let i = 0; i < WAVE_LAYERS; i++) {
      const k = i / WAVE_LAYERS;
      const baseY = H * (0.35 + k * 0.7) + py * (8 + i * 2);
      const amp = 22 + k * 46;
      const freq = 0.0016 + k * 0.0009;
      const speed = t * (0.0005 + k * 0.0004);
      ctx.beginPath();
      for (let x = -10; x <= W + 10; x += WAVE_STEP) {
        const y = baseY
          + Math.sin(x * freq + speed + i) * amp
          + Math.sin(x * freq * 2.3 - speed * 1.4) * amp * 0.35;
        x === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${pal.wave},${(0.06 + k * 0.1) * pal.waveBoost})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      if (i % 3 === 0) { // soft filled brown hill for depth
        ctx.lineTo(W + 10, H + 10); ctx.lineTo(-10, H + 10); ctx.closePath();
        ctx.fillStyle = `rgba(${pal.hill},${0.04 + k * 0.05})`;
        ctx.fill();
      }
    }
  }

  function drawParticles() {
    for (const p of particles) {
      const x = p.x + px * 30 * p.depth;
      const y = p.y + py * 30 * p.depth;
      const a = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(p.tw));
      const s = p.r * 10;
      ctx.globalAlpha = a * p.depth;
      ctx.drawImage(sprite, x - s / 2, y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  function step() {
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.tw += 0.02;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
    }
  }

  function draw() {
    drawBase(); drawWaves(); drawParticles();
  }

  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    if (FRAME_MS && ts - lastTs < FRAME_MS) return;
    lastTs = ts;
    t += 16;
    px += (mouseX - px) * 0.04;
    py += (mouseY - py) * 0.04;
    step(); draw();
  }

  function stopLoop() {
    cancelAnimationFrame(rafId); rafId = null;
  }

  function startLoopIfAllowed() {
    if (motionOn && !document.hidden && !lbOpen && !scrolling && !rafId) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function motionText(on) {
    return isNe() ? (on ? "गति चालु" : "गति बन्द") : (on ? "Motion on" : "Motion off");
  }

  function setMotion(on) {
    motionOn = on;
    toggle.setAttribute("aria-pressed", String(on));
    toggleLabel.textContent = motionText(on);
    try { localStorage.setItem("motion", on ? "on" : "off"); } catch (e) {}
    stopLoop();
    if (on) startLoopIfAllowed(); else draw();
  }

  window.addEventListener("resize", () => resize());
  window.addEventListener("themechange", applyTheme);
  window.addEventListener("langchange", () => { toggleLabel.textContent = motionText(motionOn); });

  if (isMobile) {
    // Pause the wallpaper while the visitor scrolls, resume 160 ms after they stop
    let scrollTimer = null;
    window.addEventListener("scroll", () => {
      if (!scrolling) { scrolling = true; stopLoop(); }
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { scrolling = false; startLoopIfAllowed(); }, 160);
    }, { passive: true });
  } else {
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX / W - 0.5; mouseY = e.clientY / H - 0.5;
    }, { passive: true });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopLoop(); else startLoopIfAllowed();
  });
  toggle.addEventListener("click", () => setMotion(!motionOn));

  pal = PALETTE[themeName()];
  buildSprite();
  resize(true);
  setMotion(motionOn);

  /* =========================================================
     NAV — mobile menu
     ========================================================= */
  const menuBtn = $("#menuBtn"), navLinks = $("#navLinks");
  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => {
    navLinks.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false");
  }));

  /* =========================================================
     PHOTO FALLBACKS — if an image fails to load, show a tidy
     initials placeholder instead of a broken icon.
     ========================================================= */
  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  }
  function makePlaceholder(img) {
    const ph = document.createElement("div");
    ph.className = "ph";
    ph.setAttribute("role", "img");
    ph.setAttribute("aria-label", img.alt || "Photo placeholder");
    ph.dataset.name = img.dataset.name || "";
    ph.innerHTML = `<span>${initials(img.dataset.name || "BD")}</span><small>Photo unavailable</small>`;
    return ph;
  }
  function attachFallback(img) {
    const swap = () => {
      if (img.dataset.failed) return;
      img.dataset.failed = "1";
      img.replaceWith(makePlaceholder(img));
    };
    img.addEventListener("error", swap);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) swap();
  }
  $$("img.photo").forEach((img) => {
    img.decoding = "async"; // decode photos off the main thread
    attachFallback(img);
  });

  /* =========================================================
     LIGHTBOX — gallery modal with keyboard + swipe support.
     The wallpaper is paused while it is open, so opening a
     photo is smooth.
     ========================================================= */
  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  const items = $$("#gallery .g-item");
  let current = 0, lastFocus = null;

  function show(i) {
    current = (i + items.length) % items.length;
    const el = $("img, .ph", items[current]);
    const n = current + 1, total = items.length;
    lbCap.textContent = isNe()
      ? `क्षण ${neDigits(n)} / ${neDigits(total)}`
      : `Moment ${n} / ${total}`;
    const holder = lbImg.parentElement;
    const old = $("#lbImg") || $(".ph", holder);
    let node;
    if (el.tagName === "IMG") {
      node = document.createElement("img");
      node.id = "lbImg"; node.alt = el.alt; node.referrerPolicy = "no-referrer";
      node.decoding = "async";
      node.src = el.currentSrc || el.src;
      node.addEventListener("error", () => {
        const ph = makePlaceholder(el); ph.id = "lbImg"; node.replaceWith(ph);
      });
    } else {
      node = el.cloneNode(true); node.id = "lbImg";
    }
    old.replaceWith(node);
  }
  function open(i) {
    lastFocus = document.activeElement;
    lbOpen = true; stopLoop();
    lb.hidden = false; document.body.style.overflow = "hidden";
    show(i); $("#lbClose").focus({ preventScroll: true });
  }
  function close() {
    lb.hidden = true; document.body.style.overflow = "";
    lbOpen = false; startLoopIfAllowed();
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  items.forEach((btn, i) => btn.addEventListener("click", () => open(i)));
  $("#lbClose").addEventListener("click", close);
  $("#lbPrev").addEventListener("click", () => show(current - 1));
  $("#lbNext").addEventListener("click", () => show(current + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
  let sx = 0;
  lb.addEventListener("touchstart", (e) => { sx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });

  /* =========================================================
     FEEDBACK FORM — opens the visitor's email app with a
     pre-filled message (mailto). To use a real form backend
     instead (Formspree, Web3Forms, etc.), replace the submit
     handler with a fetch() POST to your endpoint.
     ========================================================= */
  const MSG = {
    en: {
      fill: "Please fill in all fields.",
      opening: "Opening your email app… if nothing opens, use “Copy email address”.",
      copied: "Email address copied ✔",
      email: "Email: ",
    },
    ne: {
      fill: "कृपया सबै फिल्डहरू भर्नुहोस्।",
      opening: "तपाईंको इमेल एप खुल्दैछ… केही नखुले “इमेल ठेगाना कपी गर्नुहोस्” थिच्नुहोस्।",
      copied: "इमेल ठेगाना कपी भयो ✔",
      email: "इमेल: ",
    },
  };
  const msg = () => MSG[isNe() ? "ne" : "en"];

  const form = $("#feedbackForm"), statusEl = $("#formStatus");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = [$("#fName"), $("#fContact"), $("#fMessage")];
    let ok = true;
    fields.forEach((f) => {
      const bad = !f.value.trim();
      f.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) { statusEl.textContent = msg().fill; return; }

    const name = fields[0].value.trim(), contact = fields[1].value.trim(), text = fields[2].value.trim();
    const subject = `Portfolio feedback from ${name}`;
    const body = `Name: ${name}\nContact: ${contact}\n\nMessage:\n${text}`;
    statusEl.textContent = msg().opening;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  form.addEventListener("input", (e) => e.target.classList.remove("invalid"));

  $("#copyEmail").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      statusEl.textContent = msg().copied;
    } catch (err) {
      statusEl.textContent = msg().email + SUPPORT_EMAIL;
    }
  });

  $("#year").textContent = new Date().getFullYear();
})();