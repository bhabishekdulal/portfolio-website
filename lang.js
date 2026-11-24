/* =========================================================
   lang.js — English / नेपाली switch
   HOW IT WORKS: any element with a  data-ne="..."  attribute
   is translated. The English text already in the HTML is kept
   as the original. For input placeholders use  data-ne-ph.
   To edit a translation, change the data-ne text in index.html.
   ========================================================= */
(function () {
  "use strict";

  const DEFAULT_LANG = "en"; // change to "ne" if the site should open in Nepali

  const btn = document.getElementById("langToggle");
  const textEls = Array.from(document.querySelectorAll("[data-ne]"));
  const phEls = Array.from(document.querySelectorAll("[data-ne-ph]"));

  // Remember the English originals
  textEls.forEach((el) => { el.dataset.en = el.innerHTML; });
  phEls.forEach((el) => { el.dataset.enPh = el.placeholder; });

  function apply(lang) {
    const ne = lang === "ne";
    textEls.forEach((el) => { el.innerHTML = ne ? el.dataset.ne : el.dataset.en; });
    phEls.forEach((el) => { el.placeholder = ne ? el.dataset.nePh : el.dataset.enPh; });
    document.documentElement.lang = lang;
    if (btn) btn.textContent = ne ? "English" : "नेपाली";
    try { localStorage.setItem("lang", lang); } catch (e) {}
    window.dispatchEvent(new Event("langchange"));
  }

  let current = DEFAULT_LANG;
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "ne") current = saved;
  } catch (e) {}

  apply(current);

  if (btn) {
    btn.addEventListener("click", () => {
      current = current === "ne" ? "en" : "ne";
      apply(current);
    });
  }
})();