/* English / Nepali text switcher. Text is stored in data-en/data-ne attributes. */
(() => {
  "use strict";
  const button = document.querySelector("#langToggle");
  let language = "en";
  try {
    const saved = localStorage.getItem("bd-language");
    if (saved === "ne" || saved === "en") language = saved;
  } catch (_) {}

  function setLanguage(next, save = true) {
    language = next === "ne" ? "ne" : "en";
    document.documentElement.lang = language;
    document.querySelectorAll("[data-en], [data-ne]").forEach(element => {
      const value = element.dataset[language];
      if (value !== undefined) element.textContent = value;
    });
    document.querySelectorAll("[data-en-html], [data-ne-html]").forEach(element => {
      const value = element.dataset[`${language}Html`];
      if (value !== undefined) element.innerHTML = value;
    });
    document.querySelectorAll("[data-en-ph], [data-ne-ph]").forEach(element => {
      const value = element.dataset[`${language}Ph`];
      if (value !== undefined) element.placeholder = value;
    });
    if (button) {
      button.textContent = language === "en" ? "नेपाली" : "English";
      button.setAttribute("aria-label", language === "en" ? "Switch to Nepali" : "Switch to English");
    }
    if (save) {
      try { localStorage.setItem("bd-language", language); } catch (_) {}
    }
  }
  setLanguage(language, false);
  button?.addEventListener("click", () => setLanguage(language === "en" ? "ne" : "en"));
})();
