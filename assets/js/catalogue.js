/* DIEMEZ CLEANS — price catalogue + plan cards (Orange-style layout).
   Prices come from the backend (PriceList sheet) when connected, otherwise from data.js. */
(function () {
  const D = window.DIEMEZ_DATA;
  const UI = window.DiemezUI;
  const money = (n) => UI.money(n);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const tick = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  /* ---------------- plans ---------------- */
  function planCard(p, withButton) {
    const covers = (p.inherits ? `<div class="plan-cov-head">Covered categories <span>(+ all categories in ${esc(p.inherits)})</span></div>` : '<div class="plan-cov-head">Covered categories</div>');
    const chips = (p.cats || []).length
      ? `<div class="plan-cats">${p.cats.map((c) => `<span>${esc(c)}</span>`).join("")}</div>`
      : `<p class="muted text-sm" style="margin:0">Same categories as ${esc(p.inherits || "this plan")}.</p>`;
    const btn = withButton
      ? `<button class="btn btn-outline btn-block" data-plan="${esc(p.id)}">Select plan</button>`
      : `<a class="btn btn-outline btn-block" href="plans.html">Subscribe</a>`;
    return `
      <div class="plan ${p.featured ? "plan--featured" : ""} reveal">
        <span class="plan-name">${esc(p.name)}</span>
        <p class="muted text-sm plan-sum">${esc(p.summary)}</p>
        <div class="plan-price">${money(p.price)} <span>${esc(p.cadence)}</span></div>
        <ul class="tick">${p.items.map((i) => `<li>${tick}<span>${esc(i)}</span></li>`).join("")}</ul>
        ${withButton ? covers + chips : ""}
        ${btn}
      </div>`;
  }

  function renderPlans() {
    const grid = document.getElementById("plans-grid");
    const home = document.getElementById("home-plans");
    if (grid) grid.innerHTML = D.PLANS.map((p) => planCard(p, true)).join("");
    if (home) home.innerHTML = D.PLANS.filter((p) => ["basic", "standard", "premium"].includes(p.id)).map((p) => planCard(p, false)).join("");
  }

  /* ---------------- price list ---------------- */
  let groups = D.PRICE_GROUPS;
  let filterGroup = "all";
  let q = "";

  const COLS = ["wash", "iron", "washiron", "dry"];

  function tile(label, v) {
    return `<div class="ptile ${v == null ? "ptile--na" : ""}"><span>${label}</span><strong>${v == null ? "—" : money(v)}</strong></div>`;
  }

  function itemCard(g, r) {
    if (g.id === "bulk") {
      return `<article class="pcard"><div class="pcard-head"><h3>${esc(r.name)}</h3><p>${esc(r.includes || "")}</p></div>
        <div class="ptiles ptiles--one"><div class="ptile"><span>Rate</span><strong>${money(r.flat)} <small>/ ${esc(r.unit)}</small></strong></div></div></article>`;
    }
    const has = COLS.some((c) => r[c] != null);
    const tiles = has
      ? COLS.map((c) => tile(D.KEY_LABELS[c], r[c])).join("") + (r.express != null ? tile(D.KEY_LABELS.express, r.express) : "")
      : `<div class="ptile ptile--quote"><span>Price</span><strong>Request a quote</strong></div>`;
    return `<article class="pcard"><div class="pcard-head"><h3>${esc(r.name)}</h3><p>${esc(r.includes || "")}</p></div><div class="ptiles">${tiles}</div></article>`;
  }

  function renderPrices() {
    const body = document.getElementById("price-body");
    const tabs = document.getElementById("price-tabs");
    if (!body) return;
    if (tabs) {
      tabs.innerHTML = [{ id: "all", name: "All" }].concat(groups)
        .map((g) => `<button class="tab ${g.id === filterGroup ? "active" : ""}" data-g="${esc(g.id)}">${esc(g.name)}</button>`)
        .join("");
    }
    const term = q.trim().toLowerCase();
    let html = "";
    let shown = 0;
    groups.forEach((g) => {
      if (filterGroup !== "all" && g.id !== filterGroup) return;
      const rows = g.rows.filter((r) => !term || (r.name + " " + (r.includes || "")).toLowerCase().includes(term));
      if (!rows.length) return;
      shown += rows.length;
      html += `<h2 class="pgroup">${esc(g.name)}</h2><div class="pgrid">${rows.map((r) => itemCard(g, r)).join("")}</div>`;
    });
    body.innerHTML = shown ? html : `<div class="empty"><h4>No items match “${esc(q)}”</h4><p>Try a different word, or <a href="quote.html">ask us for a quote</a>.</p></div>`;
  }

  function bind() {
    const tabs = document.getElementById("price-tabs");
    if (tabs) tabs.addEventListener("click", (e) => {
      const b = e.target.closest("[data-g]");
      if (!b) return;
      filterGroup = b.dataset.g;
      renderPrices();
    });
    const s = document.getElementById("price-search");
    if (s) s.addEventListener("input", () => { q = s.value; renderPrices(); });
  }

  async function init() {
    renderPlans();
    bind();
    if (document.getElementById("price-body")) {
      try {
        const res = await window.DiemezAPI.call("getPrices", {});
        if (res.ok && res.data && res.data.groups && res.data.groups.length) groups = res.data.groups;
      } catch (e) { /* fall back to bundled data */ }
      renderPrices();
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
