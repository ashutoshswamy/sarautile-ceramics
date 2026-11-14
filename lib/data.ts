// Product catalog now lives in Supabase - see
// lib/queries.ts. This file keeps the shared types plus static editorial
// copy that isn't catalog data (care).

export type Product = {
  slug: string;
  name: string;
  price: number;
  setPrice: number | null;
  setSize: number;
  weight: string | null;
  left: string;
  stock: number;
  photoLabel: string;
  imageUrl: string | null;
  images: string[];
  categorySlug: string | null;
  description: string | null;
  createdAt: string;
};

export const care = [
  {
    q: "Dishwasher?",
    verdict: "Yes",
    a: "Top or bottom shelf, both fine. The glaze will not fade. Give handles and rims room so they do not knock about.",
    tagBg: "var(--sage-bg)",
    tagFg: "var(--sage-ink)",
  },
  {
    q: "Microwave?",
    verdict: "Yes",
    a: "No metal in the clay or the glaze. It will get hot, as stoneware does.",
    tagBg: "var(--sage-bg)",
    tagFg: "var(--sage-ink)",
  },
  {
    q: "Straight from the fridge to boiling water?",
    verdict: "Don’t",
    a: "Sudden temperature swings can crack stoneware. Rinse it warm first - that is all it needs.",
    tagBg: "var(--warn-bg)",
    tagFg: "var(--warn-ink)",
  },
  {
    q: "Tea staining in the crazing?",
    verdict: "Normal",
    a: "Fine lines in the glaze pick up colour over years. Most people come to like it; bicarb paste takes it back if you do not.",
    tagBg: "var(--neutral-bg)",
    tagFg: "var(--neutral-ink)",
  },
  {
    q: "The unglazed base scratches my table",
    verdict: "Fixable",
    a: "We sand every foot smooth, but stoneware is harder than wood. A felt pad sorts it forever.",
    tagBg: "var(--neutral-bg)",
    tagFg: "var(--neutral-ink)",
  },
];
