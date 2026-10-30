/* DIEMEZ CLEANS — API layer.
   Talks to the Google Apps Script web app when DIEMEZ_CONFIG.apiUrl is set.
   Otherwise it runs a browser-only demo store so the whole flow can be
   tested before the backend is deployed. */
window.DiemezAPI = (function () {
  const CFG = window.DIEMEZ_CONFIG;
  const LS = {
    users: "dc.users",
    orders: "dc.orders",
    quotes: "dc.quotes",
    subs: "dc.subs",
    msgs: "dc.messages",
    prices: "dc.prices.v2",
    seq: "dc.seq",
    session: "dc.session",
    seeded: "dc.seeded"
  };

  const rd = (k, d) => {
    try {
      const v = JSON.parse(localStorage.getItem(k));
      return v === null || v === undefined ? d : v;
    } catch (e) {
      return d;
    }
  };
  const wr = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const now = () => new Date().toISOString();
  const hash = (p) => btoa(unescape(encodeURIComponent("dc::" + p)));
  const token = () => "tk" + Math.random().toString(36).slice(2) + Date.now().toString(36);

  function next(kind) {
    const all = rd(LS.seq, {});
    all[kind] = (all[kind] || 0) + 1;
    wr(LS.seq, all);
    return all[kind];
  }
  function reference(kind) {
    const y = new Date().getFullYear();
    return "DC-" + kind.toUpperCase() + "-" + y + "-" + String(next(kind)).padStart(4, "0");
  }

  /* ---------------- session ---------------- */
  function session() {
    return rd(LS.session, null);
  }
  function setSession(s) {
    if (s) wr(LS.session, s);
    else localStorage.removeItem(LS.session);
  }
  function currentUser() {
    const s = session();
    if (!s) return null;
    if (CFG.apiUrl) return s.user || null;
    const u = rd(LS.users, []).find((x) => x.id === s.userId);
    if (!u) return null;
    const { password, ...safe } = u;
    return safe;
  }

  /* ---------------- demo seed ---------------- */
  function seed() {
    if (rd(LS.seeded, false)) return;
    wr(LS.users, [
      {
        id: "u-admin",
        firstName: "Diemez",
        lastName: "Admin",
        phone: "08129511794",
        email: CFG.business.email,
        password: hash("diemez2026"),
        role: "admin",
        createdAt: now()
      },
      {
        id: "u-sample",
        firstName: "Sample",
        lastName: "Customer",
        phone: "08000000000",
        email: "sample@example.com",
        password: hash("sample1234"),
        role: "customer",
        address: "Agudama, Yenagoa",
        referral: "dc-smp-4821",
        createdAt: now()
      }
    ]);
    wr(LS.orders, [
      {
        id: "o-1",
        reference: "DC-ORD-2026-1001",
        demo: true,
        customerName: "Sample Customer",
        phone: "08000000000",
        items: [
          { name: "Shirts (Regular)", option: "Wash only", qty: 5, unitPrice: 650 },
          { name: "Trousers (Regular)", option: "Dry cleaning", qty: 2, unitPrice: 2200 }
        ],
        subtotal: 7650,
        deliveryFee: 0,
        total: 7650,
        pickup: { date: "", slot: "10:00 AM – 12:00 PM", address: "Agudama, Yenagoa", area: "Agudama", notes: "" },
        status: "Pending Confirmation",
        paymentStatus: "Unpaid",
        paymentMethod: "Pay on pickup",
        createdAt: now()
      },
      {
        id: "o-2",
        reference: "DC-ORD-2026-1002",
        demo: true,
        customerName: "Sample Customer",
        phone: "08000000000",
        items: [{ name: "Duvets & Comforters (Large)", option: "Wash & iron", qty: 1, unitPrice: 7000 }],
        subtotal: 7000,
        deliveryFee: 0,
        total: 7000,
        pickup: { date: "", slot: "2:00 PM – 4:00 PM", address: "Agudama, Yenagoa", area: "Agudama", notes: "" },
        status: "Processing",
        paymentStatus: "Paid",
        paymentMethod: "Bank transfer",
        createdAt: now()
      },
      {
        id: "o-3",
        reference: "DC-ORD-2026-1003",
        demo: true,
        customerName: "Sample Customer",
        phone: "08000000000",
        items: [{ name: "Suits (2-Piece)", option: "Dry cleaning", qty: 1, unitPrice: 4800 }],
        subtotal: 4800,
        deliveryFee: 0,
        total: 4800,
        pickup: { date: "", slot: "8:00 AM – 10:00 AM", address: "Agudama, Yenagoa", area: "Agudama", notes: "" },
        status: "Delivered",
        paymentStatus: "Paid",
        paymentMethod: "Pay on pickup",
        createdAt: now()
      }
    ]);
    wr(LS.quotes, []);
    wr(LS.subs, []);
    wr(LS.msgs, []);
    wr(LS.seeded, true);
  }

  /* ---------------- demo backend ---------------- */
  function demo(action, p) {
    seed();
    const users = () => rd(LS.users, []);

    switch (action) {
      case "register": {
        const phone = String(p.phone || "").replace(/\s+/g, "");
        if (users().some((u) => u.phone === phone)) {
          return { ok: false, error: "An account with this phone number already exists. Please log in." };
        }
        const user = {
          id: "u-" + Date.now(),
          firstName: p.firstName,
          lastName: p.lastName,
          phone: phone,
          email: p.email || "",
          address: p.address || "",
          password: hash(p.password),
          role: "customer",
          referral: p.referral || "dc-" + Math.random().toString(36).slice(2, 5) + "-" + String(Math.floor(1000 + Math.random() * 8999)),
          referredBy: p.referral || "",
          createdAt: now()
        };
        wr(LS.users, users().concat([user]));
        const tk = token();
        user.token = tk;
        wr(LS.users, users().map((u) => (u.id === user.id ? user : u)));
        const { password: _p, ...safeNew } = user;
        return { ok: true, data: { user: safeNew, token: tk } };
      }

      case "login": {
        const id = String(p.identifier || "").toLowerCase().replace(/\s+/g, "");
        const u = users().find(
          (x) => x.phone === id || (x.email && x.email.toLowerCase() === id)
        );
        if (!u || u.password !== hash(p.password)) {
          return { ok: false, error: "Phone number or password is incorrect." };
        }
        const tk = token();
        u.token = tk;
        wr(LS.users, users().map((x) => (x.id === u.id ? u : x)));
        const { password: _pw, ...safeLogin } = u;
        return { ok: true, data: { user: safeLogin, token: tk } };
      }

      case "logout":
        setSession(null);
        return { ok: true, data: { loggedOut: true } };

      case "me": {
        const u = currentUser();
        if (!u) return { ok: false, error: "Not signed in." };
        return { ok: true, data: { user: u } };
      }

      case "updateProfile": {
        const u = currentUser();
        if (!u) return { ok: false, error: "Not signed in." };
        const list = users().map((x) =>
          x.id === u.id
            ? { ...x, firstName: p.firstName, lastName: p.lastName, email: p.email, address: p.address }
            : x
        );
        wr(LS.users, list);
        return { ok: true, data: { user: currentUser() } };
      }

      case "changePassword": {
        const u = currentUser();
        if (!u) return { ok: false, error: "Not signed in." };
        const raw = users().find((x) => x.id === u.id);
        if (!raw || raw.password !== hash(p.current)) return { ok: false, error: "Current password is incorrect." };
        wr(LS.users, users().map((x) => (x.id === u.id ? { ...x, password: hash(p.next) } : x)));
        return { ok: true, data: { changed: true } };
      }

      case "createOrder": {
        const u = currentUser();
        const order = {
          id: "o-" + Date.now(),
          reference: reference("ord"),
          userId: u ? u.id : "",
          customerName: p.customerName,
          phone: p.phone,
          items: p.items,
          subtotal: p.subtotal,
          deliveryFee: p.deliveryFee || 0,
          total: p.subtotal + (p.deliveryFee || 0),
          pickup: p.pickup,
          notes: p.notes || "",
          status: "Pending Confirmation",
          paymentStatus: "Unpaid",
          paymentMethod: p.paymentMethod,
          createdAt: now()
        };
        wr(LS.orders, [order].concat(rd(LS.orders, [])));
        return { ok: true, data: { order } };
      }

      case "myOrders": {
        const u = currentUser();
        const all = rd(LS.orders, []);
        const mine = u
          ? all.filter((o) => o.userId === u.id || o.phone === u.phone)
          : all.filter((o) => o.phone === p.phone);
        return { ok: true, data: { orders: mine } };
      }

      case "createQuote": {
        const quote = {
          id: "q-" + Date.now(),
          reference: reference("quo"),
          ...p,
          status: "New",
          createdAt: now()
        };
        wr(LS.quotes, [quote].concat(rd(LS.quotes, [])));
        return { ok: true, data: { quote } };
      }

      case "createSubscription": {
        const u = currentUser();
        const sub = {
          id: "s-" + Date.now(),
          reference: reference("sub"),
          userId: u ? u.id : "",
          ...p,
          status: "Pending activation",
          createdAt: now()
        };
        wr(LS.subs, [sub].concat(rd(LS.subs, [])));
        return { ok: true, data: { subscription: sub } };
      }

      case "mySubscriptions": {
        const u = currentUser();
        if (!u) return { ok: true, data: { subscriptions: [] } };
        const mine = rd(LS.subs, []).filter((s) => s.userId === u.id || s.phone === u.phone);
        return { ok: true, data: { subscriptions: mine } };
      }

      case "contact": {
        wr(LS.msgs, [{ id: "m-" + Date.now(), ...p, status: "New", createdAt: now() }].concat(rd(LS.msgs, [])));
        return { ok: true, data: { sent: true } };
      }

      case "getPrices": {
        const override = rd(LS.prices, null);
        return {
          ok: true,
          data: { groups: override || window.DIEMEZ_DATA.PRICE_GROUPS, plans: window.DIEMEZ_DATA.PLANS }
        };
      }

      case "savePrices": {
        const MIN = { wash: 500, iron: 400, washiron: 900, dry: 500, express: 900 };
        for (const g of p.groups || []) for (const r of g.rows || []) for (const k in MIN)
          if (r[k] != null && r[k] !== "" && Number(r[k]) < MIN[k]) return { ok: false, error: r.name + ": the " + k + " price must be at least ₦" + MIN[k] + "." };
        wr(LS.prices, p.groups);
        return { ok: true, data: { saved: true } };
      }

      /* ---- admin ---- */
      case "listOrders":
        return { ok: true, data: { orders: rd(LS.orders, []) } };

      case "updateOrder": {
        const list = rd(LS.orders, []).map((o) =>
          o.reference === p.reference
            ? { ...o, status: p.status || o.status, paymentStatus: p.paymentStatus || o.paymentStatus, notes: p.staffNote !== undefined ? p.staffNote : o.notes }
            : o
        );
        wr(LS.orders, list);
        return { ok: true, data: { updated: true } };
      }

      case "listQuotes":
        return { ok: true, data: { quotes: rd(LS.quotes, []) } };

      case "updateQuote": {
        wr(LS.quotes, rd(LS.quotes, []).map((q) => (q.reference === p.reference ? { ...q, status: p.status } : q)));
        return { ok: true, data: { updated: true } };
      }

      case "listSubscriptions":
        return { ok: true, data: { subscriptions: rd(LS.subs, []) } };

      case "updateSubscription": {
        wr(LS.subs, rd(LS.subs, []).map((s) => (s.reference === p.reference ? { ...s, status: p.status } : s)));
        return { ok: true, data: { updated: true } };
      }

      case "listMessages":
        return { ok: true, data: { messages: rd(LS.msgs, []) } };

      case "listCustomers":
        return {
          ok: true,
          data: { customers: users().map(({ password, ...u }) => u) }
        };

      case "stats": {
        const orders = rd(LS.orders, []);
        const revenue = orders
          .filter((o) => o.paymentStatus === "Paid")
          .reduce((s, o) => s + (o.total || 0), 0);
        return {
          ok: true,
          data: {
            orders: orders.length,
            pending: orders.filter((o) => o.status === "Pending Confirmation").length,
            processing: orders.filter((o) => ["Confirmed", "Pickup Scheduled", "Picked Up", "Processing"].includes(o.status)).length,
            delivered: orders.filter((o) => o.status === "Delivered").length,
            revenue,
            outstanding: orders.filter((o) => o.paymentStatus !== "Paid" && o.status !== "Cancelled").reduce((s, o) => s + (o.total || 0), 0),
            quotes: rd(LS.quotes, []).length,
            subscriptions: rd(LS.subs, []).length
          }
        };
      }

      default:
        return { ok: false, error: "Unknown action: " + action };
    }
  }

  /* ---------------- public call ---------------- */
  async function call(action, payload) {
    const body = payload || {};
    let json;

    if (!CFG.apiUrl) {
      json = demo(action, body);
    } else {
      const res = await fetch(CFG.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action,
          token: (session() || {}).token || "",
          payload: body
        })
      });
      if (!res.ok) throw new Error("Network error (" + res.status + ")");
      json = await res.json();
    }

    /* keep the signed-in session in step with the server */
    if (json && json.ok && json.data) {
      if (json.data.token && json.data.user) {
        setSession({ token: json.data.token, userId: json.data.user.id, user: json.data.user });
      } else if (json.data.user && session()) {
        setSession({ ...session(), userId: json.data.user.id, user: json.data.user });
      }
    }
    if (action === "logout") setSession(null);

    return json;
  }

  return {
    call,
    demo,
    session,
    setSession,
    currentUser,
    isDemo: () => !CFG.apiUrl,
    resetDemo: () => {
      Object.values(LS).forEach((k) => localStorage.removeItem(k));
    }
  };
})();
