// Product catalog now lives in Supabase - see
// lib/queries.ts. This file keeps the shared types plus static editorial
// copy that isn't catalog data (story, timeline, care, wholesale terms).

export type Product = {
  slug: string;
  name: string;
  price: number;
  weight: string | null;
  left: string;
  photoLabel: string;
  imageUrl: string | null;
  images: string[];
  categorySlug: string | null;
};

export const storyBits = [
  {
    kicker: "The clay",
    title: "Grey stoneware, nothing clever",
    body: "One body, one supplier in Khurja, twelve years running. It takes a glaze honestly.",
    photoLabel: "clay bags in the corner",
  },
  {
    kicker: "The wheel",
    title: "Forty pieces is a good day",
    body: "Thrown, trimmed the next morning, handles and lips finished the morning after that.",
    photoLabel: "wheel, wet hands",
  },
  {
    kicker: "The kiln",
    title: "Two firings, ten days apart",
    body: "Bisque low and slow, glaze up to 1240°C. Then we wait and hope.",
    photoLabel: "kiln door, packed",
  },
];

export const timeline = [
  {
    year: "2019",
    title: "The workshop",
    body: "Six months of clearing out an old godown before we could put a wheel in it. The floor still slopes.",
  },
  {
    year: "2020",
    title: "Twenty mugs for a café in Udaipur",
    body: "Our first order. Took five weeks and we lost money on it, and it taught us the shape.",
  },
  {
    year: "2023",
    title: "Arjun starts mixing glazes",
    body: "Ember came out of a batch we nearly threw away. Now it is most of what we sell.",
  },
  {
    year: "2026",
    title: "Still two of us",
    body: "We have been asked about scaling up. We would rather make fewer pieces properly.",
  },
];

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

export const wholesaleFacts = [
  { k: "Minimum", v: "24 pieces per order" },
  { k: "Lead time", v: "6-8 weeks from deposit" },
  { k: "Trade price", v: "50% of retail, 24+" },
  { k: "Custom glaze", v: "Possible at 100+, adds 3 weeks" },
  { k: "Stamp", v: "Your mark on the base, no charge" },
];
