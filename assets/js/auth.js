/* DIEMEZ CLEANS — registration and login (no OTP) */
(function () {
  const API = window.DiemezAPI;
  const UI = window.DiemezUI;
  const el = (id) => document.getElementById(id);
  const digits = (s) => String(s || "").replace(/\D/g, "");

  function err(box, msg) {
    const b = el(box);
    if (b) {
      b.innerHTML = msg
        ? `<div class="alert alert--error"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg><span>${msg}</span></div>`
        : "";
    }
  }

  function go(user) {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next) window.location.href = next;
    else window.location.href = user && user.role === "admin" ? "admin.html" : "account.html";
  }

  function initRegister() {
    const form = el("registerForm");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err("regError", "");
      const p = {
        firstName: el("r-first").value.trim(),
        lastName: el("r-last").value.trim(),
        phone: el("r-phone").value.trim(),
        email: el("r-email").value.trim(),
        password: el("r-pass").value,
        address: el("r-address").value.trim(),
        referral: el("r-referral").value.trim()
      };
      const confirm = el("r-confirm").value;
      if (!p.firstName || !p.lastName) return err("regError", "Please enter your first and last name.");
      if (digits(p.phone).length < 10) return err("regError", "Please enter a valid phone number.");
      if (p.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) return err("regError", "Please check the email address.");
      if (p.password.length < 8) return err("regError", "Your password must be at least 8 characters.");
      if (p.password !== confirm) return err("regError", "The two passwords do not match.");

      const btn = el("regSubmit");
      btn.disabled = true;
      btn.textContent = "Creating your account…";
      try {
        const res = await API.call("register", p);
        if (!res.ok) throw new Error(res.error || "Could not create your account.");
        UI.toast("Account created. Welcome to DIEMEZ CLEANS.");
        go(res.data.user);
      } catch (ex) {
        err("regError", ex.message);
        btn.disabled = false;
        btn.textContent = "Create account";
      }
    });
  }

  function initLogin() {
    const form = el("loginForm");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err("loginError", "");
      const identifier = el("l-id").value.trim();
      const password = el("l-pass").value;
      if (!identifier) return err("loginError", "Enter your phone number.");
      if (!password) return err("loginError", "Enter your password.");

      const btn = el("loginSubmit");
      btn.disabled = true;
      btn.textContent = "Signing in…";
      try {
        const res = await API.call("login", { identifier, password });
        if (!res.ok) throw new Error(res.error || "Could not sign you in.");
        UI.toast("Signed in.");
        go(res.data.user);
      } catch (ex) {
        err("loginError", ex.message);
        btn.disabled = false;
        btn.textContent = "Login";
      }
    });

    const toggle = el("togglePass");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const i = el("l-pass");
        i.type = i.type === "password" ? "text" : "password";
      });
    }
  }

  function initEyes() {
    document.querySelectorAll("[data-eye]").forEach((b) => b.addEventListener("click", () => {
      const i = el(b.dataset.eye);
      i.type = i.type === "password" ? "text" : "password";
    }));
  }

  function init() {
    initEyes();
    if (API.currentUser()) {
      if (el("loginForm")) window.location.replace("account.html");
      return;
    }
    initRegister();
    initLogin();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
