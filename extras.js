/* =========================================================
   extras.js — usability (no animations)
   1 Dark/Light theme · 2 Active menu link
   3 Back-to-top button · 4 Nepal clock (updates every 30 s)
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------- 1. THEME (dark / light) ---------- */
  const root = document.documentElement;
  const themeBtn = $("#themeToggle");
  const metaTheme = $('meta[name="theme-color"]');

  function setTheme(t) {
    root.dataset.theme = t;
    themeBtn.textContent = t === "light" ? "🌙" : "☀️";
    themeBtn.setAttribute("aria-label", t === "light" ? "Switch to dark theme" : "Switch to light theme");
    if (metaTheme) metaTheme.setAttribute("content", t === "light" ? "#fff3f6" : "#1b0f0d");
    try { localStorage.setItem("theme", t); } catch (e) {}
    window.dispatchEvent(new Event("themechange")); // wallpaper repaints in the new colours
  }
  let savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
  setTheme(savedTheme === "light" ? "light" : "dark");
  themeBtn.addEventListener("click", () => setTheme(root.dataset.theme === "light" ? "dark" : "light"));

  /* ---------- 2. ACTIVE MENU LINK ---------- */
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

  /* ---------- 3. BACK-TO-TOP BUTTON ---------- */
  const topBtn = $("#backTop");
  let topShown = false;
  window.addEventListener("scroll", () => {
    const want = window.scrollY > 500;
    if (want !== topShown) { topShown = want; topBtn.classList.toggle("show", want); }
  }, { passive: true });
  topBtn.addEventListener("click", () => window.scrollTo(0, 0));

  /* ---------- 4. NEPAL CLOCK (minutes only, refreshed every 30 s) ---------- */
  const clock = $("#nepalClock");
  function tick() {
    const ne = root.lang === "ne";
    const fmt = new Intl.DateTimeFormat(ne ? "ne-NP" : "en-GB", {
      timeZone: "Asia/Kathmandu", dateStyle: "full", timeStyle: "short",
    });
    clock.textContent = (ne ? "नेपाल समय: " : "Nepal time: ") + fmt.format(new Date());
  }
  tick();
  setInterval(tick, 30000);
  window.addEventListener("langchange", tick);
})();