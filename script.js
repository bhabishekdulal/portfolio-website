/* Core interactions: theme, mobile navigation, scroll effects and photo viewer. */
(() => {
  "use strict";
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const themeButton = $("#themeToggle");
  const themeIcon = $("#themeIcon");
  const root = document.documentElement;

  function applyTheme(theme, save = true) {
    const selected = theme === "light" ? "light" : "dark";
    root.dataset.theme = selected;
    if (themeIcon) themeIcon.textContent = selected === "dark" ? "☀" : "☾";
    if (themeButton) themeButton.setAttribute("aria-label", selected === "dark" ? "Switch to light theme" : "Switch to dark theme");
    const metaTheme = $('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = selected === "dark" ? "#1b1210" : "#fbf5f1";
    if (save) {
      try { localStorage.setItem("bd-theme", selected); } catch (_) {}
    }
  }
  applyTheme(root.dataset.theme, false);
  themeButton?.addEventListener("click", () => applyTheme(root.dataset.theme === "dark" ? "light" : "dark"));

  const menuButton = $("#menuBtn");
  const nav = $(".main-nav");
  function closeMenu() {
    nav?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation");
  }
  menuButton?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open") ?? false;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  $$(".main-nav a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });

  const backTop = $("#backTop");
  let scrollQueued = false;
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      backTop?.classList.toggle("visible", window.scrollY > 550);
      const sections = $$("main section[id]");
      let current = "";
      for (const section of sections) {
        if (section.getBoundingClientRect().top < 150) current = section.id;
      }
      $$(".main-nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${current}`));
      scrollQueued = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* Accessible lightbox with keyboard and touch-friendly controls. */
  const gallery = $("#gallery");
  const lightbox = $("#lightbox");
  const lbImage = $("#lbImg");
  const lbCaption = $("#lbCap");
  const lbCount = $("#lbCount");
  const photoButtons = $$(".gallery-item", gallery || document);
  const photos = photoButtons.map(button => {
    const img = $("img", button);
    return { src: img?.getAttribute("src") || "", alt: img?.alt || "Gallery photo" };
  });
  let activePhoto = 0;
  let lastFocused = null;

  function showPhoto(index) {
    if (!photos.length || !lightbox) return;
    activePhoto = (index + photos.length) % photos.length;
    const photo = photos[activePhoto];
    lbImage.src = photo.src;
    lbImage.alt = photo.alt;
    lbCaption.textContent = photo.alt;
    lbCount.textContent = `${activePhoto + 1} / ${photos.length}`;
  }
  function openLightbox(index) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    showPhoto(index);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    $("#lbClose")?.focus();
  }
  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    lastFocused?.focus?.();
  }
  photoButtons.forEach((button, index) => button.addEventListener("click", () => openLightbox(index)));
  $("#lbClose")?.addEventListener("click", closeLightbox);
  $("#lbPrev")?.addEventListener("click", () => showPhoto(activePhoto - 1));
  $("#lbNext")?.addEventListener("click", () => showPhoto(activePhoto + 1));
  lightbox?.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", event => {
    if (!lightbox || lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showPhoto(activePhoto - 1);
    if (event.key === "ArrowRight") showPhoto(activePhoto + 1);
  });

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
