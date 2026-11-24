/* ==========================================================================
   Core interactivity & lag-free Miami Pink × Brown ambient renderer
   ========================================================================== */
(function () {
  const docEl = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const motionToggle = document.getElementById("motionToggle");
  const motionLabel = document.getElementById("motionLabel");
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.querySelector(".nav nav");
  const progressBar = document.getElementById("scrollProgress");
  const backTop = document.getElementById("backTop");

  // ---------- 1. THEME TOGGLE ----------
  function syncThemeIcon() {
    const isLight = docEl.dataset.theme === "light";
    if (themeToggle) {
      themeToggle.textContent = isLight ? "🌙" : "☀️";
      themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", isLight ? "#fdf6f8" : "#160b08");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = docEl.dataset.theme === "light" ? "dark" : "light";
      docEl.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (_) {}
      syncThemeIcon();
    });
  }
  syncThemeIcon();

  // ---------- 2. MOBILE MENU ----------
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---------- 3. SCROLL PROGRESS & BACK-TO-TOP (rAF THROTTLED) ----------
  let scrollTicking = false;
  function updateScrollUI() {
    scrollTicking = false;
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (progressBar) {
      progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollTop / maxScroll))})`;
    }
    if (backTop) {
      backTop.classList.toggle("show", scrollTop > 420);
    }
  }

  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateScrollUI);
    }
  }, { passive: true });
  updateScrollUI();

  if (backTop) {
    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------- 4. INTERSECTION REVEAL ----------
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- 5. LIGHTBOX FOR GALLERY & PHOTOS ----------
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCap = document.getElementById("lbCap");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");

  const galleryButtons = Array.from(document.querySelectorAll("#gallery .g-item"));
  const items = galleryButtons.map((btn) => {
    const img = btn.querySelector("img");
    return {
      src: img ? img.getAttribute("src") : "",
      caption: img ? (img.dataset.name || img.alt || "") : ""
    };
  });

  let currentIdx = 0;

  function openLightbox(idx) {
    if (!lightbox || !items.length) return;
    currentIdx = (idx + items.length) % items.length;
    const item = items[currentIdx];
    lbImg.src = item.src;
    lbImg.alt = item.caption;
    lbCap.textContent = `${currentIdx + 1} / ${items.length} — ${item.caption}`;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
  }

  galleryButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => openLightbox(i));
  });

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", () => openLightbox(currentIdx - 1));
  if (lbNext) lbNext.addEventListener("click", () => openLightbox(currentIdx + 1));

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") openLightbox(currentIdx - 1);
    else if (e.key === "ArrowRight") openLightbox(currentIdx + 1);
  });

  // ---------- 6. LAG-FREE AMBIENT CANVAS (MIAMI PINK × BROWN) ----------
  const canvas = document.getElementById("bg");
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let motionEnabled = !prefersReduced;
  let pageVisible = !document.hidden;
  let rafId = null;
  let lastTime = 0;
  let elapsed = 0;

  const ctx = canvas ? canvas.getContext("2d", { alpha: true }) : null;
  let width = 0;
  let height = 0;
  let dpr = 1;

  // Lightweight soft orbs (capped count for smooth 60fps on all devices)
  const orbs = [
    { x: 0.18, y: 0.22, r: 260, vx: 0.014, vy: 0.011, tone: "pink" },
    { x: 0.82, y: 0.28, r: 290, vx: -0.012, vy: 0.013, tone: "brown" },
    { x: 0.52, y: 0.76, r: 310, vx: 0.01, vy: -0.012, tone: "pink" },
    { x: 0.25, y: 0.82, r: 240, vx: -0.011, vy: -0.009, tone: "brown" }
  ];

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    width = window.innerWidth;
    height = window.innerHeight;
    // Cap DPR at 1.5 so high-DPI screens don't waste fill-rate
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawFrame(dt) {
    if (!ctx || !width || !height) return;
    const isLight = docEl.dataset.theme === "light";
    ctx.clearRect(0, 0, width, height);

    elapsed += dt;

    for (let i = 0; i < orbs.length; i++) {
      const o = orbs[i];
      o.x += o.vx * dt;
      o.y += o.vy * dt;

      if (o.x < 0.08 || o.x > 0.92) o.vx *= -1;
      if (o.y < 0.08 || o.y > 0.92) o.vy *= -1;

      const cx = (o.x + Math.sin(elapsed * 0.45 + i) * 0.025) * width;
      const cy = (o.y + Math.cos(elapsed * 0.4 + i * 1.3) * 0.025) * height;
      const radius = o.r * Math.min(1.15, Math.max(0.7, width / 1100));

      const grad = ctx.createRadialGradient(cx, cy, radius * 0.05, cx, cy, radius);
      if (o.tone === "pink") {
        if (isLight) {
          grad.addColorStop(0, "rgba(255, 107, 181, 0.16)");
          grad.addColorStop(1, "rgba(255, 107, 181, 0)");
        } else {
          grad.addColorStop(0, "rgba(255, 107, 181, 0.14)");
          grad.addColorStop(1, "rgba(255, 107, 181, 0)");
        }
      } else {
        if (isLight) {
          grad.addColorStop(0, "rgba(110, 59, 43, 0.11)");
          grad.addColorStop(1, "rgba(110, 59, 43, 0)");
        } else {
          grad.addColorStop(0, "rgba(138, 76, 56, 0.2)");
          grad.addColorStop(1, "rgba(138, 76, 56, 0)");
        }
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(now) {
    if (!motionEnabled || !pageVisible) {
      rafId = null;
      return;
    }
    if (!lastTime) lastTime = now;
    // Clamp delta time to avoid huge jumps after tab switch
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    drawFrame(dt);
    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (!canvas || !ctx || !motionEnabled || !pageVisible || rafId) return;
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function syncMotionUI() {
    if (motionToggle) {
      motionToggle.setAttribute("aria-pressed", String(motionEnabled));
    }
    if (motionLabel) {
      motionLabel.textContent = motionEnabled ? "Motion" : "Paused";
    }
    if (motionEnabled) {
      resizeCanvas();
      drawFrame(0.016);
      startLoop();
    } else {
      stopLoop();
      if (ctx && width && height) ctx.clearRect(0, 0, width, height);
    }
  }

  if (motionToggle) {
    motionToggle.addEventListener("click", () => {
      motionEnabled = !motionEnabled;
      syncMotionUI();
    });
  }

  document.addEventListener("visibilitychange", () => {
    pageVisible = !document.hidden;
    if (pageVisible && motionEnabled) startLoop();
    else stopLoop();
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    if (!motionEnabled || !pageVisible) drawFrame(0.016);
  }, { passive: true });

  resizeCanvas();
  drawFrame(0.016);
  if (motionEnabled) startLoop();
})();