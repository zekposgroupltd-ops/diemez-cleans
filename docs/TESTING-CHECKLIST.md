# DIEMEZ CLEANS — pre-launch testing checklist

Work through this on a phone as well as a desktop. Tick each line before you accept real orders.

## A. Pages and navigation

- [ ] Home, Services, Price list, Plans, Book pickup, Get a quote, FAQs, Contact, About all open with no errors.
- [ ] Every header link and footer link goes to the right page.
- [ ] The mobile menu opens, closes, and each link works.
- [ ] No page shows placeholder text like "Lorem" or a broken image.
- [ ] Phone numbers, WhatsApp and email links actually open the dialler, WhatsApp and mail app.

## B. Price list

- [ ] Every category tab shows the right items and rates.
- [ ] Shirts, trousers, suits, bedding and bulk all show correct figures.
- [ ] Bulk rates read "per kg" and "per cycle".
- [ ] Change one price in the admin dashboard, reload the price page, confirm the change appears.

## C. Booking

- [ ] Selecting quantities updates the summary total correctly.
- [ ] Switching the service option (wash → ironing → dry cleaning) updates the price for that item.
- [ ] Submitting with no items shows a clear message.
- [ ] Submitting with a short phone number shows a clear message.
- [ ] A valid booking returns a reference like `DC-ORD-2026-0001`.
- [ ] The saved booking appears in the admin Orders list with the correct items and total.
- [ ] Totals match what the page showed (server recalculation).
- [ ] Booking works as a guest, without an account.

## D. Accounts (no OTP)

- [ ] Register with a new phone number → lands on the dashboard.
- [ ] Register with a password under 8 characters → blocked with a message.
- [ ] Register with mismatched passwords → blocked.
- [ ] Registering the same phone number twice is refused.
- [ ] Log out, then log in with phone + password.
- [ ] Log in with email + password (where an email was saved).
- [ ] Wrong password shows "Phone number or password is incorrect."
- [ ] Dashboard shows the correct name; orders placed while signed in appear under My orders.
- [ ] Profile edits save and persist after reload.
- [ ] Password change requires the current password, then the new one works at login.

## E. Admin dashboard

- [ ] Logging in with a customer account is refused with "Administrator access only".
- [ ] Admin login shows the overview figures.
- [ ] Changing an order status saves and survives a reload.
- [ ] Changing a payment status to Paid increases Verified revenue.
- [ ] Quote requests arrive in the Quotes tab and their status can be changed.
- [ ] Plan requests arrive in Subscriptions and can be activated.
- [ ] Contact messages arrive in Messages.
- [ ] Customers tab lists registered customers, without passwords.
- [ ] Price list edits save and change the public price page.

## F. Installable app (PWA)

- [ ] The site loads over HTTPS.
- [ ] Chrome/Android offers "Install app"; the installed icon opens without browser chrome.
- [ ] iPhone Safari → Share → Add to Home Screen produces a working icon.
- [ ] Desktop Chrome/Edge install works and the window opens standalone.
- [ ] Turn off data/Wi-Fi: the app opens and shows the offline page or cached pages rather than a browser error.
- [ ] A booking submitted while offline shows an error, and does **not** appear to succeed.

## G. Backend and data

- [ ] Rows appear in the correct sheets: Users, Orders, Quotes, Subscriptions, Messages.
- [ ] The PriceList sheet has one row per item.
- [ ] Audit rows are written for new orders and status changes.
- [ ] Re-deploying the script does not wipe data (data lives in the sheet, not the script).
- [ ] A weekly backup copy of the spreadsheet has been made.
- [ ] The spreadsheet is **not** shared publicly.

## H. Before you tell customers

- [ ] The admin password in `Code.gs` is no longer the shipped default.
- [ ] `config.js` has your real phone, WhatsApp number, email and address.
- [ ] Instagram/Facebook/TikTok links are added only if the accounts exist.
- [ ] The Google Maps direction link points to your real location.
- [ ] Privacy policy, terms and refund policy have been read and approved by you.
- [ ] Referral reward wording is either approved or the programme is switched off.
- [ ] The first-order discount is either approved or left off.
- [ ] Plan prices have been checked against your real operating costs.
- [ ] Pickup and delivery fees and any minimum order are confirmed and applied.
- [ ] A staff member has been shown how to update order statuses from a phone.
