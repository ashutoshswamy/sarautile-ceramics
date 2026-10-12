// One-off: creates a Rs 1 product per image in ../ceramics/final (skips hero-*
// and slugs that already exist). Run: node --env-file=.env.local scripts/seed-products.mjs
import { readdir, readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const DIR = new URL("../../ceramics/final/", import.meta.url);
const WORDS = ["strawberry", "tumbler", "heart", "bowl", "bow", "cute", "dish", "evil", "eye", "love", "mug", "set", "tea", "you"];

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

const files = (await readdir(DIR)).filter((f) => f.endsWith(".png") && !f.startsWith("hero-")).sort();
for (const file of files) {
  const [, base, num] = file.match(/^([a-z]+?)(\d*)\.png$/);
  const label = [...words(base), ...(num ? [num] : [])].join(" ");
  const name = label.replace(/\b[a-z]/g, (c) => c.toUpperCase());
  const slug = label.replace(/ /g, "-");
  if (taken.has(slug)) { console.log("skip", slug); continue; }

  const path = `${slug}/${crypto.randomUUID()}.png`;
  const up = await sb.storage.from("product-images").upload(path, await readFile(new URL(file, DIR)), { contentType: "image/png" });
  if (up.error) throw new Error(`${file}: ${up.error.message}`);
  const image_url = sb.storage.from("product-images").getPublicUrl(path).data.publicUrl;

  const { error } = await sb.from("products").insert({
    slug, name, price: 1, left_count: 1, photo_label: label, image_url, stock_updated_by: "Seed script",
  });
  if (error) throw new Error(`${slug}: ${error.message}`);
  console.log("added", name);
}
