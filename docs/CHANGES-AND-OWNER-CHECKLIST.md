# What changed in this update

1. **Pricing** — replaced with the Orange Laundromat public price list (orangelaundromat.ng/pricing, checked 24 Oct 2026):
   57 categories, four service columns (Wash only / Iron only / Wash & iron / Dry cleaning), bulk by kg (₦1,200) and by cycle (₦15,000).
   Every reference rate already met the DIEMEZ minimums (wash ≥ ₦500, iron ≥ ₦400, wash & iron ≥ ₦900, dry cleaning ≥ ₦500), so nothing was raised.
   The minimums are also enforced on the server (Code.gs `MIN_PRICE`): the admin editor refuses lower prices and orders can never be charged below them.
2. **Plans** — Orange's six-plan ladder (Basic ₦30k, Basic Plus ₦40k, Standard ₦50k, Standard Plus ₦65k, Premium ₦80k, Premium Plus ₦110k) with allowances and covered categories.
3. **Logo** — new DC monogram (D inside an open C, with a sparkle) + outlined wordmark. Files in `icons/`: `logo.svg`, `logo-light.svg`, `logo.png`, `logo-light.png`, `icon-192/512.png`, `maskable-512.png`, `apple-touch-icon.png`, `favicon.svg`.
4. **Images** — original illustrated scenes in `assets/img/` with drop-in slots for real photos (see `assets/img/README.md`).
5. **UI/UX** — Orange-style header, "Message Us" side panel, WhatsApp pill, photo hero, searchable price cards, plan cards, centred login/register, and the Home / Orders / Subscriptions / Wallet / Profile dashboard.
6. **Auth** — phone + password only. No OTP.

## Upgrading an existing Google Sheet
The PriceList sheet has new columns. Re-run `setup()` on a **new** spreadsheet, or delete the old `PriceList` tab and run `setup()` again.
Then redeploy the web app (Deploy → Manage deployments → New version).

## Owner must confirm before launch
- [ ] Prices: these are Orange's rates (Lagos). Confirm they suit Bayelsa, and untick **Active** in Admin → Price list for anything you do not offer (e.g. wedding gowns ₦27,000, leather, rugs, travelling boxes).
- [ ] Plans: allowances/prices are Orange's reference values — approve or edit before advertising. "Unused counts roll over" is a policy you must be willing to honour.
- [ ] Express / semi-express: Orange publishes no per-item express price, so none is shown (quote on request). Minimum if you add one: ₦900.
- [ ] Pickup/delivery: plans say "free pickup and delivery". Confirm fees and covered areas (`data.js` SERVICE_AREAS, register-page note).
- [ ] Wallet: display only. Top-ups stay disabled until a payment provider is chosen and verified server-side.
- [ ] Referral reward and first-order discount remain off/neutral until approved (`config.js`).
- [ ] Admin password in `Code.gs` CONFIG — change before going live.
- [ ] Real photos, if wanted.

---

# Update 2 — logo motion + responsiveness
- **New monogram:** hexagon seal with a D (with counter) nested in an open C ring and a small facet. Light/dark versions, all icons regenerated (`icons/`).
- **Bouncy animated logo:** `icons/logo-animated.svg` / `logo-animated-light.svg` (CSS animation, scales to any screen) and `icons/logo-animated.png` / `logo-animated-light.png` (animated PNG, transparent, loops).
- **Splash:** plays once per browser session on first page load (click to skip). Skipped automatically for visitors with "reduce motion" turned on. The header logo also bounces in on every page, and wiggles on hover.
- **Responsive:** fluid gutters, nav collapses at 1180px, 3→2→1 column grids, price/dashboard layouts adapted for tablets and phones, 44px touch targets, 16px form fields on phones (no iOS zoom), safe-area insets for notched phones, landscape/short-screen rules, and larger layouts on 1500px+ screens. All in the CSS layer at the end of `assets/css/styles.css`.
