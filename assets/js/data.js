/* DIEMEZ CLEANS — catalogue data used by the booking flow.
   These are starting rates. Once the Google Sheets backend is live,
   the price list is served from the PriceList sheet and editable in
   the admin dashboard. */
window.DIEMEZ_DATA = (function () {
  const KEY_LABELS = {
    wash: "Wash only",
    iron: "Iron only",
    washiron: "Wash & iron",
    dry: "Dry cleaning",
    express: "Express"
  };

  /* Row helper: R(name, includes, wash, iron, washiron, dry)  — null = service not offered for that item.
     Source: Orange Laundromat public price list (orangelaundromat.ng/pricing), checked 24 Oct 2026.
     DIEMEZ minimums (wash 500, iron 400, wash&iron 900, dry 500) are already met by every verified rate,
     so no rate was raised or lowered. Edit prices in the PriceList sheet / admin dashboard, not here. */
  const R = (name, includes, wash, iron, washiron, dry) => ({ name, includes, wash, iron, washiron, dry });
  const C4 = ["wash", "iron", "washiron", "dry"];

  const PRICE_GROUPS = [
    {
      id: "everyday", name: "Everyday Wear", cols: C4,
      rows: [
        R("Shirts (Regular)", "Shirt, Dress Shirt, Delta Shirt", 650, 1000, 1500, 2000),
        R("T-Shirts, Polo & Blouses", "T-shirt, Polo, Blouse", 650, 900, 1500, null),
        R("Trousers (Regular)", "Trousers, Plain Trousers, Chinos", 750, 1200, 1800, 2200),
        R("Jean", "Jean Trousers, Jean Jacket, Jean Gown, Jean Skirt", 1000, 1350, 2200, null),
        R("Shorts, Boxers & Underwear", "Shorts, Singlet, Camisole, Boxers, Pant, Bra, Under Slip, Bikini (2-piece), Socks", 600, 600, 1000, null),
        R("Skirts", "Skirt, Plain Skirt", 650, 900, 1500, 2000),
        R("Pleated Items", "Pleated Skirt, Pleated Day Dress", null, 1700, 2700, 3600),
        R("Sweaters & Cardigans", "Sweatshirt, Cardigan, Jumper, Sweater, Pullover, Hoodie, Joggers", 1100, 1100, 2200, 3300),
        R("Sportswear & Casual & Nightwear", "Tracksuit, Jersey, Twin Set, Pyjamas, Bathrobe, Jalabiya", 1100, 1500, 2600, 3200),
        R("Gowns (Basic)", "Day Dress, Plain Gown, Catsuit, Jumpsuit", 1000, 1350, 2300, null),
        R("Accessories", "Tie, Bow Tie, Scarf, Shawl, Muffler, Gele, Ipele and Iborun, Native Caps, Hat, Hijab, Baseball Cap, Belt, Handkerchief, Waistcoat, Lawyer's Bib, Lawyer's Collar, Academic Cap, Pillow case, Small Towel, Face Towel, Napkins, Table Cloth", 500, 600, 1000, 1300)
      ]
    },
    {
      id: "native", name: "Native Wear", cols: C4,
      rows: [
        R("Men Native Wear (All Styles)", "Buba and Sokoto (Ankara and Lace), Senator (2-piece), Kaftan, Niger Delta Attire, Trouser and Igbo Buba", 1300, 1800, 3100, 3840),
        R("Women Native Wear (Basic)", "Iro and Buba (without beads), Native Skirt & Blouse, Gown, Boubou, Panjabi Suit", 1300, 1650, 2900, null),
        R("Women Native Wear (Premium)", "Iro and Buba (3-piece), Iro and Buba (with beads), Lace Native Wear, Saree", null, 2000, null, 3500),
        R("Agbada (Complete Set)", "Agbada (2-piece), Agbada (3-piece)", 2160, 2880, 5040, 6000),
        R("Aso Oke & George", "Aso Oke (2-piece), Aso Oke (3-piece), George & Wrapper, Ishiagu", null, null, null, 6000)
      ]
    },
    {
      id: "formal", name: "Suits & Formal", cols: C4,
      rows: [
        R("Suits (2-Piece)", "2-piece Suit (Men/Women), Safari Suit", null, 2600, null, 4800),
        R("Suits (3-Piece)", "3-piece Suit (Men/Women)", null, 3300, null, 5600),
        R("Jackets, Blazers & Coats", "Jacket, Blazer, Short Coat, Sleeveless Jacket, Long Coat, Raincoat", null, 1900, null, 3400),
        R("Gowns & Blouse (Premium)", "Evening Dress/Dinner Gown (Plain), Bridesmaid Dress, Bridal Dress, Beaded Gown, Beaded Blouse, Beaded Skirt, Beaded Dress", null, 2200, null, 4700),
        R("Wedding Gowns", "Wedding Gown (Single or Multi-piece)", null, null, null, 27000),
        R("Women Premium Clothes", "Heavy Beaded Clothes", null, null, null, 5000),
        R("Leather & Suede", "Leather/Suede Jacket, Leather/Suede Trousers, Leather/Suede Gown", null, null, null, 4000),
        R("Professional Wear", "Lawyer's Robe, Academic Gown, Cassock, Chasuble, Overall", null, 2400, null, 4200)
      ]
    },
    {
      id: "children", name: "Children", cols: C4,
      rows: [
        R("Children Regular (less than 8 years)", "Shorts, shirts, gowns, trousers, jackets, blouse, cardigan", 600, 600, 900, 1200),
        R("Children Premium (less than 8 years)", "Shirts, shorts, gown, blouses, trousers, jackets, cardigan", 900, 900, 1200, 1500)
      ]
    },
    {
      id: "bedding", name: "Bedding & Home", cols: C4,
      rows: [
        R("Bed Sheets", "Bed Sheet", 1200, 1500, 2650, 3200),
        R("Blankets and Duvet Covers", "Blanket, Bedspread, Duvet Covers (Small / Medium / Large)", 1800, 1800, 3500, 3720),
        R("Duvets & Comforters (Small)", "Duvet (Single), Comforter (Single), Duvet Cover (Small)", 3000, 2500, 5000, null),
        R("Duvets & Comforters (Large)", "Duvet (Double/King), Comforter (Double/King)", 4800, 4000, 7000, null),
        R("Throw Pillow Case", "Cases only for throw pillow", 900, 650, 1550, 1900),
        R("Towels (Medium/Large)", "Medium Towel, Large Towel, XL Towel", 1350, null, null, 1800),
        R("Curtains & Drapes (Light)", "Curtains & Drapes", 2400, null, 3600, null),
        R("Curtains & Drapes (Heavy)", "Curtains & Drapes", 4800, 3600, 7500, null),
        R("Mat (Small)", "Foot / Door / Kitchen / Bathroom Mat", 3000, null, null, 4000),
        R("Mat (Medium)", "Foot / Door / Kitchen / Bathroom Mat", 4000, null, null, 5000),
        R("Mat (Large)", "Foot / Door / Kitchen / Bathroom Mat", 5000, null, null, 6000)
      ]
    },
    {
      id: "rugs", name: "Rugs", cols: C4,
      rows: [
        R("Rug: Cotton / Thick Fabric (Small)", "Cotton / Thick Fabric Rugs (Small)", 9000, null, null, 11500),
        R("Rug: Cotton / Thick Fabric (Large)", "Cotton / Thick Fabric Rugs (Large)", 14000, null, null, 17000),
        R("Rug: Synthetic / Faux Fur / Shaggy (Small)", "Up to ~5×7 ft", 7000, null, null, 9500),
        R("Rug: Synthetic / Faux Fur / Shaggy (Large)", "Above ~5×7 ft", 10000, null, null, 14000),
        R("Rug: Wool / Silk / Delicate (Small)", "Wool / Silk / Delicate Rugs (Small)", 20000, null, null, 22000),
        R("Rug: Wool / Silk / Delicate (Large)", "Wool / Silk / Delicate Rugs (Large)", 28000, null, null, 30000)
      ]
    },
    {
      id: "shoesbags", name: "Shoes & Bags", cols: C4,
      rows: [
        R("Sneakers (Standard Wash)", "Upper, Midsole, Bottom and Lace of the Sneakers", 4200, null, null, 5500),
        R("Sneakers (Deep Cleaning)", "Upper, Inside, Midsole, Bottom and Lace of the Sneakers", 6500, null, null, 7200),
        R("Spa Slippers", "Spa slippers", 1500, null, null, null),
        R("Children School Bag (Small)", "Children School Bags / Lunch Boxes", 3000, null, null, 4000),
        R("Children School Bag (Medium)", "Children School Bags / Lunch Boxes", 4000, null, null, 5000),
        R("Children School Bag (Large)", "Children School Bags / Lunch Boxes", 5000, null, null, 6000),
        R("Travelling Bag (Small)", "Travelling bags", 3800, null, null, null),
        R("Travelling Bag (Medium)", "Travelling bags", 5800, null, null, null),
        R("Travelling Bag (Large)", "Travelling bags", 6800, null, null, null),
        R("Box (Small)", "Travelling boxes", 4000, null, null, null),
        R("Box (Medium)", "Travelling boxes", 5600, null, null, null),
        R("Box (Large)", "Travelling boxes", 7000, null, null, null)
      ]
    },
    {
      id: "bulk", name: "Bulk Laundry", cols: [],
      rows: [
        { name: "Laundry by weight (per kg)", includes: "Pay per kg", flat: 1200, unit: "kg" },
        { name: "Wash cycle (25 kg load)", includes: "Pay per wash cycle", flat: 15000, unit: "cycle" }
      ]
    }
  ];

  /* Monthly plans — structure follows the Orange Laundromat plan ladder (orangelaundromat.ng/plans).
     Allowances are the reference values; the DIEMEZ owner must approve before launch.
     cats = categories added at that tier (each tier also covers everything in the tier before it). */
  const P = (id, name, price, desc, o) => Object.assign({ id, name, price, cadence: "/ month", summary: desc }, o);
  const PLANS = [
    P("basic", "Basic", 30000, "Ideal for individuals with light laundry needs who want basic cleaning and ironing for everyday clothing.", {
      clothing: 30, wash: 30, iron: 15, dry: 0, express: 0, semi: 0, requests: 2,
      cats: ["Gowns (Basic)", "Sportswear & Casual & Nightwear", "Accessories", "T-Shirts, Polo & Blouses", "Trousers (Regular)", "Jean", "Shirts (Regular)", "Shorts, Boxers & Underwear", "Skirts"], inherits: ""
    }),
    P("basic-plus", "Basic Plus", 40000, "Same everyday coverage as Basic with every item ironed, plus sweaters and cardigans.", {
      clothing: 30, wash: 30, iron: 30, dry: 0, express: 0, semi: 0, requests: 2,
      cats: ["Sweaters & Cardigans"], inherits: "Basic"
    }),
    P("standard", "Standard", 50000, "For families or working professionals needing regular care for everyday and occasional premium garments.", {
      clothing: 50, wash: 50, iron: 25, dry: 5, express: 1, semi: 1, requests: 3, featured: true,
      cats: ["Women Native Wear (Basic)", "Pleated Items", "Jackets, Blazers & Coats", "Men Native Wear (All Styles)", "Blankets and Duvet Covers", "Suits (2-Piece)"], inherits: "Basic Plus"
    }),
    P("standard-plus", "Standard Plus", 65000, "Standard coverage with every item ironed — for households that want a crisp finish every time.", {
      clothing: 50, wash: 50, iron: 50, dry: 5, express: 1, semi: 1, requests: 3,
      cats: [], inherits: "Standard"
    }),
    P("premium", "Premium", 80000, "Comprehensive plan for premium wardrobes or larger household laundry, with dry cleaning and specialty garments.", {
      clothing: 80, wash: 80, iron: 40, dry: 10, express: 2, semi: 1, requests: 4,
      cats: ["Children Regular (less than 8 years)", "Agbada (Complete Set)", "Leather & Suede", "Women Native Wear (Premium)", "Aso Oke & George", "Suits (3-Piece)"], inherits: "Standard Plus"
    }),
    P("premium-plus", "Premium Plus", 110000, "Premium coverage with every item ironed — the full-service plan for larger households.", {
      clothing: 80, wash: 80, iron: 80, dry: 10, express: 2, semi: 1, requests: 4,
      cats: [], inherits: "Premium"
    })
  ];

  /* Turn the allowance numbers into the bullet list shown on each plan card */
  PLANS.forEach((p) => {
    const l = [
      "Covered " + p.clothing + " clothing items",
      "Washing covered — " + p.wash + " clothing items",
      "Ironing covered — " + p.iron + " clothing items"
    ];
    if (p.dry) l.push("Dry cleaning covered — " + p.dry + " clothing items");
    l.push("Free pickup and free delivery");
    if (p.express) l.push("Enjoy " + p.express + (p.express === 1 ? " time" : " times") + " express service of your laundry items");
    if (p.semi) l.push("Enjoy " + p.semi + " time semi-express service of your laundry items");
    l.push("Covered " + p.requests + " laundry requests in a month");
    p.items = l;
  });

  const ORDER_STATUSES = [
    "Pending Confirmation",
    "Confirmed",
    "Pickup Scheduled",
    "Picked Up",
    "Processing",
    "Ready",
    "Out for Delivery",
    "Delivered",
    "Cancelled"
  ];

  const PAYMENT_STATUSES = ["Unpaid", "Pending verification", "Paid", "Refunded"];

  const TIME_SLOTS = [
    "8:00 AM – 10:00 AM",
    "10:00 AM – 12:00 PM",
    "12:00 PM – 2:00 PM",
    "2:00 PM – 4:00 PM",
    "4:00 PM – 6:00 PM"
  ];

  const SERVICE_AREAS = [
    "Agudama",
    "Yenagoa",
    "Kpansia",
    "Ekeki",
    "Ovom",
    "Akenfa",
    "Opolo",
    "Igbogene",
    "Other (state in notes)"
  ];

  const SERVICES = [
    {
      id: "laundry",
      name: "Laundry",
      blurb: "Everyday washing, wash & fold, ironing, dry cleaning and household fabrics — collected, cared for and returned.",
      items: [
        { name: "Clothes Washing", desc: "Professional washing of everyday clothing and suitable garments." },
        { name: "Wash & Fold", desc: "Washed, dried where appropriate, folded and prepared for collection or delivery." },
        { name: "Ironing & Pressing", desc: "Neatly pressed garments for work, events and everyday wear." },
        { name: "Dry Cleaning", desc: "Specialised cleaning for garments that need an appropriate dry-cleaning process." },
        { name: "Bedding & Household", desc: "Bedsheets, pillowcases, duvets, blankets and other accepted household fabrics." },
        { name: "Express Laundry", desc: "Priority processing for eligible items, subject to confirmed capacity and an approved express rate." },
        { name: "Bulk & Commercial", desc: "Laundry for businesses, institutions and larger loads, on agreed quantities and turnaround." }
      ]
    },
    {
      id: "cleaning",
      name: "Cleaning",
      blurb: "Domestic, commercial and scheduled home cleaning carried out with care, order and consistency.",
      items: [
        { name: "Domestic Cleaning", desc: "Cleaning of residential spaces, including living areas and household surfaces." },
        { name: "Home Cleaning", desc: "Scheduled cleaning for customers who need regular help maintaining a clean home." },
        { name: "Industrial & Commercial", desc: "Cleaning for eligible commercial, institutional and industrial premises." }
      ]
    },
    {
      id: "painting",
      name: "Painting & Interior Finishing",
      blurb: "Interior and exterior painting and finishing work, scoped and quoted per project.",
      items: [
        { name: "Painting Services", desc: "Interior and exterior painting, scoped to the confirmed project requirements." },
        { name: "Interior Finishing", desc: "Finishing work for residential and commercial spaces, based on the work we are equipped to undertake." }
      ]
    }
  ];

  return { KEY_LABELS, PRICE_GROUPS, PLANS, ORDER_STATUSES, PAYMENT_STATUSES, TIME_SLOTS, SERVICE_AREAS, SERVICES };
})();
