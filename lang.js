/* ==========================================================================
   Bilingual toggle (English <-> Nepali) with persistent choice
   ========================================================================== */
(function () {
  const langToggle = document.getElementById("langToggle");
  if (!langToggle) return;

  const STORAGE_KEY = "site_lang";
  let currentLang = "en";

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ne" || saved === "en") currentLang = saved;
  } catch (_) {}

  // Cache original English innerHTML & placeholders once
  const textEls = Array.from(document.querySelectorAll("[data-ne]")).map((el) => ({
    el,
    enHtml: el.innerHTML,
    neHtml: el.getAttribute("data-ne")
  }));

  const phEls = Array.from(document.querySelectorAll("[data-ne-ph]")).map((el) => ({
    el,
    enPh: el.getAttribute("placeholder") || "",
    nePh: el.getAttribute("data-ne-ph") || ""
  }));

  function applyLang(lang) {
    currentLang = lang === "ne" ? "ne" : "en";
    document.documentElement.lang = currentLang === "ne" ? "ne" : "en";

    for (let i = 0; i < textEls.length; i++) {
      const item = textEls[i];
      item.el.innerHTML = currentLang === "ne" ? item.neHtml : item.enHtml;
    }

    for (let i = 0; i < phEls.length; i++) {
      const item = phEls[i];
      item.el.setAttribute("placeholder", currentLang === "ne" ? item.nePh : item.enPh);
    }

    // Toggle button shows the target language you will switch TO
    langToggle.textContent = currentLang === "ne" ? "EN" : "नेपाली";
    try { localStorage.setItem(STORAGE_KEY, currentLang); } catch (_) {}
  }

  langToggle.addEventListener("click", () => {
    applyLang(currentLang === "en" ? "ne" : "en");
  });

  applyLang(currentLang);
})();