/* =========================================================
   Bhabishek Dulal — Portfolio  |  script.js
   Sections: CONFIG · LIVE WALLPAPER · NAV · TYPED TEXT · REVEAL
             · PHOTO FALLBACKS · LIGHTBOX · FEEDBACK FORM
   ========================================================= */
(function () {
  "use strict";

  /* ---------- CONFIG (edit me) ---------- */
  const SUPPORT_EMAIL = "bhabishek.feedback.suppport@gmail.com";
  const TYPED_PHRASES = [
    "Proud son of a Nurse & a Teacher",
    "Educational Content Creator",
  ];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* =========================================================
     LIVE WALLPAPER — drifting golden particles + topographic
     waves + gentle mouse parallax. Pauses when tab is hidden
     and automatically while the photo lightbox is open.
     ========================================================= */
  const canvas = $("#bg");
  const ctx = canvas.getContext("2d");
  const toggle = $("#motionToggle");
  const toggleLabel = $("#motionLabel");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let savedPref = null;
  try { savedPref = localStorage.getItem("motion"); } catch (e) {}
  let motionOn = savedPref ? savedPref === "on" : !prefersReduced;

  let W = 0, H = 0, dpr = 1, t = 0, rafId = null;
  let lbOpen = false; // true while the lightbox is open (wallpaper paused)
  let mouseX = 0, mouseY = 0, px = 0, py = 0;
  let particles = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, (W * H) / 16000));
    particles = Array.from({ length: count }, makeParticle);
    draw(); // render a still frame even when paused
  }

  function makeParticle() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2.4 + 0.6,
      vx: (Math.random() - 0.5) * 0.25, vy: -(Math.random() * 0.35 + 0.08),
      depth: Math.random() * 0.9 + 0.1,
      tw: Math.random() * Math.PI * 2,
    };
  }

  function drawBase() {
    const light = document.documentElement.dataset.theme === "light";
    const g = ctx.createLinearGradient(0, 0, 0, H);
    if (light) { g.addColorStop(0, "#f8eedc"); g.addColorStop(1, "#e8d2a8"); }
    else { g.addColorStop(0, "#1c110a"); g.addColorStop(0.55, "#2c1a10"); g.addColorStop(1, "#4b2a15"); }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // Layered sine-wave "hills" that read like topographic contour lines
  function drawWaves() {
    const layers = 11;
    for (let i = 0; i < layers; i++) {
      const k = i / layers;
      const baseY = H * (0.35 + k * 0.7) + py * (8 + i * 2);
      const amp = 22 + k * 46;
      const freq = 0.0016 + k * 0.0009;
      const speed = t * (0.0005 + k * 0.0004);
      ctx.beginPath();
      for (let x = -10; x <= W + 10; x += 14) {
        const y = baseY
          + Math.sin(x * freq + speed + i) * amp
          + Math.sin(x * freq * 2.3 - speed * 1.4) * amp * 0.35;
        x === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(224,160,48,${0.05 + k * 0.1})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      if (i % 3 === 0) { // soft filled hill for depth
        ctx.lineTo(W + 10, H + 10); ctx.lineTo(-10, H + 10); ctx.closePath();
        ctx.fillStyle = `rgba(139,69,19,${0.025 + k * 0.035})`;
        ctx.fill();
      }
    }
  }

  function drawParticles() {
    for (const p of particles) {
      const x = p.x + px * 30 * p.depth;
      const y = p.y + py * 30 * p.depth;
      const a = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(p.tw));
      const grd = ctx.createRadialGradient(x, y, 0, x, y, p.r * 5);
      grd.addColorStop(0, `rgba(240,190,90,${a * p.depth})`);
      grd.addColorStop(1, "rgba(240,190,90,0)");
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(x, y, p.r * 5, 0, Math.PI * 2); ctx.fill();
    }
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

  function loop() {
    t += 16;
    px += (mouseX - px) * 0.04;
    py += (mouseY - py) * 0.04;
    step(); draw();
    rafId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    cancelAnimationFrame(rafId); rafId = null;
  }

  function startLoopIfAllowed() {
    if (motionOn && !document.hidden && !lbOpen && !rafId) loop();
  }

  function setMotion(on) {
    motionOn = on;
    toggle.setAttribute("aria-pressed", String(!on));
    toggleLabel.textContent = on ? "Motion on" : "Motion off";
    try { localStorage.setItem("motion", on ? "on" : "off"); } catch (e) {}
    stopLoop();
    if (on && !document.hidden && !lbOpen) loop(); else draw();
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX / W - 0.5; mouseY = e.clientY / H - 0.5;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopLoop();
    else startLoopIfAllowed();
  });
  toggle.addEventListener("click", () => setMotion(!motionOn));
  resize();
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
     TYPED TEXT in the hero
     ========================================================= */
  const typedEl = $("#typed");
  if (prefersReduced) {
    typedEl.textContent = TYPED_PHRASES[0];
  } else {
    let pi = 0, ci = 0, deleting = false;
    (function tick() {
      const word = TYPED_PHRASES[pi];
      typedEl.textContent = word.slice(0, ci);
      let delay = deleting ? 35 : 75;
      if (!deleting && ci === word.length) { deleting = true; delay = 1600; }
      else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % TYPED_PHRASES.length; delay = 350; }
      ci += deleting ? -1 : 1;
      setTimeout(tick, delay);
    })();
  }

  /* =========================================================
     SCROLL REVEAL
     ========================================================= */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("in"));
  }

  /* =========================================================
     PHOTO FALLBACKS — if an image fails to load (e.g. Google
     Photos page links or expired URLs), show a tidy initials
     placeholder instead of a broken icon.
     TIP: For best results, download each photo and point the
     src to a local file such as images/profile.jpg.
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
  $$("img.photo").forEach(attachFallback);

  /* =========================================================
     LIGHTBOX — gallery modal with keyboard + swipe support.
     The wallpaper animation is paused while it is open, so
     opening a photo is smooth.
     ========================================================= */
  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  const items = $$("#gallery .g-item");
  let current = 0, lastFocus = null;

  function show(i) {
    current = (i + items.length) % items.length;
    const el = $("img, .ph", items[current]);
    const name = el.dataset.name || `Photo ${current + 1}`;
    lbCap.textContent = `${name} · ${current + 1} / ${items.length}`;
    // Replace content depending on whether the thumb is an image or a placeholder
    const holder = lbImg.parentElement;
    const old = $("#lbImg") || $(".ph", holder);
    let node;
    if (el.tagName === "IMG") {
      node = document.createElement("img");
      node.id = "lbImg"; node.alt = el.alt; node.referrerPolicy = "no-referrer";
      node.decoding = "async"; // decode the photo off the main thread
      node.src = el.src;
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
    lbOpen = true; stopLoop(); // pause the wallpaper
    lb.hidden = false; document.body.style.overflow = "hidden";
    show(i); $("#lbClose").focus();
  }
  function close() {
    lb.hidden = true; document.body.style.overflow = "";
    lbOpen = false; startLoopIfAllowed(); // resume the wallpaper
    if (lastFocus) lastFocus.focus();
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

  // He


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
    if (!ok) { statusEl.textContent = "Please fill in all fields."; return; }

    const name = fields[0].value.trim(), contact = fields[1].value.trim(), msg = fields[2].value.trim();
    const subject = `Portfolio feedback from ${name}`;
    const body = `Name: ${name}\nContact: ${contact}\n\nMessage:\n${msg}`;
    statusEl.textContent = "Opening your email app… if nothing opens, use “Copy email address”.";
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  form.addEventListener("input", (e) => e.target.classList.remove("invalid"));

  $("#copyEmail").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      statusEl.textContent = "Email address copied ✔";
    } catch (err) {
      statusEl.textContent = `Email: ${SUPPORT_EMAIL}`;
    }
  });

  $("#year").textContent = new Date().getFullYear();
})();