# DIEMEZ CLEANS — website, PWA and backend

Laundry, cleaning, painting and interior finishing services.
Front end: plain HTML, CSS and JavaScript. Backend: Google Apps Script. Database: Google Sheets.

---

## 1. What is in this folder

```
index.html              Home
services.html           Service catalogue (laundry, cleaning, painting)
pricing.html            Per-item laundry price list
plans.html              Monthly laundry plans
pickup.html             Booking form (pickup request)
quote.html              Quotation request for painting / cleaning / bulk
faq.html                Frequently asked questions
about.html              About the business
contact.html            Contact details and message form
login.html              Login (phone or email + password, no OTP)
register.html           Create an account (no OTP)
account.html            Customer dashboard: orders, plan, profile
admin.html              Admin dashboard: orders, quotes, subscriptions,
                        messages, customers, price list
privacy.html            Privacy policy (draft — review before launch)
terms.html              Terms of service (draft — review before launch)
refund.html             Cancellation and refund policy (draft)
offline.html            Shown when the app is opened without a connection

manifest.webmanifest    Makes the site installable on phone and desktop
sw.js                   Service worker (offline app shell)
icons/                  Logo mark, app icons, logo lockups
icons/png-export.html   Generates the PNG app icons in one click

assets/css/styles.css   The whole design system
assets/js/config.js     Your business details + backend URL  ← edit this
assets/js/data.js       Service catalogue and starting prices
assets/js/api.js        Talks to the backend (or runs a browser demo)
assets/js/layout.js     Header, footer, WhatsApp button, toasts
assets/js/catalogue.js  Renders price tables and plan cards
assets/js/booking.js    Pickup booking flow
assets/js/forms.js      Quote, contact and plan request forms
assets/js/auth.js       Registration and login
assets/js/account.js    Customer dashboard
assets/js/admin.js      Admin dashboard

apps-script/Code.gs     The backend (paste into Google Apps Script)
apps-script/appsscript.json  Apps Script deployment settings

docs/README.md          This file
docs/TESTING-CHECKLIST.md  What to test before going live
```

---

## 2. Demo mode vs live mode

`assets/js/config.js` has one important setting:

```js
apiUrl: "",
```

- **Empty (as shipped)** — the site runs in **demo mode**. Accounts, bookings, quotes and price edits are stored in the visitor's own browser. Everything is clickable and testable, but nothing reaches a server and nothing is shared between devices.
- **Set to your Apps Script URL** — the site runs **live**: registrations, bookings and messages go into your Google Sheet, and the admin dashboard reads and writes the real data.

Demo admin login: phone `08129511794`, password `diemez2026`.
Demo customer login: phone `08000000000`, password `sample1234`.
These exist only in demo mode and only in the browser you use. Clear site data to reset the demo.

---

## 3. Set up the Google Sheets database and backend

1. Go to <https://sheets.google.com> and create a blank spreadsheet. Name it **DIEMEZ CLEANS Database**.
2. In that spreadsheet: **Extensions → Apps Script**.
3. Delete anything in `Code.gs`, then paste the entire contents of `apps-script/Code.gs`.
4. At the top of the file, change these three lines to your own details:
   ```js
   ADMIN_PHONE: '08129511794',
   ADMIN_PASSWORD: 'ChangeThisPassword123',
   ADMIN_EMAIL: 'info.diemezcleans@gmail.com',
   ```
   Use a strong password. This is the account you will use to run the business side of the site.
5. Click **Save** (the disk icon), then choose the function `setupDatabase` in the dropdown and click **Run**. Approve the permissions Google asks for (it needs to read and write the spreadsheet you just created).
6. You should now see sheets named: Users, Sessions, Orders, Quotes, Subscriptions, Messages, PriceList, Audit, Settings — with one admin row in Users.
7. Click **Deploy → New deployment → Web app** and set:
   - **Description:** DIEMEZ CLEANS API
   - **Execute as:** Me
   - **Who has access:** Anyone
8. Click **Deploy**, copy the **Web app URL** (it ends in `/exec`).
9. Open `assets/js/config.js` and paste it in:
   ```js
   apiUrl: "https://script.google.com/macros/s/AKfy..../exec",
   ```
10. Open the website, register a test account and place a test booking. Check that rows appear in the Orders sheet.

**When you change `Code.gs` later**, use **Deploy → Manage deployments → Edit → New version**, otherwise the old code keeps running.

**Test the API alone** by opening the `/exec` URL in a browser. It should return:
`{"ok":true,"data":{"service":"DIEMEZ CLEANS API","status":"running"}}`

---

## 4. Edit your business details

Everything customer-facing lives in `assets/js/config.js`:

- business name, descriptor, tagline
- phone, WhatsApp number (international format, no `+`), email
- address, business hours
- bank details for transfers (currently disabled)
- referral programme text (reward amounts are intentionally not published — see section 7)
- first-order offer (disabled until you approve it)

