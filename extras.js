/* ==========================================================================
   Feedback form + topic selector + clipboard + Nepal clock + active nav
   ========================================================================== */
(function () {
  const OFFICIAL_EMAIL = "bhabishek.feedback.suppport@gmail.com";

  const copyBtn = document.getElementById("copyEmail");
  const form = document.getElementById("feedbackForm");
  const statusEl = document.getElementById("formStatus");
  const toastEl = document.getElementById("toast");
  const recentWrap = document.getElementById("recentNotesWrap");
  const recentBox = document.getElementById("recentNoteBox");
  const yearEl = document.getElementById("year");
  const clockEl = document.getElementById("nepalClock");

  let selectedTopic = "General";
  let toastTimer = null;

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2400);
  }

  // ---------- 1. YEAR & NEPAL TIME (NPT = UTC+5:45) ----------
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function updateNepalClock() {
    if (!clockEl) return;
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kathmandu",
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
      clockEl.textContent = `Kathmandu (NPT): ${formatter.format(now)}`;
    } catch (_) {
      clockEl.textContent = "Kathmandu, Nepal (UTC+5:45)";
    }
  }
  updateNepalClock();
  setInterval(updateNepalClock, 1000);

  // ---------- 2. COPY EMAIL ----------
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const isNe = document.documentElement.lang === "ne";
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(OFFICIAL_EMAIL);
        } else {
          const ta = document.createElement("textarea");
          ta.value = OFFICIAL_EMAIL;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        showToast(isNe ? "इमेल कपी भयो!" : "Email address copied!");
      } catch (_) {
        showToast(OFFICIAL_EMAIL);
      }
    });
  }

  // ---------- 3. TOPIC PILLS ----------
  const pillButtons = Array.from(document.querySelectorAll(".pill-btn"));
  pillButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      pillButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedTopic = btn.dataset.topic || "General";
    });
  });

  // ---------- 4. SAVED RECENT FEEDBACK NOTE ----------
  function renderRecentNote() {
    if (!recentWrap || !recentBox) return;
    try {
      const raw = localStorage.getItem("bd_last_feedback");
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || !data.message) return;
      recentBox.innerHTML = `<strong>[${data.topic || "General"}]</strong> ${escapeHtml(data.message)}`;
      recentWrap.hidden = false;
    } catch (_) {}
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  renderRecentNote();

  // ---------- 5. FEEDBACK SUBMISSION (MAILTO + LOCAL DRAFT) ----------
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const isNe = document.documentElement.lang === "ne";
      const nameInput = document.getElementById("fName");
      const contactInput = document.getElementById("fContact");
      const msgInput = document.getElementById("fMessage");

      const name = (nameInput ? nameInput.value : "").trim();
      const contact = (contactInput ? contactInput.value : "").trim();
      const message = (msgInput ? msgInput.value : "").trim();

      if (!name || !contact || !message) {
        if (statusEl) {
          statusEl.textContent = isNe
            ? "कृपया नाम, सम्पर्क र सन्देश सबै भर्नुहोस्।"
            : "Please fill in your name, contact, and message.";
        }
        return;
      }

      try {
        localStorage.setItem("bd_last_feedback", JSON.stringify({
          topic: selectedTopic,
          name,
          contact,
          message,
          at: Date.now()
        }));
        renderRecentNote();
      } catch (_) {}

      const subject = encodeURIComponent(`[${selectedTopic}] Portfolio Feedback from ${name}`);
      const body = encodeURIComponent(
        `Topic: ${selectedTopic}\nName: ${name}\nContact: ${contact}\n\nMessage:\n${message}`
      );

      if (statusEl) {
        statusEl.textContent = isNe
          ? "तपाईंको इमेल एप खोलिँदैछ…"
          : "Opening your email app with your message…";
      }
      showToast(isNe ? "सन्देश तयार गरियो!" : "Draft prepared for email!");

      window.location.href = `mailto:${OFFICIAL_EMAIL}?subject=${subject}&body=${body}`;
    });
  }

  // ---------- 6. ACTIVE NAV HIGHLIGHT ON SCROLL ----------
  const navLinks = Array.from(document.querySelectorAll("#navLinks a[href^='#']"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = "#" + entry.target.id;
          navLinks.forEach((a) => {
            a.classList.toggle("active", a.getAttribute("href") === id);
          });
        }
      }
    }, { rootMargin: "-30% 0px -55% 0px", threshold: 0.01 });

    sections.forEach((sec) => navObserver.observe(sec));
  }
})();