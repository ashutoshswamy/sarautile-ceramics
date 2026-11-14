import { getCollectionsWithProducts, getProducts } from "@/lib/queries";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

// Plain-text site map for AI assistants (llms.txt convention).
export async function GET() {
  const [products, collections] = await Promise.all([
    getProducts().catch(() => []),
    getCollectionsWithProducts().catch(() => []),
  ]);
  const body = [
    `# ${SITE_NAME}`,
    "",
    "> Handmade wheel-thrown stoneware from India - mugs, bowls, plates and vases, glazed in five colours mixed by hand and fired twice. Made in small batches; prices in INR.",
    "",
    "## Pages",
    `- [Shop all](${SITE_URL}/products): every piece in stock`,
    `- [Our story](${SITE_URL}/story): who makes the pottery and how`,
    `- [Care guide](${SITE_URL}/care): looking after handmade stoneware`,
    "",
    "## Collections",
    ...collections.map((c) => `- [${c.name}](${SITE_URL}/collections/${c.slug})`),
    "",
    "## Products",
    ...products.map((p) => `- [${p.name}](${SITE_URL}/products/${p.slug}): ₹${p.price}`),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
