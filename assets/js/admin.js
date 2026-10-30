/* DIEMEZ CLEANS — admin dashboard */
(function () {
  const API = window.DiemezAPI;
  const UI = window.DiemezUI;
  const D = window.DIEMEZ_DATA;
  const money = (n) => UI.money(n);
  const el = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));

  let user = null;
  let stats = {};
  let orders = [];
  let quotes = [];
  let subs = [];
  let messages = [];
  let customers = [];
  let groups = [];
  let orderFilter = "All";

  const QUOTE_STATUSES = ["New", "Contacted", "Quoted", "Won", "Closed"];
  const SUB_STATUSES = ["Pending activation", "Active", "Suspended", "Cancelled"];

  function badge(s) {
    return `<span class="badge ${UI.badgeClass(s)}">${esc(s)}</span>`;
  }

  function selectFor(options, current, attrs) {
    return `<select class="select" ${attrs} style="padding:7px 30px 7px 10px;font-size:.8rem;min-width:150px">
      ${options.map((o) => `<option ${o === current ? "selected" : ""}>${esc(o)}</option>`).join("")}
    </select>`;
  }

  function notAuthorised() {
    return `<div class="panel"><div class="empty">
      <div class="empty-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></div>
      <h4>Administrator access only</h4>
      <p>This dashboard is for DIEMEZ CLEANS staff. Sign in with an administrator account to continue.</p>
      <div class="mt-2"><a class="btn btn-navy btn-sm" href="login.html?next=admin.html">Sign in</a></div>
    </div></div>`;
  }

  /* ---------- views ---------- */
  function viewOverview() {
    return `
      <div class="dash-title"><div><h1>Overview</h1><p>Today's picture across orders, payments and enquiries.</p></div>
        <button class="btn btn-outline btn-sm" data-reload>Refresh</button></div>
      <div class="stats">
        <div class="stat"><span>Total orders</span><strong>${stats.orders || 0}</strong></div>
        <div class="stat"><span>Pending</span><strong>${stats.pending || 0}</strong></div>
        <div class="stat"><span>In progress</span><strong>${stats.processing || 0}</strong></div>
        <div class="stat"><span>Delivered</span><strong>${stats.delivered || 0}</strong></div>
      </div>
      <div class="stats" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat"><span>Verified revenue</span><strong>${money(stats.revenue)}</strong></div>
        <div class="stat"><span>Outstanding</span><strong>${money(stats.outstanding)}</strong></div>
        <div class="stat"><span>Open quotes</span><strong>${stats.quotes || 0}</strong></div>
      </div>
      <div class="panel">
        <div class="panel-head"><h3>Latest orders</h3><button class="btn btn-ghost btn-sm" data-goto="orders">All orders</button></div>
        ${orders.length ? orders.slice(0, 5).map((o) => `
          <div class="list-row">
            <div><strong>${esc(o.reference)}</strong><small>${esc(o.customerName)} · ${esc(o.phone)}</small></div>
            <div style="text-align:right"><strong>${money(o.total)}</strong><div style="margin-top:6px">${badge(o.status)}</div></div>
          </div>`).join("") : '<p class="muted text-sm" style="margin:0">No orders yet.</p>'}
      </div>
      ${API.isDemo() ? `<div class="alert"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg><span><strong>Demo mode.</strong> Data is stored in this browser only. Add your Google Apps Script URL in <span class="mono">assets/js/config.js</span> to use the live Google Sheets database.</span></div>` : ""}`;
  }

  function viewOrders() {
    const list = orderFilter === "All" ? orders : orders.filter((o) => o.status === orderFilter);
    return `
      <div class="dash-title"><div><h1>Orders</h1><p>Confirm bookings, update status and record payments.</p></div></div>
      <div class="panel">
        <div class="panel-head">
          <h3>${list.length} order${list.length === 1 ? "" : "s"}</h3>
          <select class="select" id="orderFilter" style="max-width:220px">
            ${["All"].concat(D.ORDER_STATUSES).map((s) => `<option ${s === orderFilter ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </div>
        ${list.length ? `<div class="table-scroll"><table class="tbl">
          <thead><tr><th>Reference</th><th>Customer</th><th>Pickup</th><th style="text-align:right">Total</th><th>Status</th><th>Payment</th></tr></thead>
          <tbody>${list.map((o) => `<tr>
            <td class="item">${esc(o.reference)}<br><small class="muted">${(o.items || []).length} lines</small></td>
            <td>${esc(o.customerName)}<br><small class="muted">${esc(o.phone)}</small></td>
            <td><small>${esc((o.pickup && o.pickup.date) || "—")}<br>${esc((o.pickup && o.pickup.slot) || "")}</small></td>
            <td class="num">${money(o.total)}</td>
            <td>${selectFor(D.ORDER_STATUSES, o.status, `data-order="${esc(o.reference)}"`)}</td>
            <td>${selectFor(D.PAYMENT_STATUSES, o.paymentStatus, `data-pay="${esc(o.reference)}"`)}</td>
          </tr>`).join("")}</tbody>
        </table></div>` : '<p class="muted text-sm" style="margin:0">No orders match this filter.</p>'}
      </div>
      <p class="form-note">Changing a status or payment value saves immediately.</p>`;
  }

  function viewQuotes() {
    return `<div class="dash-title"><div><h1>Quote requests</h1><p>Painting, cleaning and bulk laundry enquiries.</p></div></div>
      <div class="panel">
        ${quotes.length ? quotes.map((q) => `<div class="list-row" style="align-items:flex-start">
          <div style="flex:1;min-width:220px">
            <strong>${esc(q.reference || "")} · ${esc(q.serviceType || "")}</strong>
            <small>${esc(q.customerName)} · ${esc(q.phone)}${q.email ? " · " + esc(q.email) : ""}</small>
            <div class="text-sm muted" style="margin-top:8px">${esc(q.details || "")}</div>
            <div class="text-sm muted" style="margin-top:6px">${esc(q.location || "")}${q.preferredDate ? " · preferred " + esc(q.preferredDate) : ""}</div>
          </div>
          <div style="text-align:right;display:grid;gap:8px;justify-items:end">
            ${selectFor(QUOTE_STATUSES, q.status || "New", `data-quote="${esc(q.reference)}"`)}
            <a class="btn btn-outline btn-sm" href="tel:${esc(q.phone)}">Call</a>
          </div>
        </div>`).join("") : '<p class="muted text-sm" style="margin:0">No quote requests yet.</p>'}
      </div>`;
  }

  function viewSubs() {
    return `<div class="dash-title"><div><h1>Subscriptions</h1><p>Plan requests and their activation status.</p></div></div>
      <div class="panel">
        ${subs.length ? `<div class="table-scroll"><table class="tbl">
          <thead><tr><th>Customer</th><th>Plan</th><th>Address</th><th>Requested</th><th>Status</th></tr></thead>
          <tbody>${subs.map((s) => `<tr>
            <td class="item">${esc(s.customerName)}<br><small class="muted">${esc(s.phone)}</small></td>
            <td>${esc(s.plan)}</td>
            <td><small>${esc(s.address || "")}</small></td>
            <td><small>${esc((s.createdAt || "").slice(0, 10))}</small></td>
            <td>${selectFor(SUB_STATUSES, s.status, `data-sub="${esc(s.reference)}"`)}</td>
          </tr>`).join("")}</tbody></table></div>` : '<p class="muted text-sm" style="margin:0">No subscription requests yet.</p>'}
      </div>`;
  }

  function viewMessages() {
    return `<div class="dash-title"><div><h1>Messages</h1><p>Enquiries sent through the contact form.</p></div></div>
      <div class="panel">
        ${messages.length ? messages.map((m) => `<div class="list-row" style="align-items:flex-start">
          <div style="flex:1">
            <strong>${esc(m.customerName)} <small class="muted" style="font-weight:400">${esc(m.phone)}</small></strong>
            <small>${esc(m.interests || "General enquiry")} · ${esc((m.createdAt || "").slice(0, 10))}</small>
            <div class="text-sm muted" style="margin-top:8px">${esc(m.message || "")}</div>
          </div>
          <a class="btn btn-outline btn-sm" href="tel:${esc(m.phone)}">Call</a>
        </div>`).join("") : '<p class="muted text-sm" style="margin:0">No messages yet.</p>'}
      </div>`;
  }

  function viewCustomers() {
    const list = customers.filter((c) => c.role !== "admin");
    return `<div class="dash-title"><div><h1>Customers</h1><p>${list.length} registered customer${list.length === 1 ? "" : "s"}.</p></div></div>
      <div class="panel">
        ${list.length ? `<div class="table-scroll"><table class="tbl">
          <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Joined</th></tr></thead>
          <tbody>${list.map((c) => `<tr>
            <td class="item">${esc((c.firstName || "") + " " + (c.lastName || ""))}</td>
            <td>${esc(c.phone || "")}</td>
            <td><small>${esc(c.email || "—")}</small></td>
            <td><small>${esc(c.address || "—")}</small></td>
            <td><small>${esc((c.createdAt || "").slice(0, 10))}</small></td>
          </tr>`).join("")}</tbody></table></div>` : '<p class="muted text-sm" style="margin:0">No customers yet.</p>'}
      </div>`;
  }

  const MIN = { wash: 500, iron: 400, washiron: 900, dry: 500, express: 900 };

  function viewPrices() {
    return `<div class="dash-title"><div><h1>Price list</h1><p>Edit rates here — changes appear on the website immediately. Minimums are enforced: wash ₦500, iron ₦400, wash &amp; iron ₦900, dry cleaning ₦500. Untick “Active” to hide an item you do not offer.</p></div>
        <button class="btn btn-primary btn-sm" data-save-prices>Save changes</button></div>
      ${groups.map((g) => {
        const cols = g.id === "bulk" ? ["flat"] : g.cols;
        const head = (g.id === "bulk" ? ["Rate"] : cols.map((c) => D.KEY_LABELS[c])).concat(["Active"]);
        return `
        <div class="panel">
          <div class="panel-head"><h3>${esc(g.name)}</h3></div>
          <div class="table-scroll"><table class="tbl">
            <thead><tr><th>Item</th>${head.map((l) => `<th style="text-align:right">${esc(l)}</th>`).join("")}</tr></thead>
            <tbody>${g.rows.map((r, ri) => `<tr>
              <td class="item">${esc(r.name)}<br><small class="muted">${esc(r.includes || "")}</small></td>
              ${cols.map((c) => `<td style="text-align:right">
                <input class="input" type="number" min="${MIN[c] || 0}" step="50" value="${r[c] != null ? r[c] : ""}"
                  data-price="${esc(g.id)}|${ri}|${c}" style="width:104px;padding:8px;text-align:right;font-size:.85rem" ${r[c] == null ? 'placeholder="—"' : ""}>
              </td>`).join("")}
              <td style="text-align:right"><input type="checkbox" data-active="${esc(g.id)}|${ri}" ${r.active === false ? "" : "checked"} aria-label="Active"></td>
            </tr>`).join("")}</tbody>
          </table></div>
        </div>`;
      }).join("")}`;
  }

  /* ---------- rendering ---------- */
  function render(tab) {
    const views = { overview: viewOverview, orders: viewOrders, quotes: viewQuotes, subs: viewSubs, messages: viewMessages, customers: viewCustomers, prices: viewPrices };
    el("adm-panel").innerHTML = (views[tab] || viewOverview)();
    document.querySelectorAll("#adm-nav button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    bind();
  }

  function bind() {
    const f = el("orderFilter");
    if (f) f.addEventListener("change", () => { orderFilter = f.value; render("orders"); });

    document.querySelectorAll("[data-order]").forEach((s) =>
      s.addEventListener("change", async () => {
        const res = await API.call("updateOrder", { reference: s.dataset.order, status: s.value });
        if (res.ok) { UI.toast("Status updated"); refreshData(); } else UI.toast(res.error || "Could not update", "error");
      })
    );
    document.querySelectorAll("[data-pay]").forEach((s) =>
      s.addEventListener("change", async () => {
        const res = await API.call("updateOrder", { reference: s.dataset.pay, paymentStatus: s.value });
        if (res.ok) { UI.toast("Payment updated"); refreshData(); } else UI.toast(res.error || "Could not update", "error");
      })
    );
    document.querySelectorAll("[data-quote]").forEach((s) =>
      s.addEventListener("change", async () => {
        const res = await API.call("updateQuote", { reference: s.dataset.quote, status: s.value });
        if (res.ok) UI.toast("Quote updated"); else UI.toast(res.error || "Could not update", "error");
      })
    );
    document.querySelectorAll("[data-sub]").forEach((s) =>
      s.addEventListener("change", async () => {
        const res = await API.call("updateSubscription", { reference: s.dataset.sub, status: s.value });
        if (res.ok) UI.toast("Subscription updated"); else UI.toast(res.error || "Could not update", "error");
      })
    );

    const saveBtn = document.querySelector("[data-save-prices]");
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving…";
        document.querySelectorAll("[data-price]").forEach((inp) => {
          const [gid, ri, col] = inp.dataset.price.split("|");
          const g = groups.find((x) => x.id === gid);
          if (!g) return;
          const v = inp.value === "" ? null : Number(inp.value);
          g.rows[Number(ri)][col] = v;
        });
        document.querySelectorAll("[data-active]").forEach((cb) => {
          const [gid, ri] = cb.dataset.active.split("|");
          const g = groups.find((x) => x.id === gid);
          if (g) g.rows[Number(ri)].active = cb.checked;
        });
        const res = await API.call("savePrices", { groups });
        saveBtn.disabled = false;
        saveBtn.textContent = "Save changes";
        UI.toast(res.ok ? "Prices saved" : res.error || "Could not save", res.ok ? "ok" : "error");
      });
    }
  }

  async function refreshData() {
    const [s, o, q, su, m, c, p] = await Promise.all([
      API.call("stats", {}),
      API.call("listOrders", {}),
      API.call("listQuotes", {}),
      API.call("listSubscriptions", {}),
      API.call("listMessages", {}),
      API.call("listCustomers", {}),
      API.call("getPrices", { all: true })
    ]);
    if (s.ok) stats = s.data;
    if (o.ok) orders = o.data.orders || [];
    if (q.ok) quotes = q.data.quotes || [];
    if (su.ok) subs = su.data.subscriptions || [];
    if (m.ok) messages = m.data.messages || [];
    if (c.ok) customers = c.data.customers || [];
    if (p.ok && p.data.groups) groups = p.data.groups;
  }

  function init() {
    if (!el("adm-panel")) return;
    user = API.currentUser();
    if (!user) {
      window.location.replace("login.html?next=admin.html");
      return;
    }
    el("adm-name").textContent = ((user.firstName || "") + " " + (user.lastName || "")).trim() || "Administrator";
    el("adm-avatar").textContent = UI.initials((user.firstName || "") + " " + (user.lastName || ""));

    if (user.role !== "admin") {
      el("adm-panel").innerHTML = notAuthorised();
    } else {
      document.getElementById("adm-nav").addEventListener("click", (e) => {
        const b = e.target.closest("[data-tab]");
        if (b) render(b.dataset.tab);
      });
      document.addEventListener("click", (e) => {
        if (e.target.closest("[data-reload]")) { refreshData().then(() => render("overview")); }
        const g = e.target.closest("[data-goto]");
        if (g) render(g.dataset.goto);
      });
      refreshData().then(() => render("overview"));
    }

    el("admLogout").addEventListener("click", async () => {
      await API.call("logout", {});
      API.setSession(null);
      window.location.href = "index.html";
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
