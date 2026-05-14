export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  offer_price: number | null;
  images: string[];
  image?: string; // Legacy support
  sizes: { size: string; stock: number }[] | string[]; // Support both formats during migration
  stock: number;
  trending: boolean;
  featured: boolean;
  is_new: boolean;
  out_of_stock: boolean;
  tags: string[];
  isNew?: boolean;      // Legacy support
  isTrending?: boolean; // Legacy support
  isFeatured?: boolean; // Legacy support
  originalPrice?: number; // Legacy support
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  count: number;
};

const p = (folder: string, n: number) => `/products/${folder}/img-${n}.jpg`;

// ─── Generator: 1 product per image in folder ────────────────────────────────
function gen(
  prefix: string,
  cat: string,
  sub: string,
  folder: string,
  total: number,
  names: string[],
  prices: number[],
  sizes: string[],
  tags: string[]
): Product[] {
  return Array.from({ length: total }, (_, i) => {
    const n = i + 1;
    const name = names[i % names.length];
    const price = prices[i % prices.length];
    const hasOrig = i % 2 === 0;
    return {
      id: `${prefix}-${String(n).padStart(3, "0")}`,
      name,
      price,
      originalPrice: hasOrig ? price + 100 + (i % 3) * 50 : undefined,
      category: cat,
      subcategory: sub,
      image: p(folder, n),
      images: [p(folder, n)],
      sizes,
      isNew: n > total - 5,
      isTrending: n % 3 === 1,
      isFeatured: n % 5 === 0 || n === 1,
      description: `Premium ${cat} footwear. Available in your size. All India delivery — call 8838247446.`,
      tags,
    };
  });
}

// ─── SNEAKERS (23 images) ────────────────────────────────────────────────────
const sneakerNames = [
  "Baggy Street Classic", "GenZ Low-Top", "Urban Edge Sneaker", "Instagram Drop",
  "WhatsApp Exclusive", "New Season Kick", "Street Runner", "Fresh Drop",
  "Premium Court Shoe", "Casual Air Kick", "Bold Silhouette", "Lifestyle Trainer",
];
const sneakers = gen("snk","Sneakers","streetwear","first_prefer_sneakers",23,
  sneakerNames,[549,649,749,599,699,799],["7","8","9","10"],["sneakers","genz","streetwear"]);

// ─── WOMEN / LADIES (28 images) ──────────────────────────────────────────────
const ladiesNames = [
  "Soft Cushion Heel", "Girls Flip Fancy", "Ladies Premium Sandal", "Trendy Slip-On Flat",
  "Evening Glam Heel", "Summer Lifestyle Sandal", "Lifestyle Block Heel", "Rose Cushion",
  "Fancy Flip Flop", "Comfort Flat", "Bridal Sandal", "Daily Wear Flat",
  "Party Heels", "Casual Slip-On",
];
const ladies = gen("lad","Women","sandals","first_prefer_Ladies",28,
  ladiesNames,[329,399,449,499,549,599,699],["5","6","7","8"],["ladies","premium","fashion"]);

// ─── SLIDES (20 images) ──────────────────────────────────────────────────────
const slideNames = [
  "Flip Flop Elite", "Girls Slide Collection", "Slider Flops Premium", "Trending Drop",
  "WhatsApp Slide Edition", "Daily Comfort Slide", "GenZ Slide", "Summer Flip",
  "Premium Pool Slide", "Beach Slide",
];
const slides = gen("sld","Slides","flipflops","first_prefer_slides",20,
  slideNames,[299,329,399,449,499,599],["6","7","8","9","10"],["slides","flipflops","casual"]);

// ─── CROCS (6 images) ────────────────────────────────────────────────────────
const crocsNames = [
  "LiteRide Crocs", "Classic Crocs Vibe", "Crocs Limited Edition",
  "Crocs Premium", "Crocs Daily", "Crocs Comfort",
];
const crocs = gen("crc","Crocs","literide","first_prefer_crocks",6,
  crocsNames,[449,499,549,599],["7","8","9","10"],["crocs","comfort","casual"]);

// ─── FORMALS (6 images) ──────────────────────────────────────────────────────
const formalNames = [
  "Loafer Premium Edition", "Formal Match Collection", "Oxford Classic",
  "Derby Premium", "Loafer Lifestyle", "Formal Office Ready",
];
const formals = gen("frm","Formals","loafers","first_prefer_formals",6,
  formalNames,[699,799,899,999],["7","8","9","10"],["formals","loafers","office"]);

// ─── MEN / BOYS (21 images) ──────────────────────────────────────────────────
const mensNames = [
  "Bata V-Strap Premium", "Boys Water-Resistant Chappal", "New Models GenZ Sandal",
  "Offer Special Sandal", "Ultra Cushion Re-Stock", "Ultra Cushion Daily",
  "GenZ V-Strap", "Premium Daily Sandal", "Boys Casual Flip", "Men Sport Sandal",
  "Daily Comfort Chappal",
];
const mens = gen("men","Men","sandals","first_prefer_Mens&Boys",21,
  mensNames,[349,399,469,479,549],["7","8","9","10"],["mens","sandals","daily"]);

// ─── MERGED CATALOG ──────────────────────────────────────────────────────────
export const products: Product[] = [
  ...sneakers,
  ...ladies,
  ...slides,
  ...crocs,
  ...formals,
  ...mens,
];

export const categories: Category[] = [
  { id: "cat-snk", name: "Sneakers",          slug: "sneakers", image: p("first_prefer_sneakers", 1),    count: 23 },
  { id: "cat-lad", name: "Women's",            slug: "women",    image: p("first_prefer_Ladies", 24),     count: 28 },
  { id: "cat-sld", name: "Slides & Flips",     slug: "slides",   image: p("first_prefer_slides", 4),      count: 20 },
  { id: "cat-crc", name: "Crocs",              slug: "crocs",    image: p("first_prefer_crocks", 5),      count: 6  },
  { id: "cat-frm", name: "Formals & Loafers",  slug: "formals",  image: p("first_prefer_formals", 1),     count: 6  },
  { id: "cat-men", name: "Men's Footwear",     slug: "men",      image: p("first_prefer_Mens&Boys", 14),  count: 21 },
];

export const getFeatured    = () => products.filter((p) => p.isFeatured);
export const getTrending    = () => products.filter((p) => p.isTrending);
export const getNewArrivals = () => products.filter((p) => p.isNew);
export const getByCategory  = (cat: string) =>
  products.filter((p) => p.category.toLowerCase() === cat.toLowerCase());
export const getById        = (id: string) => products.find((p) => p.id === id);
