/* DIEMEZ CLEANS — quote request, contact form and plan request */
(function () {
  const UI = window.DiemezUI;
  const API = window.DiemezAPI;
  const el = (id) => document.getElementById(id);
  const digits = (s) => String(s || "").replace(/\D/g, "");

  function err(boxId, msg) {
    const b = el(boxId);
    if (b) {
      b.innerHTML = msg
        ? `<div class="alert alert--error"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg><span>${msg}</span></div>`
        : "";
    }
  }

  function successCard(title, text) {
    return `<div class="card" style="text-align:center;padding:38px">
      <div class="empty-ic" style="background:var(--success-soft);color:var(--success)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </div>
      <h2 style="margin-bottom:8px">${title}</h2>
      <p class="muted" style="max-width:46ch;margin:0 auto 20px">${text}</p>
      <div class="btn-row" style="justify-content:center">
        <a class="btn btn-navy" href="index.html">Back to home</a>
        <a class="btn btn-outline" href="https://wa.me/${window.DIEMEZ_CONFIG.business.whatsapp}" target="_blank" rel="noopener">Chat on WhatsApp</a>
      </div>
    </div>`;
  }

  /* ---------- quote ---------- */
  function initQuote() {
    const form = el("quoteForm");
    if (!form) return;

    const svc = new URLSearchParams(window.location.search).get("service");
    if (svc) {
      const map = { laundry: "Bulk / commercial laundry", cleaning: "Domestic cleaning", painting: "Painting" };
      const want = map[svc.toLowerCase()];
      if (want) el("q-service").value = want;
    }

    const u = API.currentUser();
    if (u) {
      el("q-name").value = ((u.firstName || "") + " " + (u.lastName || "")).trim();
      el("q-phone").value = u.phone || "";
      if (u.email) el("q-email").value = u.email;
      if (u.address) el("q-location").value = u.address;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err("quoteError", "");
      const payload = {
        serviceType: el("q-service").value,
        customerName: el("q-name").value.trim(),
        phone: el("q-phone").value.trim(),
        email: el("q-email").value.trim(),
        location: el("q-location").value.trim(),
        preferredDate: el("q-date").value,
        details: el("q-details").value.trim()
      };
      if (!payload.customerName) return err("quoteError", "Please enter your full name.");
      if (digits(payload.phone).length < 10) return err("quoteError", "Please enter a valid phone number.");
      if (!payload.location) return err("quoteError", "Please tell us the location of the work.");
      if (payload.details.length < 10) return err("quoteError", "Please describe the work you need quoted.");

      const btn = el("quoteSubmit");
      btn.disabled = true;
      btn.textContent = "Sending…";
      try {
        const res = await API.call("createQuote", payload);
        if (!res.ok) throw new Error(res.error || "Could not send your request.");
        form.classList.add("hidden");
        el("quoteDone").classList.remove("hidden");
        el("quoteDone").innerHTML = successCard(
          "Quote request received",
          "Thank you. Our team will review the details and contact you with a scope and price. Reference: " +
            (res.data.quote ? res.data.quote.reference : "")
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (ex) {
        err("quoteError", ex.message);
        btn.disabled = false;
        btn.textContent = "Send quote request";
      }
    });
  }

  /* ---------- contact ---------- */
  function initContact() {
    const form = el("contactForm");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err("contactError", "");
      const interests = Array.from(form.querySelectorAll('input[name="interest"]:checked')).map((i) => i.value);
      const payload = {
        customerName: el("c-name").value.trim(),
        phone: el("c-phone").value.trim(),
        email: el("c-email").value.trim(),
        interests: interests.join(", "),
        message: el("c-message").value.trim()
      };
      if (!payload.customerName) return err("contactError", "Please enter your name.");
      if (digits(payload.phone).length < 10) return err("contactError", "Please enter a valid phone number.");
      if (payload.message.length < 5) return err("contactError", "Please write a short message.");

      const btn = el("contactSubmit");
      btn.disabled = true;
      btn.textContent = "Sending…";
      try {
        const res = await API.call("contact", payload);
        if (!res.ok) throw new Error(res.error || "Could not send your message.");
        form.classList.add("hidden");
        el("contactDone").classList.remove("hidden");
        el("contactDone").innerHTML = successCard(
          "Message sent",
          "Thank you for reaching out. We reply during business hours: Monday to Saturday, 8:00 AM – 6:00 PM."
        );
      } catch (ex) {
        err("contactError", ex.message);
        btn.disabled = false;
        btn.textContent = "Send message";
      }
    });
  }

  /* ---------- plan request ---------- */
  function initPlan() {
    const modal = el("planModal");
    const form = el("planForm");
    if (!modal || !form) return;
    let selected = window.DIEMEZ_DATA.PLANS[1].name;

    const open = (planId) => {
      const p = window.DIEMEZ_DATA.PLANS.find((x) => x.id === planId);
      if (p) selected = p.name;
      el("planModalTitle").textContent = "Request " + selected;
      const u = API.currentUser();
      if (u) {
        el("pf-name").value = ((u.firstName || "") + " " + (u.lastName || "")).trim();
        el("pf-phone").value = u.phone || "";
        if (u.address) el("pf-address").value = u.address;
      }
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      modal.classList.remove("open");
      document.body.style.overflow = "";
    };

    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-plan]");
      if (b) {
        e.preventDefault();
        open(b.dataset.plan);
      }
      if (e.target.closest("[data-close-modal]") || e.target === modal) close();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err("planError", "");
      const payload = {
        plan: selected,
        customerName: el("pf-name").value.trim(),
        phone: el("pf-phone").value.trim(),
        address: el("pf-address").value.trim(),
        notes: el("pf-notes").value.trim()
      };
      if (!payload.customerName) return err("planError", "Please enter your full name.");
      if (digits(payload.phone).length < 10) return err("planError", "Please enter a valid phone number.");
      if (!payload.address) return err("planError", "Please enter the pickup address.");

      const btn = el("planSubmit");
      btn.disabled = true;
      btn.textContent = "Sending…";
      try {
        const res = await API.call("createSubscription", payload);
        if (!res.ok) throw new Error(res.error || "Could not send your request.");
        close();
        UI.toast("Plan request sent. We'll be in touch to activate it.");
        form.reset();
        btn.disabled = false;
        btn.textContent = "Request this plan";
      } catch (ex) {
        err("planError", ex.message);
        btn.disabled = false;
        btn.textContent = "Request this plan";
      }
    });
  }

  function init() {
    initQuote();
    initContact();
    initPlan();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
