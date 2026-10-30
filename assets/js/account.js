/* DIEMEZ CLEANS — customer dashboard (Home · Orders · Subscriptions · Wallet · Profile)
   Layout follows the Orange Laundromat account area. No OTP: sign-in is phone + password.
   The wallet is display-only until a payment provider is connected and verifies top-ups on the server. */
(function () {
  const API = window.DiemezAPI;
  const UI = window.DiemezUI;
  const D = window.DIEMEZ_DATA;
  const CFG = window.DIEMEZ_CONFIG;
  const money = (n) => UI.money(n);
  const el = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const svg = (d, s) => `<svg width="${s || 20}" height="${s || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

  let user = null;
  let orders = [];
  let subs = [];
  let tab = "home";
  let homeTab = "orders";
  let walletHidden = true;
  let profileTab = "address";
  const filt = { orders: { from: "", to: "", status: "" }, subs: { from: "", to: "", plan: "" } };

  const first = () => (user.firstName || "").split(" ")[0] || "there";
  const fullName = () => ((user.firstName || "") + " " + (user.lastName || "")).trim() || "Customer";

  function guard() {
    user = API.currentUser();
    if (!user) {
      window.location.replace("login.html?next=account.html");
      return false;
    }
    return true;
  }

  /* ---------- sidebar referral ---------- */
  function renderReferral() {
    const box = el("refBox");
    if (!CFG.referral.enabled || !user.referral) { box.style.display = "none"; return; }
    box.innerHTML = `
      <h3>Referrals</h3>
      <div class="text-sm" style="text-align:left;font-weight:600;margin-bottom:6px">Referral Code</div>
      <div class="code"><span>${esc(user.referral)}</span><button type="button" class="eye" style="position:static;transform:none" data-copy="${esc(user.referral)}" aria-label="Copy referral code">${svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>', 20)}</button></div>
      <p>${esc(CFG.referral.rewardText)}</p>`;
  }

  /* ---------- shared bits ---------- */
  const badge = (s) => `<span class="badge ${UI.badgeClass(s)}">${esc(s)}</span>`;
  const empty = (title, text) => `<div class="oempty"><div class="plus">+</div><h4>${title}</h4><p style="max-width:34ch;margin:0 auto">${text}</p></div>`;
  const inRange = (iso, from, to) => {
    const d = String(iso || "").slice(0, 10);
    return (!from || d >= from) && (!to || d <= to);
  };

  function orderRow(o) {
    const items = (o.items || []).map((i) => `${i.qty} × ${esc(i.name)} (${esc(i.option)})`).join("<br>");
    const when = o.pickup && o.pickup.date ? esc(o.pickup.date) + " · " + esc(o.pickup.slot || "") : esc((o.pickup && o.pickup.slot) || "");
    return `<div class="list-row" style="align-items:flex-start">
      <div style="flex:1;min-width:200px">
        <strong class="mono">${esc(o.reference)}</strong><small>${when}</small>
        <div class="text-sm muted" style="margin-top:8px;line-height:1.6">${items}</div>
      </div>
      <div style="text-align:right"><strong>${money(o.total)}</strong>
        <div style="margin-top:8px;display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap">${badge(o.status)}${badge(o.paymentStatus)}</div>
      </div></div>`;
  }

  function subRow(s) {
    return `<div class="list-row"><div><strong>${esc(s.plan)}</strong><small>Requested ${esc((s.createdAt || "").slice(0, 10))}</small></div>
      <div style="text-align:right">${badge(s.status)}</div></div>`;
  }

  const planTiles = () => `<div class="otiles">${D.PLANS.map((p) => `<a class="otile" href="plans.html" style="text-decoration:none">${esc(p.name)}<small>${money(p.price)}/Month</small></a>`).join("")}</div>`;

  function subscriptionBox() {
    const active = subs.find((s) => s.status === "Active");
    return `<div class="obox">
      <div class="obox-top"><h3 style="margin:0">Subscription</h3><a href="plans.html" style="font-weight:600">See All Plans →</a></div>
      <div class="alert" style="background:var(--mist);border:0;margin:0 0 12px"><span>${active
        ? `You’re on the <strong>${esc(active.plan)}</strong> plan.`
        : "You don’t have an active subscription. Please select a plan below to enjoy discounted service fees."}</span></div>
      ${planTiles()}</div>`;
  }

  function walletCard(withView) {
    return `<div class="owallet">
      <div class="row" style="align-items:flex-start"><div><h3>Wallet Balance:</h3><div class="bal" id="walBal">${walletHidden ? "****" : money(0)}</div></div>
        <button class="eye-btn" type="button" data-wallet-eye aria-label="Show or hide balance">${svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>', 24)}</button></div>
      <div class="row"><button class="btn-white" type="button" data-fund>${svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>', 18)} Fund Wallet</button>
        ${withView ? '<a href="#" data-goto="wallet">View Wallet →</a>' : ""}</div></div>`;
  }

  /* ---------- views ---------- */
  function viewHome() {
    const bulk = (D.PRICE_GROUPS.find((g) => g.id === "bulk") || { rows: [] }).rows;
    const kg = bulk.find((r) => r.unit === "kg");
    const cyc = bulk.find((r) => r.unit === "cycle");
    const offer = CFG.firstOrderOffer && CFG.firstOrderOffer.enabled;
    const list = homeTab === "orders"
      ? (orders.length ? orders.slice(0, 3).map(orderRow).join("") : empty(`No orders yet, ${esc(first())}!`, 'Ready to feel fresh? Tap “Request a Laundry” to get started.'))
      : (subs.length ? subs.slice(0, 3).map(subRow).join("") : empty("No Subscription History", "Please subscribe to a plan to enjoy discounted benefits."));
    return `
      <div class="ohead"><div><h1>Hello ${esc(first())} 👋</h1><p>Ready to freshen up?</p></div>
        <a class="btn btn-navy" href="pickup.html">Request A Laundry</a></div>
      <div class="ogrid">${subscriptionBox()}${walletCard(true)}</div>
      <div class="odiy"><div><h3>Do your laundry yourself</h3><p>Pay per kg or per wash cycle (25kg load)</p></div>
        <div>${cyc ? `<span class="opill">${money(cyc.flat)}/cycle</span>` : ""}${kg ? `<span class="opill">${money(kg.flat)}/kg</span>` : ""}</div></div>
      <div class="obanners">
        <div class="oban oban--a"><div><h3>${offer ? CFG.firstOrderOffer.percent + "% Discount" : "Monthly plans"}</h3>
          <p>${offer ? "Save on your first laundry order. Limited-time offer for new customers." : "Wash, iron and dry-clean on a fixed monthly price, with free pickup and delivery."}</p></div>
          <a class="btn-w" href="${offer ? "pickup.html" : "plans.html"}">${offer ? "Claim Discount" : "See Plans"}</a></div>
        <div class="oban oban--b"><div><h3>Pickup &amp; Delivery</h3><p>We collect from your door and bring it back fresh. Terms are confirmed when we accept your booking.</p></div>
          <a class="btn-w" href="pickup.html">Schedule Pickup</a></div>
      </div>
      <div class="otabs"><button data-home-tab="orders" class="${homeTab === "orders" ? "active" : ""}">Order History</button>
        <button data-home-tab="subs" class="${homeTab === "subs" ? "active" : ""}">Subscription History</button>
        <a href="#" data-goto="${homeTab === "orders" ? "orders" : "plan"}" style="margin-left:auto;font-weight:600;align-self:center">See All →</a></div>
      ${list}`;
  }

  function filterBox(kind) {
    const f = filt[kind];
    const third = kind === "orders"
      ? `<div class="field" style="margin:0"><label class="label" for="f-third">Status</label><select class="select" id="f-third"><option value="">All statuses</option>${D.ORDER_STATUSES.map((s) => `<option ${f.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></div>`
      : `<div class="field" style="margin:0"><label class="label" for="f-third">Plan type</label><select class="select" id="f-third"><option value="">All plans</option>${D.PLANS.map((p) => `<option ${f.plan === p.name ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></div>`;
    return `<div class="ofilter" data-filter="${kind}">
      <div class="field" style="margin:0"><label class="label" for="f-from">From date</label><input class="input" type="date" id="f-from" value="${f.from}"></div>
      <div class="field" style="margin:0"><label class="label" for="f-to">To date</label><input class="input" type="date" id="f-to" value="${f.to}"></div>
      ${third}
      <div class="actions"><button class="btn btn-navy btn-sm" type="button" data-apply="${kind}">Apply Filters</button></div></div>`;
  }

  function viewOrders() {
    const f = filt.orders;
    const rows = orders.filter((o) => inRange(o.createdAt, f.from, f.to) && (!f.status || o.status === f.status));
    return `
      <div class="ohead"><h1>Order History</h1><a class="btn btn-navy" href="pickup.html">+ Request a Laundry</a></div>
      ${filterBox("orders")}
      ${rows.length ? rows.map(orderRow).join("") : empty(orders.length ? "No orders match those filters" : `No orders yet, ${esc(first())}!`, 'Ready to feel fresh? Tap “Request a Laundry” to get started.')}
      <p class="form-note">Need to change or cancel a booking? Call or WhatsApp us on ${esc(CFG.business.phone)} with your reference.</p>`;
  }

  function viewPlan() {
    const f = filt.subs;
    const rows = subs.filter((s) => inRange(s.createdAt, f.from, f.to) && (!f.plan || s.plan === f.plan));
    return `
      <div class="ohead"><h1>Subscriptions</h1></div>
      ${subscriptionBox()}
      <h3 style="margin:30px 0 14px;color:var(--muted)">Subscription History</h3>
      ${filterBox("subs")}
      ${rows.length ? rows.map(subRow).join("") : empty("No Subscription History", "Please subscribe to a plan to enjoy discounted benefits.")}
      <p class="form-note">Plan requests are confirmed by our team before they start. Prices and allowances are shown on the <a href="plans.html">plans page</a>.</p>`;
  }

  function viewWallet() {
    return `
      <div class="ohead"><h1>Wallet</h1></div>
      ${walletCard(false)}
      <h3 style="margin:30px 0 8px;color:var(--muted)">Transaction History</h3>
      <div class="oempty"><p>No transactions found</p></div>`;
  }

  function viewProfile() {
    const addr = (user.address || "").trim();
    const panes = {
      address: `
        <div class="obox" style="max-width:760px;margin:0 auto 24px;text-align:center"><h3>My Address</h3>
          ${addr ? `<div class="addr-row"><span>${esc(addr)}</span><span class="dflt">Default</span></div>` : '<p class="muted">You have not saved an address yet.</p>'}</div>
        <form id="profileForm" style="max-width:760px;margin:0 auto">
          <h3>${addr ? "Update address" : "Add an address"}</h3>
          <div class="form-grid">
            <div class="field"><label class="label" for="p-first">First name</label><input class="input" id="p-first" value="${esc(user.firstName)}"></div>
            <div class="field"><label class="label" for="p-last">Last name</label><input class="input" id="p-last" value="${esc(user.lastName)}"></div>
          </div>
          <div class="field"><label class="label" for="p-email">Email <span class="opt">(optional)</span></label><input class="input" id="p-email" type="email" value="${esc(user.email)}"></div>
          <div class="field"><label class="label" for="p-address">Pickup address</label><textarea class="textarea" id="p-address">${esc(user.address)}</textarea></div>
          <div id="profileMsg"></div><button class="btn btn-navy" type="submit">Save changes</button>
        </form>`,
      password: `
        <form id="passForm" style="max-width:520px;margin:0 auto">
          <h3>Change password</h3>
          <div class="field"><label class="label" for="p-cur">Current password</label><input class="input" id="p-cur" type="password" autocomplete="current-password"></div>
          <div class="field"><label class="label" for="p-new">New password</label><input class="input" id="p-new" type="password" autocomplete="new-password"></div>
          <div id="passMsg"></div><button class="btn btn-navy" type="submit">Update password</button>
        </form>`,
      support: `
        <form id="supportForm" style="max-width:620px;margin:0 auto">
          <h3>Contact support</h3>
          <p class="muted text-sm">Questions about an order, a plan or your account? Send us a message, or call/WhatsApp ${esc(CFG.business.phone)}.</p>
          <div class="field"><label class="label" for="s-msg">Your message</label><textarea class="textarea" id="s-msg" placeholder="How can we help?"></textarea></div>
          <div id="supportMsg"></div>
          <div class="btn-row"><button class="btn btn-navy" type="submit">Send message</button>
            <a class="btn btn-outline" target="_blank" rel="noopener" href="https://wa.me/${CFG.business.whatsapp}">WhatsApp</a></div>
        </form>`
    };
    return `
      <div class="ohead"><h1>Profile</h1></div>
      <div class="oprofile">
        <div class="oavatar">${svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', 52)}</div>
        <div style="flex:1;min-width:220px"><h2>${esc(fullName())}</h2><p>${esc(user.phone)}</p><p>${esc(user.email || "")}</p></div>
        <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://wa.me/${CFG.business.whatsapp}?text=${encodeURIComponent("Hello DIEMEZ CLEANS, I would like to change the phone number on my account (" + user.phone + ").")}">✎ Change phone number</a>
      </div>
      <div class="otabs"><button data-profile-tab="address" class="${profileTab === "address" ? "active" : ""}">My Address</button>
        <button data-profile-tab="password" class="${profileTab === "password" ? "active" : ""}">Change password</button>
        <button data-profile-tab="support" class="${profileTab === "support" ? "active" : ""}">Support</button></div>
      ${panes[profileTab]}`;
  }

  function msg(boxId, text, ok) {
    const b = el(boxId);
    if (b) b.innerHTML = `<div class="alert ${ok ? "alert--success" : "alert--error"}"><span>${esc(text)}</span></div>`;
  }

  /* ---------- rendering + events ---------- */
  function render(next) {
    if (next) tab = next;
    const map = { home: viewHome, orders: viewOrders, plan: viewPlan, wallet: viewWallet, profile: viewProfile };
    el("acc-panel").innerHTML = (map[tab] || viewHome)();
    document.querySelectorAll("#acc-nav button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    bindPanel();
    window.scrollTo({ top: 0 });
  }

  function bindPanel() {
    const profile = el("profileForm");
    if (profile) profile.addEventListener("submit", async (e) => {
      e.preventDefault();
      const res = await API.call("updateProfile", {
        firstName: el("p-first").value.trim(), lastName: el("p-last").value.trim(),
        email: el("p-email").value.trim(), address: el("p-address").value.trim()
      });
      if (res.ok) { user = res.data.user; UI.toast("Profile updated"); render(); }
      else msg("profileMsg", res.error || "Could not save your details.");
    });

    const pass = el("passForm");
    if (pass) pass.addEventListener("submit", async (e) => {
      e.preventDefault();
      const next = el("p-new").value;
      if (next.length < 8) return msg("passMsg", "New password must be at least 8 characters.");
      const res = await API.call("changePassword", { current: el("p-cur").value, next });
      if (res.ok) { msg("passMsg", "Password updated.", true); pass.reset(); }
      else msg("passMsg", res.error || "Could not update your password.");
    });

    const support = el("supportForm");
    if (support) support.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = el("s-msg").value.trim();
      if (text.length < 5) return msg("supportMsg", "Please write a short message.");
      const res = await API.call("contact", { customerName: fullName(), phone: user.phone, email: user.email || "", interests: "Account support", message: text });
      if (res.ok) { msg("supportMsg", "Message sent. We reply Monday – Saturday, 8:00 AM – 6:00 PM.", true); support.reset(); }
      else msg("supportMsg", res.error || "Could not send your message.");
    });
  }

  async function load() {
    if (!guard()) return;
    renderReferral();
    try {
      const [o, s] = await Promise.all([API.call("myOrders", {}), API.call("mySubscriptions", {})]);
      if (o.ok) orders = o.data.orders || [];
      if (s.ok) subs = s.data.subscriptions || [];
    } catch (e) {
      UI.toast("Could not load your orders. Check your connection.", "error");
    }
    render("home");
  }

  function init() {
    if (!el("acc-panel")) return;
    el("acc-nav").addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]");
      if (b) render(b.dataset.tab);
    });
    document.addEventListener("click", (e) => {
      const t = (sel) => e.target.closest(sel);
      let x;
      if ((x = t("[data-goto]"))) { e.preventDefault(); render(x.dataset.goto); }
      else if ((x = t("[data-copy]"))) UI.copy(x.dataset.copy);
      else if ((x = t("[data-home-tab]"))) { homeTab = x.dataset.homeTab; render(); }
      else if ((x = t("[data-profile-tab]"))) { profileTab = x.dataset.profileTab; render(); }
      else if (t("[data-wallet-eye]")) {
        walletHidden = !walletHidden;
        document.querySelectorAll("#walBal").forEach((n) => (n.textContent = walletHidden ? "****" : money(0)));
      }
      else if (t("[data-fund]")) el("fundModal").classList.add("open");
      else if (t("[data-close-modal]") || e.target === el("fundModal")) el("fundModal").classList.remove("open");
      else if ((x = t("[data-apply]"))) {
        const kind = x.dataset.apply;
        const f = filt[kind];
        f.from = el("f-from").value; f.to = el("f-to").value;
        if (kind === "orders") f.status = el("f-third").value; else f.plan = el("f-third").value;
        render();
      }
    });
    el("logoutBtn").addEventListener("click", async () => {
      await API.call("logout", {});
      API.setSession(null);
      window.location.href = "index.html";
    });
    load();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
