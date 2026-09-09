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
  glazes: Glaze[];
};

const SARAUTILE_GLAZES: Glaze[] = [
  {
    name: "Ember",
    hex: "#c67139",
    desc: "rusty, pools dark in the ridges",
    shot: "mug - ember glaze, 3/4 view",
  },
  {
    name: "Bracken",
    hex: "#7a8a5e",
    desc: "dry sage, matte where it thins",
    shot: "mug - bracken glaze, 3/4 view",
  },
  {
    name: "Oat Milk",
    hex: "#eee7db",
    desc: "soft off-white, speckled",
    shot: "mug - oat milk glaze, 3/4 view",
  },
  {
    name: "Salt Ash",
    hex: "#82796a",
    desc: "grey-brown, wood-fired look",
    shot: "mug - salt ash glaze, 3/4 view",
  },
];

export const mugs: Mug[] = [
  {
    slug: "sarautile-mug",
    name: "The Sarautile Mug",
    price: 1150,
    oz: 12,
    note: "12 oz, wheel-thrown",
    left: "4 left",
    photoLabel: "ember mug",
    glazes: SARAUTILE_GLAZES,
  },
  {
    slug: "bracken-mug",
    name: "Bracken",
    price: 1150,
    oz: 12,
    note: "12 oz, wheel-thrown",
    left: "6 left",
    photoLabel: "bracken mug",
    glazes: [SARAUTILE_GLAZES[1]],
  },
  {
    slug: "oat-milk-mug",
    name: "Oat Milk",
    price: 1050,
    oz: 8,
    note: "8 oz, speckled body",
    left: "2 left",
    photoLabel: "oat milk mug",
    glazes: [SARAUTILE_GLAZES[2]],
  },
  {
    slug: "salt-ash-mug",
    name: "Salt Ash",
    price: 1250,
    oz: 12,
    note: "12 oz, heavy base",
    left: "3 left",
    photoLabel: "salt ash mug",
    glazes: [SARAUTILE_GLAZES[3]],
  },
  {
    slug: "ember-tall-mug",
    name: "Ember Tall",
    price: 1350,
    oz: 14,
    note: "14 oz, for tea drinkers",
    left: "5 left",
    photoLabel: "ember tall mug",
    glazes: [SARAUTILE_GLAZES[0]],
  },
  {
    slug: "fieldstone-mug",
    name: "Fieldstone",
    price: 1050,
    oz: 10,
    note: "10 oz, unglazed foot",
    left: "7 left",
    photoLabel: "fieldstone mug",
    glazes: [{ name: "Fieldstone", hex: "#c0b6a5", desc: "pale stone, unglazed foot", shot: "mug - fieldstone glaze, 3/4 view" }],
  },
  {
    slug: "bracken-low-mug",
    name: "Bracken Low",
    price: 950,
    oz: 8,
    note: "8 oz, wide rim",
    left: "4 left",
    photoLabel: "bracken low mug",
    glazes: [SARAUTILE_GLAZES[1]],
  },
  {
    slug: "milk-tooth-mug",
    name: "Milk Tooth",
    price: 1050,
    oz: 10,
    note: "10 oz, glossy inside",
    left: "1 left",
    photoLabel: "milk tooth mug",
    glazes: [SARAUTILE_GLAZES[2]],
  },
  {
    slug: "seconds-shelf-mug",
    name: "Seconds",
    price: 550,
    oz: 10,
    note: "wonky, perfectly usable",
    left: "9 left",
    photoLabel: "seconds shelf mug",
    glazes: [{ name: "Mixed", hex: "#c0b6a5", desc: "whatever came off the shelf", shot: "seconds shelf mug" }],
  },
];

export const featuredMugs = mugs.slice(0, 4);

export const glazeFilters = [
  { name: "Ember", hex: "#c67139", count: 4 },
  { name: "Bracken", hex: "#7a8a5e", count: 3 },
  { name: "Oat Milk", hex: "#eee7db", count: 2 },
  { name: "Salt Ash", hex: "#82796a", count: 2 },
  { name: "Fieldstone", hex: "#c0b6a5", count: 1 },
];

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

export function findMug(slug: string): Mug | undefined {
  return mugs.find((m) => m.slug === slug);
}
