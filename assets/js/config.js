/* DIEMEZ CLEANS — site configuration
   ------------------------------------------------------------------
   Edit these values. Nothing else in the code needs to change.
   After you deploy the Google Apps Script backend, paste its
   "Web app URL" (ending in /exec) into apiUrl below.
   While apiUrl is empty the site runs in DEMO MODE and stores
   everything in the visitor's browser (localStorage).
   ------------------------------------------------------------------ */
window.DIEMEZ_CONFIG = {
  business: {
    name: "DIEMEZ CLEANS",
    descriptor: "Laundry, Cleaning & Painting Services",
    tagline: "We Clean. We Care. We Transform.",
    phone: "08129511794",
    phoneIntl: "+2348129511794",
    whatsapp: "2348129511794",
    email: "info.diemezcleans@gmail.com",
    address: "Agudama, close to Law School, Bayelsa State, Nigeria",
    hours: "Monday – Saturday, 8:00 AM – 6:00 PM",
    hoursShort: "Mon–Sat · 8:00 AM – 6:00 PM",
    city: "Bayelsa State, Nigeria",
    mapsQuery: "Agudama, close to Law School, Bayelsa State, Nigeria"
  },

  /* Google Apps Script web app URL, e.g.
     "https://script.google.com/macros/s/AKfycbwD88LQHNM-YfogJ0hX6J-bh8w_l6mfdx-eGxfaC9yaCkSZP6vAJVlDoIERZyDJqDH9/exec" */
  apiUrl: "",

  /* Shown on bookings + account pages */
  bank: {
    enabled: false,
    bankName: "",
    accountName: "",
    accountNumber: ""
  },

  /* Referral programme — turn on only when rewards are approved */
  referral: {
    enabled: true,
    rewardText: "Share your code — we confirm your reward once your friend's first order is completed."
  },

  /* First-order promotion — off until approved */
  firstOrderOffer: {
    enabled: false,
    percent: 20
  }
};
