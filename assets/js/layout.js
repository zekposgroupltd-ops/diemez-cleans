/* DIEMEZ CLEANS — shared layout (header, footer, toasts, PWA, small helpers) */
(function () {
  const CFG = window.DIEMEZ_CONFIG;
  const B = CFG.business;

  const IC = {
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    wa: '<path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.4L3 21l2.2-5.2A8.4 8.4 0 1 1 21 11.5z"/><path d="M8.6 9.2c0 3 2.2 5.2 5.2 5.2.6 0 1.2-.5 1.2-1l-1.6-.8-1 1c-1-.4-1.8-1.2-2.2-2.2l1-1-.8-1.6c-.5 0-1 .6-1 1.2z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>'
  };

  const ico = (name, size, cls) =>
    `<svg class="${cls || ""}" width="${size || 18}" height="${size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[name] || ""}</svg>`;

  let markN = 0;
  const MARK = (size) => {
    const u = "mk" + ++markN;
    return `
    <svg class="mark" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs><linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0B2036"/><stop offset="1" stop-color="#1B4468"/></linearGradient>
      <linearGradient id="${u}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FAB966"/><stop offset="1" stop-color="#E8741A"/></linearGradient></defs>
      <g class="hexw"><path d="M32 3.5 56.6 17.75v28.5L32 60.5 7.4 46.25v-28.5z" fill="url(#${u}g)" stroke="url(#${u}g)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M32 8.8 52 20.4v23.2L32 55.2 12 43.6V20.4z" stroke="#F28C28" stroke-opacity=".5" stroke-width=".7"/></g>
      <path class="cw" d="M45 21.8A16.5 16.5 0 1 0 45 42.2" stroke="url(#${u}a)" stroke-width="3.4" pathLength="100"/>
      <path class="dw" d="M25 21h7.4a11 11 0 0 1 0 22H25z" fill="#FFFFFF"/>
      <path class="dw" d="M29.8 26h2.6a6 6 0 0 1 0 12h-2.6z" fill="#0F2A44"/>
      <path class="rw" d="M48.9 29.6l2.4 2.4-2.4 2.4-2.4-2.4z" fill="url(#${u}a)"/>
    </svg>`;
  };

  const NAV = [
    { href: "services.html", label: "Services", page: "services" },
    { href: "pricing.html", label: "Pricing", page: "pricing" },
    { href: "plans.html", label: "Subscription Plans", page: "plans" },
    { href: "pickup.html", label: "Book Pickup", page: "pickup" },
    { href: "quote.html", label: "Get a Quote", page: "quote" },
    { href: "faq.html", label: "FAQs", page: "faq" },
    { href: "contact.html", label: "Contact", page: "contact" }
  ];
  const FOOT_NAV = [{ href: "index.html", label: "Home" }, { href: "about.html", label: "About" }].concat(NAV);

  const page = document.body.dataset.page || "";
  const user = window.DiemezAPI ? window.DiemezAPI.currentUser() : null;

  function header() {
    const links = NAV.map(
      (n) => `<a href="${n.href}" class="${n.page === page ? "active" : ""}">${n.label}</a>`
    ).join("");
    return `
    <div class="container header-inner">
      <a class="brand" href="index.html" aria-label="${B.name} home">
        ${MARK(42)}
        <span>
          <span class="brand-name">DIEMEZ <b>CLEANS</b></span>
          <span class="brand-desc">Laundry · Cleaning · Painting</span>
        </span>
      </a>
      <nav class="nav" aria-label="Main">${links}</nav>
      <div class="header-actions">
        <button class="btn btn-outline btn-sm hide-sm" id="openMsg" type="button">Message Us</button>
        <a class="btn btn-navy btn-sm" href="${user ? "account.html" : "login.html"}">${user ? "My Account" : "Login"}</a>
        <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false">${ico("menu", 22)}</button>
      </div>
    </div>`;
  }

  function footer() {
    const nav = FOOT_NAV.map((n) => `<li><a href="${n.href}">${n.label}</a></li>`).join("");
    return `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="index.html" style="margin-bottom:14px">
            ${MARK(38)}
            <span>
              <span class="brand-name">${B.name}</span>
              <span class="brand-desc">Laundry · Cleaning · Painting</span>
            </span>
          </a>
          <p style="max-width:34ch;margin-top:12px">${B.tagline} Professional laundry, cleaning, painting and interior finishing for homes, businesses and institutions in ${B.city}.</p>
        </div>
        <div>
          <h4>Pages</h4>
          <ul class="footer-links">${nav}</ul>
        </div>
        <div>
          <h4>Services</h4>
          <ul class="footer-links">
            <li><a href="services.html#laundry">Laundry &amp; wash</a></li>
            <li><a href="services.html#laundry">Ironing &amp; pressing</a></li>
            <li><a href="services.html#laundry">Dry cleaning</a></li>
            <li><a href="services.html#cleaning">Home &amp; domestic cleaning</a></li>
            <li><a href="services.html#cleaning">Commercial cleaning</a></li>
            <li><a href="services.html#painting">Painting &amp; finishing</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul class="footer-contact">
            <li>${ico("phone", 16)}<a href="tel:${B.phoneIntl}">${B.phone}</a></li>
            <li>${ico("wa", 16)}<a href="https://wa.me/${B.whatsapp}" target="_blank" rel="noopener">WhatsApp us</a></li>
            <li>${ico("mail", 16)}<a href="mailto:${B.email}">${B.email}</a></li>
            <li>${ico("pin", 16)}<span>${B.address}</span></li>
            <li>${ico("clock", 16)}<span>${B.hours}</span></li>
          </ul>
          <a class="btn btn-primary btn-sm" style="margin-top:16px" href="pickup.html">Book a pickup</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${B.name}. All rights reserved.</span>
        <span>
          <a href="privacy.html">Privacy Policy</a> · <a href="terms.html">Terms of Service</a> · <a href="refund.html">Cancellation &amp; Refund</a>
        </span>
      </div>
    </div>`;
  }

  function drawer() {
    const links = NAV.map(
      (n) => `<a href="${n.href}" class="${n.page === page ? "active" : ""}">${n.label} ${ico("arrow", 16)}</a>`
    ).join("");
    return `
      <div class="drawer-panel">
        <div class="drawer-head">
          <span class="brand-name">${B.name}</span>
          <button class="drawer-close" id="drawerClose" aria-label="Close menu">${ico("close", 20)}</button>
        </div>
        ${links}
        <a href="${user ? "account.html" : "login.html"}">${user ? "My account" : "Login / Register"} ${ico("user", 16)}</a>
        <div class="divider" style="margin:14px 0"></div>
        <a href="tel:${B.phoneIntl}">${ico("phone", 16)} ${B.phone}</a>
        <a href="https://wa.me/${B.whatsapp}" target="_blank" rel="noopener">${ico("wa", 16)} WhatsApp</a>
        <button class="btn btn-outline btn-block" style="margin-top:16px" type="button" data-open-msg>Message Us</button>
        <a class="btn btn-primary btn-block" style="margin-top:10px" href="pickup.html">Book a pickup</a>
      </div>`;
  }

  function toast(msg, type) {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }
    const el = document.createElement("div");
    el.className = "toast" + (type === "error" ? " toast--error" : "");
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 4600);
  }

  function money(n) {
    return "₦" + Number(n || 0).toLocaleString("en-NG");
  }

  function initials(name) {
    return String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "DC";
  }

  function copy(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => toast("Copied to clipboard")).catch(() => toast("Could not copy", "error"));
    } else {
      toast("Copy not supported on this browser", "error");
    }
  }

  function badgeClass(status) {
    if (["Delivered", "Paid", "Completed", "Active"].includes(status)) return "badge--green";
    if (["Cancelled", "Refunded", "Rejected"].includes(status)) return "badge--red";
    if (["Processing", "Picked Up", "Out for Delivery", "Pending verification", "New"].includes(status)) return "badge--amber";
    if (["Confirmed", "Ready", "Pickup Scheduled", "Pending activation"].includes(status)) return "badge--blue";
    return "";
  }

  const INTERESTS = ["Learn about our plans", "Request laundry service", "Order for pickup", "Cleaning or painting quote", "Partnership enquiry", "Others"];

  function msgPanel() {
    const p = document.createElement("div");
    p.className = "msg-panel";
    p.id = "msgPanel";
    p.innerHTML = `
      <div class="msg-back" data-close-msg></div>
      <aside class="msg-side" role="dialog" aria-modal="true" aria-label="Leave us a message">
        <div class="msg-head"><div><h3>Leave us a message</h3><p>Tell us what you’re interested in</p></div>
          <button type="button" class="drawer-close" data-close-msg aria-label="Close">${ico("close", 20)}</button></div>
        <form id="msgForm" novalidate>
          <div class="field"><label class="label" for="mp-name">Name</label><input class="input" id="mp-name" placeholder="Enter your name" autocomplete="name"></div>
          <div class="field"><label class="label" for="mp-phone">Phone Number <span class="req">*</span></label><input class="input" id="mp-phone" placeholder="e.g. 081 XXX XX XXXX" inputmode="tel" autocomplete="tel"></div>
          <fieldset class="field" style="border:0;padding:0;margin:0 0 16px"><legend class="label">What are you interested in? <span class="req">*</span></legend>
            ${INTERESTS.map((i) => `<label class="check"><input type="checkbox" name="mp-interest" value="${i}"> ${i}</label>`).join("")}
          </fieldset>
          <div class="field"><label class="label" for="mp-comment">Comment <small class="muted">(optional)</small></label><textarea class="textarea" id="mp-comment" placeholder="Tell us more about your needs"></textarea></div>
          <div class="field"><label class="label" for="mp-address">Address <small class="muted">(optional)</small></label><input class="input" id="mp-address" placeholder="Where are you located?"></div>
          <div id="mpError"></div>
          <button class="btn btn-navy btn-block" type="submit" id="mpSubmit">Send message</button>
          <p class="form-note center">We reply Monday – Saturday, 8:00 AM – 6:00 PM.</p>
        </form>
      </aside>`;
    document.body.appendChild(p);
    const open = () => { p.classList.add("open"); document.body.style.overflow = "hidden"; };
    const close = () => { p.classList.remove("open"); document.body.style.overflow = ""; };
    document.addEventListener("click", (e) => {
      if (e.target.closest("#openMsg, [data-open-msg]")) {
        const dr = document.getElementById("drawer");
        if (dr) dr.classList.remove("open");
        open();
      }
      if (e.target.closest("[data-close-msg]")) close();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    p.querySelector("#msgForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const box = p.querySelector("#mpError");
      const show = (m) => { box.innerHTML = m ? `<div class="alert alert--error"><span>${m}</span></div>` : ""; };
      const interests = Array.from(p.querySelectorAll('input[name="mp-interest"]:checked')).map((i) => i.value);
      const phone = p.querySelector("#mp-phone").value.trim();
      if (phone.replace(/\D/g, "").length < 10) return show("Please enter a valid phone number.");
      if (!interests.length) return show("Please choose what you are interested in.");
      const comment = p.querySelector("#mp-comment").value.trim();
      const address = p.querySelector("#mp-address").value.trim();
      const btn = p.querySelector("#mpSubmit");
      btn.disabled = true; btn.textContent = "Sending…"; show("");
      try {
        const res = await window.DiemezAPI.call("contact", {
          customerName: p.querySelector("#mp-name").value.trim() || "Website visitor",
          phone, email: "", interests: interests.join(", "),
          message: (comment || "(no comment)") + (address ? " — Address: " + address : "")
        });
        if (!res.ok) throw new Error(res.error || "Could not send your message.");
        toast("Message sent. We’ll get back to you shortly.");
        p.querySelector("#msgForm").reset();
        close();
      } catch (ex) { show(ex.message); }
      btn.disabled = false; btn.textContent = "Send message";
    });
  }

  /* bouncy logo splash — once per browser session, skipped for reduced-motion users */
  function splash() {
    try {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (sessionStorage.getItem("dc.splash")) return;
      sessionStorage.setItem("dc.splash", "1");
    } catch (e) { return; }
    const s = document.createElement("div");
    s.className = "splash";
    s.setAttribute("role", "presentation");
    s.innerHTML = '<img src="icons/logo-animated-light.svg" alt="DIEMEZ CLEANS">';
    document.body.appendChild(s);
    const done = () => { s.classList.add("out"); setTimeout(() => s.remove(), 500); };
    s.addEventListener("click", done);
    setTimeout(done, 2400);
  }

  function init() {
    splash();
    msgPanel();
    const h = document.getElementById("site-header");
    if (h) {
      h.className = "site-header";
      h.innerHTML = header();
      const d = document.createElement("div");
      d.className = "drawer";
      d.id = "drawer";
      d.innerHTML = drawer();
      document.body.appendChild(d);

      const burger = document.getElementById("burger");
      const close = document.getElementById("drawerClose");
      const setOpen = (open) => {
        d.classList.toggle("open", open);
        if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      };
      if (burger) burger.addEventListener("click", () => setOpen(true));
      if (close) close.addEventListener("click", () => setOpen(false));
      d.addEventListener("click", (e) => {
        if (e.target === d) setOpen(false);
      });
    }

    const f = document.getElementById("site-footer");
    if (f) {
      f.className = "site-footer";
      f.innerHTML = footer();
    }

    if (!document.querySelector(".wa-float")) {
      const a = document.createElement("a");
      a.className = "wa-float";
      a.href = "https://wa.me/" + B.whatsapp + "?text=" + encodeURIComponent("Hello DIEMEZ CLEANS, I would like to make an enquiry.");
      a.target = "_blank";
      a.rel = "noopener";
      a.setAttribute("aria-label", "Chat on WhatsApp");
      a.innerHTML = ico("wa", 20) + "<span>WhatsApp Us</span>";
      document.body.appendChild(a);
    }

    /* reveal */
    const els = document.querySelectorAll(".reveal");
    if (typeof window.IntersectionObserver === "function" && els.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add("in");
              io.unobserve(en.target);
            }
          });
        },
        { rootMargin: "0px 0px -60px 0px" }
      );
      els.forEach((el) => io.observe(el));
    } else {
      els.forEach((el) => el.classList.add("in"));
    }

    /* service worker */
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => {});
      });
    }
  }

  window.DiemezUI = { ico, money, toast, initials, copy, badgeClass, MARK, init };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
