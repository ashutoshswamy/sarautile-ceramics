// One-off: creates (or updates name/description of) a Rs 1 product per image in ../ceramics/final/webp (skips hero-*
// and slugs that already exist). Run: node --env-file=.env.local scripts/seed-products.mjs
import { readdir, readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const DIR = new URL("../../ceramics/final/webp/", import.meta.url);
const WORDS = ["strawberry", "tumbler", "heart", "bowl", "bow", "cute", "dish", "evil", "eye", "love", "mug", "set", "tea", "you"];

// slug -> [name, description]. Existing slugs get name/description updated.
const DETAILS = {
  "bow-mug": ["Bow & Hearts Mug", "A cream stoneware mug scattered with small red hearts, with a hand-sculpted pink bow on the front. Wide handle, easy to hold."],
  "bow-tumbler": ["Navy Bow Tumbler", "A tall lidded tumbler with a straw hole and a looped handle, hand-painted with navy blue bows. Made for slow iced coffees."],
  "bow-tumbler-2": ["Red Bow Tumbler", "The same tall lidded tumbler, hand-painted with red bows. Straw hole in the lid, sturdy looped handle."],
  "cute-bowl": ["Pink Bow Bowl", "A rounded cream bowl dotted with tiny pink spots and finished with a hand-sculpted pink bow."],
  "cute-bowl-2": ["Folk Hearts Bowl", "A cream bowl with a green rim, painted all around with red, navy and green folk-style hearts."],
  "cute-bowl-3": ["Pinstripe Bowl", "A glossy cream bowl with a navy rim and fine hand-painted vertical stripes. Plain and sharp."],
  "cute-bowl-4": ["Meadow Deer Bowl", "A wide, shallow bowl painted in blue with deer and wildflowers. Good for snacks, rice or trinkets."],
  "cute-dish": ["Scalloped Ribbon Dish", "A wavy-edged dish with a pink rim and a hand-drawn pink ribbon across the centre."],
  "cute-dish-2": ["Pink Lattice Dish", "A round dish with a blue rim, hand-painted with a pink lattice and tiny blue hearts."],
  "cute-dish-3": ["Daisy Pentagon Dish", "A five-sided dish painted with orange and yellow daisies. Holds rings, tea bags or a small sweet."],
  "cute-dish-4": ["Cherry Sprig Dish", "A five-sided dish painted with green cherry sprigs and small red dots."],
  "cute-mug": ["Pink Lattice Mug", "A round, rounded-belly mug hand-painted with a pink lattice and small blue hearts."],
  "cute-mug-2": ["Ribbon Line Mug", "A cream mug with a fine red line drawing of ribbons and diamonds. Quiet, and a little romantic."],
  "cute-mug-3": ["Heart Handle Mug", "A plain, straight-sided cream mug with a red heart-shaped handle. Comes with a wavy red saucer in the photo."],
  "cute-mug-4": ["Little Bows Mug", "A cream mug scattered with tiny red bows, with a soft pink bow where the handle meets the rim."],
  "cute-mug-5": ["Heart-Shaped Mug", "A mug shaped like a heart, with a pinched, wavy handle and small pink hearts pressed into the clay."],
  "cute-mug-6": ["Daisy Mug", "A cream mug hand-painted with big orange and yellow daisies."],
  "cute-mug-7": ["Cherry Mug", "A cream mug hand-painted with green cherry sprigs and red dots."],
  "evil-eye-mug": ["Nazar Mug", "A cream mug with a hand-painted blue evil eye and \"nazar na lage\" lettered underneath. For luck in every sip."],
  "heart-bowl": ["Heart Dot Bowl", "A low cream bowl with pink dots and two sculpted pink hearts on the side."],
  "heart-dish": ["Red Heart Dish", "A round white dish with a bold red heart in the middle and red dots scattered around it."],
  "heart-dish-2": ["Blush Heart Dish", "A round dish in soft blush pink glaze with a cream heart in the middle."],
  "heart-dish-3": ["Ruffle Red Dish", "A glossy red dish with a wavy ruffled edge and one small cream heart in the centre."],
  "heart-dish-4": ["Heart Trim Dish", "A deeper dish with red and peach hearts painted around the outside and a red heart inside."],
  "heart-dish-set": ["Heart Nesting Dishes", "Three dishes that stack inside each other, painted with red and peach hearts. Use them together or apart."],
  "heart-mug": ["Heart & Dots Mug", "A cream mug with a hand-painted red heart and a scatter of red dots, with a wide handle."],
  "heart-mug-2": ["Hearts All Over Mug", "A cream mug covered in rows of small red hearts, with a chunky handle."],
  "heart-mug-3": ["Red Heart Mug", "A straight-sided cream mug with one large brushed red heart and a few red dots."],
  "heart-mug-4": ["Raised Heart Mug", "A short, wide mug with a sculpted red heart you can feel under your thumb."],
  "heart-mug-5": ["Puffy Heart Cup", "A handleless cream cup with a glossy, sculpted red heart. Sits nicely in both hands."],
  "heart-mug-6": ["Blush Heart Mug", "A soft pink glazed mug with a cream heart on the side."],
  "heart-mug-7": ["Pink Stripe Pouch Mug", "A gathered, pouch-shaped mug with pink stripes and tiny red hearts. Looks soft, feels solid."],
  "heart-mug-8": ["Red Heart Handle Mug", "A glossy red mug with small white hearts and a heart-shaped handle."],
  "heart-mug-dish-set": ["Red Hearts Mug & Dish Set", "A cream mug covered in small red hearts, with a matching six-sided dish painted with a ring of red hearts."],
  "heart-mug-dish-set-2": ["Blush Heart Mug & Dish Set", "A soft pink mug and round dish, each with a cream heart in the middle."],
  "heart-mug-dish-set-3": ["Ruffle Red Mug & Dish Set", "A glossy red mug with a heart handle and a matching ruffled red dish."],
  "heart-mug-dish-set-4": ["Heart & Dots Mug & Dish Set", "A cream mug with a red heart and a small round dish with a heart and a ring of dots."],
  "love-you-mug": ["I Love You Mug", "A glossy red mug with raised cream lettering that says I love you. Heavy, bold and made to be given."],
  "strawberry-dish": ["Strawberry Ruffle Dish", "A wavy-edged dish with a red rim, painted with a strawberry and small pink flowers."],
  "strawberry-mug": ["Strawberry Mug", "A cream mug with a slightly uneven, hand-shaped body, painted with a strawberry and pink flowers."],
  "strawberry-mug-dish-set": ["Strawberry Mug & Dish Set", "A hand-shaped cream mug and a ruffled dish with a red rim, both painted with strawberries and pink flowers."],
  "tea-mug": ["Sukoon Mug", "A cream mug with Sukoon hand-lettered above a little orange chai cup. For a quiet cup of tea."],
  "tea-mug-2": ["Kadak Chai Mug", "A cream mug hand-lettered with a chai cup doodle in orange. Strong tea only."],
  "tea-mug-dish-set": ["Daisy Mug & Dish Set", "A cream mug with a five-sided dish, both painted with orange and yellow daisies."],
  "tea-mug-dish-set-2": ["Cherry Mug & Dish Set", "A cream mug and a five-sided dish painted with green cherry sprigs and red dots."],
  "tea-mug-dish-set-3": ["Ribbon Mug & Dish Set", "A cream mug and a wavy dish with a pink rim, drawn with fine red ribbons and diamonds."],
  "tea-mug-dish-set-4": ["Pink Lattice Mug & Dish Set", "A round mug and a round dish with a blue rim, hand-painted with a pink lattice and small blue hearts."],
};

// slug -> [price, setPrice?, setSize?] (setSize defaults to 6). Applied on insert and update.
const PRICES = {
  "bow-mug": [199, 379, 2],
  "bow-tumbler-2": [355],
  "cute-bowl": [399],
  "cute-bowl-2": [199, 379, 2],
  "cute-bowl-3": [199, 379, 2],
  "cute-bowl-4": [899],
  "cute-mug-4": [149, 799, 6],
  "cute-mug-5": [249],
  "evil-eye-mug": [175, 349, 2], // photo says "349 for 2"; single price is a guess
  "heart-bowl": [199],
  "heart-dish-set": [899],
  "heart-mug-4": [349],
  "heart-mug-7": [199, 379, 2], // photo says "Set of 2 379"; single price is a guess
  "heart-mug-8": [379],
  "heart-mug-dish-set": [279],
  "heart-mug-dish-set-2": [349],
  "heart-mug-dish-set-4": [349],
  "love-you-mug": [199],
  "strawberry-mug-dish-set": [349],
  "tea-mug-2": [169],
  "tea-mug-dish-set-3": [349],
  "tea-mug-dish-set-4": [279],
};
const priceFields = (slug) =>
  PRICES[slug] ? { price: PRICES[slug][0], set_price: PRICES[slug][1] ?? null, set_size: PRICES[slug][2] ?? 6 } : {};

function words(base) {
  const out = [];
  let rest = base;
  while (rest) {
    const w = WORDS.find((x) => rest.startsWith(x));
    if (!w) throw new Error(`Can't parse "${base}"`);
    out.push(w);
    rest = rest.slice(w.length);
  }
  return out;
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const { data: existing } = await sb.from("products").select("slug");
const taken = new Set((existing ?? []).map((p) => p.slug));

const files = (await readdir(DIR)).filter((f) => f.endsWith(".webp") && !f.startsWith("hero-")).sort();
for (const file of files) {
  const [, base, num] = file.match(/^([a-z]+?)(\d*)\.webp$/);
  const label = [...words(base), ...(num ? [num] : [])].join(" ");
  const slug = label.replace(/ /g, "-");
  const [name, description] = DETAILS[slug] ?? (() => { throw new Error(`No details for ${slug}`); })();
  if (taken.has(slug)) {
    const { error } = await sb.from("products").update({ name, description, photo_label: name.toLowerCase(), ...priceFields(slug) }).eq("slug", slug);
    if (error) throw new Error(`${slug}: ${error.message}`);
    console.log("updated", name);
    continue;
  }

  const path = `${slug}/${crypto.randomUUID()}.webp`;
  const up = await sb.storage.from("product-images").upload(path, await readFile(new URL(file, DIR)), { contentType: "image/webp" });
  if (up.error) throw new Error(`${file}: ${up.error.message}`);
  const image_url = sb.storage.from("product-images").getPublicUrl(path).data.publicUrl;

  const { error } = await sb.from("products").insert({
    slug, name, description, price: 1, left_count: 1, photo_label: name.toLowerCase(), image_url, stock_updated_by: "Seed script", ...priceFields(slug),
  });
  if (error) throw new Error(`${slug}: ${error.message}`);
  console.log("added", name);
}
