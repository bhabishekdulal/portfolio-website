/* =========================================================
   extras.js — polish & usability
   1 Dark/Light theme · 2 Loading screen · 3 Active menu link
   4 Back-to-top button · 5 Nepal live clock
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------- 1. THEME (dark / light) ---------- */
  const root = document.documentElement;
  const themeBtn = $("#themeToggle");
  function setTheme(t) {
    root.dataset.theme = t;
    themeBtn.textContent = t === "light" ? "🌙" : "☀️";
    themeBtn.setAttribute("aria-label", t === "light" ? "Switch to dark theme" : "Switch to light theme");
    try { localStorage.setItem("theme", t); } catch (e) {}
    window.dispatchEvent(new Event("resize")); // makes the wallpaper redraw in the new colours
  }
  let savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
  setTheme(savedTheme || "dark");
  themeBtn.addEventListener("click", () => setTheme(root.dataset.theme === "light" ? "dark" : "light"));

  /* ---------- 2. LOADING SCREEN ---------- */
  const loader = $("#loader");
  function hideLoader() {
    if (!loader) return;
    loader.classList.add("hide");
    setTimeout(() => loader.remove(), 700);
  }
  window.addEventListener("load", () => setTimeout(hideLoader, 600));
  setTimeout(hideLoader, 4000); // safety: never get stuck

  /* ---------- 3. ACTIVE MENU LINK ---------- */
  const links = $$("#navLinks a");
  const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((l) => l.classList.remove("active"));
        const a = byId.get(e.target.id);
        if (a) a.classList.add("active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- 4. BACK-TO-TOP BUTTON ---------- */
  const topBtn = $("#backTop");
  window.addEventListener("scroll", () => {
    topBtn.classList.toggle("show", window.scrollY > 500);
  }, { passive: true });
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- 5. NEPAL LIVE CLOCK ---------- */
  const clock = $("#nepalClock");
  function tick() {
    const ne = document.documentElement.lang === "ne";
    const fmt = new Intl.DateTimeFormat(ne ? "ne-NP" : "en-GB", {
      timeZone: "Asia/Kathmandu", dateStyle: "full", timeStyle: "medium",
    });
    clock.textContent = (ne ? "नेपाल समय: " : "Nepal time: ") + fmt.format(new Date());
  }
  tick(); setInterval(tick, 1000);
})();




(function () {
  "use strict";

  /* ---------------------------------------------------------
     1. SCROLL PROGRESS BAR
     --------------------------------------------------------- */
  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  document.body.prepend(progressBar);

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = percent + "%";
  }

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ---------------------------------------------------------
     2. ACTIVE NAV LINK HIGHLIGHTING ON SCROLL
     --------------------------------------------------------- */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll("#navLinks a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${id}`
            );
          });
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );

  sections.forEach((sec) => observer.observe(sec));

  /* ---------------------------------------------------------
     3. BILINGUAL LIGHTBOX CAPTIONS FOR GALLERY PHOTOS
     (Edit the captions below to match your actual photos)
     --------------------------------------------------------- */
  const galleryCaptions = [
    { en: "Moment 1 ", ne: "क्षण १ " },
    { en: "Moment 2 ", ne: "क्षण २ " },
    { en: "Moment 3 ", ne: "क्षण ३ " },
    { en: "Moment 4 ", ne: "क्षण ४ " },
    { en: "Moment 5 ", ne: "क्षण ५ " },
    { en: "Moment 6 ", ne: "क्षण ६ " },
    { en: "Moment 7 ", ne: "क्षण ७ " },
    { en: "Moment 8 ", ne: "क्षण ८ " },
  ];

  const lbCap = document.getElementById("lbCap");
  const galleryButtons = document.querySelectorAll("#gallery .g-item");

  function setCaption(index) {
    if (!lbCap || !galleryCaptions[index]) return;
    const isNe = document.documentElement.lang === "ne";
    lbCap.textContent = isNe
      ? galleryCaptions[index].ne
      : galleryCaptions[index].en;
  }

  galleryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      // Wait 1 tick so script.js opens the lightbox first
      setTimeout(() => setCaption(idx), 0);
    });
  });

  // Also update caption when clicking Next / Prev inside lightbox
  ["lbPrev", "lbNext"].forEach((id) => {
    const navBtn = document.getElementById(id);
    if (!navBtn) return;
    navBtn.addEventListener("click", () => {
      setTimeout(() => {
        const lbImg = document.getElementById("lbImg");
        if (!lbImg) return;
        const match = Array.from(document.querySelectorAll("#gallery img")).findIndex(
          (img) => img.src === lbImg.src
        );
        if (match !== -1) setCaption(match);
      }, 0);
    });
  });
})();