The header, footer, WhatsApp button, contact page and policies all read from this one file.

---

## 5. Put it on GitHub, then Vercel

1. Create a new repository on GitHub.
2. Upload the **contents** of this folder to the repository root, so `index.html` sits at the top level (not inside a subfolder). Keep the `assets`, `icons`, `apps-script` and `docs` folders with it.
3. In Vercel: **Add New → Project → Import** your repository.
4. Framework preset: **Other**. Build command: leave empty. Output directory: leave empty (or `.`).
5. Deploy. Vercel serves `index.html` at your root URL automatically.

Nothing needs to be built — these are static files. Any static host works the same way.

**Keep the backend URL out of public view?** It is not a secret: your Apps Script URL can be called by anyone, which is why every admin action is checked against a session token on the server. Never put your admin password in the front-end files or in the repository.

---

## 6. Install as an app (phone and PC)

The site is a Progressive Web App. Once deployed over **HTTPS** (Vercel does this automatically):

- **Android / Chrome:** open the site → menu → **Install app** (or the install prompt).
- **iPhone / Safari:** open the site → Share → **Add to Home Screen**.
- **Windows / macOS / Chrome or Edge:** install icon in the address bar, or menu → **Install DIEMEZ CLEANS**.

### PNG icons (needed for iOS and app stores)

The SVG icons work in Chrome and Android. For iOS and store listings you need PNGs:

1. Open `icons/png-export.html` in your browser.
2. Click **Download** on each tile.
3. Save the files into the `icons` folder using exactly these names: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `maskable-512.png`.
4. Re-deploy. The manifest already references `icon-192.png` and `icon-512.png`.

---

## 7. What is deliberately not published yet

These are wired as settings rather than hard-coded claims, because the business has not approved the numbers:

- **Referral rewards** — the referral code exists on every account, but no reward amount is stated. Set the wording you approve in `config.js → referral.rewardText`.
- **First-order 20% discount** — implemented as a setting, switched off: `firstOrderOffer.enabled: false`.
- **Bank details** — `config.bank.enabled: false` until you confirm the account.
- **Express rates** — no express price is published (quote on request); checkout says express is subject to capacity.
- **Pickup and delivery fees** — currently shown as included. If you introduce fees or a minimum order, they belong in `data.js` and must also be enforced in `Code.gs`.

---

## 8. Security notes

- Passwords are hashed with SHA-256 and a per-user salt before storage. Plain passwords are never written to the sheet.
- Sessions are random tokens stored in the Sessions sheet with a 30-day expiry, checked on every admin call.
- Admin-only actions (`listOrders`, `updateOrder`, `listCustomers`, `savePrices`, `stats`, …) verify the caller's role on the server. A customer who edits the page in their browser still cannot run them.
- Order totals are **recalculated on the server** from the PriceList sheet. The price the browser sends is only used if an item cannot be found.
- Customer-supplied roles and prices are never trusted.
- Customer passwords are never returned to the browser (`listCustomers` strips them).
- Card details are never collected by this site. When you add Paystack or Flutterwave later, verify every payment on the server before marking an order Paid.

### Limits you should know about before launch

- Google Apps Script allows roughly **20,000 script runs per day** on a consumer account, and a single run should finish within a few minutes.
- Google Sheets handles concurrent writes with a script lock (used on registration and order creation), but it is **not** a database for high volume. It is fine for the launch phase; if you pass a few hundred orders a week, move to a real database.
- Keep the sheet private. Sharing it publicly exposes customer data.
- Download a copy of the sheet (**File → Make a copy** or **File → Download → .xlsx**) at least weekly as a backup.
- The Apps Script web app URL is public by nature. Do not put secrets in it, and do not rely on the URL being unguessable.

---

## 9. Adding online payments later

The booking flow already records `paymentStatus` and `paymentMethod` separately from the order status, so a gateway can be added without redesigning anything:

1. Choose a provider available in Nigeria (Paystack or Flutterwave).
2. Create a payment on the server (Apps Script), returning the provider's reference.
3. Add a verification call: on success, update the row's `paymentStatus` to `Paid` and log it in an audit row.
4. Only ever mark an order Paid from a **verified server-side** response — never from what the browser reports.

---

## 10. Notes for whoever maintains this

- No build step, no framework. Open any file and edit it.
- Every page loads `config.js → data.js → api.js → layout.js`, then one page script where needed.
- `layout.js` injects the header, footer and WhatsApp button so they exist in one place only.
- Prices used by the booking form come from `data.js` in demo mode and from the PriceList sheet in live mode.
- To add a page: copy an existing HTML file, change `<body data-page="...">`, add the link in `layout.js` (`NAV`) if it belongs in the menu.

See `docs/TESTING-CHECKLIST.md` before going live.
