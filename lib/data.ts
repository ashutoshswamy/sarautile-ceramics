// Product catalog (mugs + glazes) now lives in Supabase - see lib/queries.ts.
// This file keeps the shared types plus static editorial copy that isn't
// catalog data (story, timeline, care, wholesale terms).

export type Glaze = {
  name: string;
  hex: string;
  desc: string;
  shot: string;
};

export type Mug = {
  slug: string;
  name: string;
  price: number;
  oz: number;
  note: string;
  left: string;
  photoLabel: string;
  categorySlug: string | null;
  glazes: Glaze[];
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
    title: "Forty mugs is a good day",
    body: "Thrown, trimmed the next morning, handles pulled the morning after that.",
    photoLabel: "wheel, wet hands",
  },
  {
    kicker: "The kiln",
    title: "Two firings, ten days apart",
    body: "Bisque low and slow, glaze up to 1240°C. Then we wait and hope.",
    photoLabel: "kiln door, packed",
  },
];

export const specs = [
  { k: "Holds", v: "12 oz / 350 ml to the rim" },
  { k: "Body", v: "Grey stoneware, fired to 1240°C" },
  { k: "Dishwasher", v: "Yes. Microwave too." },
  { k: "Weight", v: "About 340 g - varies a bit" },
  { k: "Made", v: "Kiln 41, August 2026, India" },
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
    body: "We have been asked about scaling up. We would rather make fewer mugs properly.",
  },
];

export const care = [
  {
    q: "Dishwasher?",
    verdict: "Yes",
    a: "Top or bottom shelf, both fine. The glaze will not fade. Give the handle room so it does not knock about.",
    tagBg: "var(--sage-bg)",
    tagFg: "var(--sage-ink)",
  },
  {
    q: "Microwave?",
    verdict: "Yes",
    a: "No metal in the clay or the glaze. It will get hot, as mugs do.",
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
  { k: "Minimum", v: "24 mugs per order" },
  { k: "Lead time", v: "6-8 weeks from deposit" },
  { k: "Trade price", v: "50% of retail, 24+" },
  { k: "Custom glaze", v: "Possible at 100+, adds 3 weeks" },
  { k: "Stamp", v: "Your mark on the base, no charge" },
];
