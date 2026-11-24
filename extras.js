/* Small enhancements kept separate from the core interactions. */
(() => {
  "use strict";
  const clock = document.querySelector("#nepalClock");
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu", weekday: "short", day: "2-digit",
    month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    second: "2-digit", hour12: true
  });
  function updateClock() {
    if (clock) clock.textContent = `Nepal · ${formatter.format(new Date())}`;
  }
  updateClock();
  window.setInterval(updateClock, 1000);

  const copyButton = document.querySelector("#copyEmail");
  const email = "bhabishek.feedback.support@gmail.com";
  copyButton?.addEventListener("click", async () => {
    const original = copyButton.textContent;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const helper = document.createElement("textarea");
        helper.value = email;
        helper.setAttribute("readonly", "");
        helper.style.position = "absolute";
        helper.style.left = "-9999px";
        document.body.appendChild(helper);
        helper.select();
        const copied = document.execCommand("copy");
        helper.remove();
        if (!copied) throw new Error("Copy not available");
      }
      copyButton.textContent = "Email copied ✓";
    } catch (_) {
      copyButton.textContent = email;
    }
    window.setTimeout(() => { copyButton.textContent = original; }, 2200);
  });

  const form = document.querySelector("#feedbackForm");
  const status = document.querySelector("#formStatus");
  form?.addEventListener("submit", event => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const contact = form.elements.contact.value.trim();
    const message = form.elements.message.value.trim();
    if (!name || !contact || !message) {
      if (status) status.textContent = "Please complete all three fields before continuing.";
      (!name ? form.elements.name : !contact ? form.elements.contact : form.elements.message).focus();
      return;
    }
    const subject = encodeURIComponent(`Portfolio feedback from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail / Contact: ${contact}\n\nMessage:\n${message}`);
    if (status) status.textContent = "Opening your email application with the message prepared…";
    window.location.href = `mailto:bhabishek.feedback.support@gmail.com?subject=${subject}&body=${body}`;
  });
})();
