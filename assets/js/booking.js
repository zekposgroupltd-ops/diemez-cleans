/* DIEMEZ CLEANS — pickup booking flow */
(function () {
  const D = window.DIEMEZ_DATA;
  const UI = window.DiemezUI;
  const money = (n) => UI.money(n);
  const state = {}; // key -> { name, option, qty, price, unit }

  const el = (id) => document.getElementById(id);
  const keyOf = (g, r, opt) => g.id + "|" + r.name + "|" + opt;

  function optionsFor(group, row) {
    if (group.id === "bulk") return [{ key: "flat", label: "Per " + row.unit }];
    return group.cols
      .filter((c) => row[c] != null)
      .map((c) => ({
        key: c,
        label: (group.optionLabels && group.optionLabels[c]) || D.KEY_LABELS[c]
      }));
  }

  function renderGroups() {
    el("itemGroups").innerHTML = D.PRICE_GROUPS.map((g, gi) => {
      const rows = g.rows
        .map((r, ri) => {
          const opts = optionsFor(g, r);
          const first = opts[0];
          const k = keyOf(g, r, first.key);
          state[k] = state[k] || { name: r.name, option: first.label, qty: 0, price: g.id === "bulk" ? r.flat : r[first.key], unit: r.unit || "" };
          const sel =
            opts.length > 1
              ? `<select class="select" style="padding:9px 34px 9px 12px;font-size:.84rem" data-sel="${g.id}|${ri}">${opts
                  .map((o) => `<option value="${o.key}">${o.label}</option>`)
                  .join("")}</select>`
              : `<span class="muted" style="font-size:.84rem">${first.label} — <strong style="color:var(--navy)">${money(g.id === "bulk" ? r.flat : r[first.key])}</strong>${r.unit ? " / " + r.unit : ""}</span>`;
          return `<div class="list-row">
            <div style="min-width:150px;flex:1">
              <strong style="font-size:.88rem">${r.name}</strong>${r.includes ? `<div class="muted" style="font-size:.74rem;line-height:1.4;margin-top:2px;max-width:46ch">${r.includes}</div>` : ""}
              <div style="margin-top:6px">${sel}</div>
            </div>
            <input class="input" type="number" min="0" step="1" value="0" inputmode="numeric"
              data-qty="${g.id}|${ri}" aria-label="Quantity of ${r.name}"
              style="width:82px;text-align:center;padding:9px 8px">
          </div>`;
        })
        .join("");
      return `<details class="acc" ${gi === 0 ? "open" : ""}>
        <summary>${g.name}</summary>
        <div class="acc-body">${rows}</div>
      </details>`;
    }).join("");
  }

  function recalc() {
    let total = 0;
    let count = 0;
    const lines = Object.values(state).filter((s) => s.qty > 0);
    lines.forEach((s) => {
      total += s.price * s.qty;
      count += s.qty;
    });
    el("summaryLines").innerHTML = lines.length
      ? lines
          .map(
            (s) =>
              `<div class="sum-row"><span>${s.qty} × ${s.name}<br><span style="font-size:.76rem">${s.option}</span></span><strong>${money(
                s.price * s.qty
              )}</strong></div>`
          )
          .join("")
      : '<p class="muted text-sm" style="margin:0">No items selected yet.</p>';
    el("summaryTotal").textContent = money(total);
    el("itemCount").textContent = count + (count === 1 ? " item" : " items");
    return { total, count, lines };
  }

  function onQty(e) {
    const inp = e.target.closest("[data-qty]");
    if (!inp) return;
    const [gid, ri] = inp.dataset.qty.split("|");
    const group = D.PRICE_GROUPS.find((g) => g.id === gid);
    const row = group.rows[Number(ri)];
    const sel = inp.closest(".list-row").querySelector("[data-sel]");
    const optKey = sel ? sel.value : optionsFor(group, row)[0].key;
    const optLabel = (group.optionLabels && group.optionLabels[optKey]) || D.KEY_LABELS[optKey] || "Per " + row.unit;
    const k = keyOf(group, row, optKey);
    const qty = Math.max(0, Math.floor(Number(inp.value) || 0));
    state[k] = {
      name: row.name,
      option: optLabel,
      qty,
      price: group.id === "bulk" ? row.flat : row[optKey],
      unit: row.unit || ""
    };
    /* clear the same row's other option so quantities don't double up */
    optionsFor(group, row).forEach((o) => {
      const other = keyOf(group, row, o.key);
      if (other !== k && state[other]) state[other].qty = 0;
    });
    recalc();
  }

  function onSel(e) {
    const sel = e.target.closest("[data-sel]");
    if (!sel) return;
    const [gid, ri] = sel.dataset.sel.split("|");
    const group = D.PRICE_GROUPS.find((g) => g.id === gid);
    const row = group.rows[Number(ri)];
    const wrap = sel.closest(".list-row");
    const qtyInp = wrap.querySelector("[data-qty]");
    const previousQty = Number(qtyInp.value) || 0;
    qtyInp.value = previousQty;
    onQty({ target: qtyInp });
  }

  function initSelects() {
    el("b-slot").innerHTML = D.TIME_SLOTS.map((s) => `<option>${s}</option>`).join("");
    el("b-area").innerHTML = D.SERVICE_AREAS.map((s) => `<option>${s}</option>`).join("");
    const d = new Date();
    d.setDate(d.getDate() + 1);
    el("b-date").min = d.toISOString().slice(0, 10);
    el("b-date").value = d.toISOString().slice(0, 10);
  }

  function prefill() {
    const u = window.DiemezAPI.currentUser();
    if (!u) return;
    el("b-name").value = ((u.firstName || "") + " " + (u.lastName || "")).trim();
    el("b-phone").value = u.phone || "";
    if (u.address) el("b-address").value = u.address;
  }

  function showError(msg) {
    el("bookingError").innerHTML = msg
      ? `<div class="alert alert--error" style="margin:0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg><span>${msg}</span></div>`
      : "";
  }

  async function submit(e) {
    e.preventDefault();
    showError("");
    const { total, count, lines } = recalc();
    if (!lines.length) return showError("Please add at least one item to your booking.");
    const name = el("b-name").value.trim();
    const phone = el("b-phone").value.trim();
    const date = el("b-date").value;
    const address = el("b-address").value.trim();
    if (!name) return showError("Please enter your full name.");
    if (phone.replace(/\D/g, "").length < 10) return showError("Please enter a valid phone number.");
    if (!date) return showError("Please choose a pickup date.");
    if (!address) return showError("Please enter the pickup address.");

    const btn = el("bookingSubmit");
    btn.disabled = true;
    btn.textContent = "Sending your booking…";

    try {
      const res = await window.DiemezAPI.call("createOrder", {
        customerName: name,
        phone,
        items: lines.map((s) => ({ name: s.name, option: s.option, qty: s.qty, unitPrice: s.price })),
        subtotal: total,
        deliveryFee: 0,
        pickup: {
          date,
          slot: el("b-slot").value,
          area: el("b-area").value,
          address,
          notes: el("b-notes").value.trim()
        },
        paymentMethod: (document.querySelector('input[name="pay"]:checked') || {}).value || "Pay on pickup"
      });

      if (!res.ok) throw new Error(res.error || "We could not save your booking.");

      const o = res.data.order;
      el("bookingWizard").classList.add("hidden");
      const done = el("bookingDone");
      done.classList.remove("hidden");
      done.innerHTML = `
        <div class="card" style="max-width:640px;margin:0 auto;text-align:center;padding:38px">
          <div class="empty-ic" style="background:var(--success-soft);color:var(--success)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <h2 style="margin-bottom:8px">Booking received</h2>
          <p class="muted">Thank you, ${name.split(" ")[0]}. Your request has reached our team and we'll confirm the pickup by phone.</p>
          <div class="card card--pad-sm mt-3" style="background:var(--mist);border-color:#DCE6F0">
            <div class="sum-row"><span>Booking reference</span><strong class="mono">${o.reference}</strong></div>
            <div class="sum-row"><span>Pickup</span><strong>${date} · ${o.pickup.slot}</strong></div>
            <div class="sum-row"><span>Items</span><strong>${count}</strong></div>
            <div class="sum-row"><span>Estimated total</span><strong>${money(o.total)}</strong></div>
          </div>
          <p class="form-note mt-2">Keep this reference — you'll need it when you contact us about the order.</p>
          <div class="btn-row" style="justify-content:center;margin-top:18px">
            <a class="btn btn-navy" href="account.html">View my orders</a>
            <a class="btn btn-outline" href="https://wa.me/${window.DIEMEZ_CONFIG.business.whatsapp}?text=${encodeURIComponent(
              "Hello DIEMEZ CLEANS, about my booking " + o.reference
            )}" target="_blank" rel="noopener">Message us</a>
          </div>
        </div>`;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showError(err.message || "Something went wrong. Please try again or contact us on WhatsApp.");
      btn.disabled = false;
      btn.textContent = "Confirm booking request";
    }
  }

  async function init() {
    if (!el("itemGroups")) return;
    /* use live prices from the backend when available (the server re-checks them on submit anyway) */
    try {
      const res = await window.DiemezAPI.call("getPrices", {});
      if (res.ok && res.data && res.data.groups && res.data.groups.length) D.PRICE_GROUPS = res.data.groups;
    } catch (e) { /* bundled prices */ }
    renderGroups();
    initSelects();
    prefill();
    recalc();
    el("itemGroups").addEventListener("input", onQty);
    el("itemGroups").addEventListener("change", onSel);
    el("bookingForm").addEventListener("submit", submit);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
