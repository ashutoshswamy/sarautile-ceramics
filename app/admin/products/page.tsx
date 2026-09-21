import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import PlaceholderPhoto from "@/components/PlaceholderPhoto";
import { getProducts } from "@/lib/queries";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex items-start gap-4">
        <div>
          <h1 className="display-2">Products</h1>
          <p className="lede text-[0.95rem] mt-2">
            {products.length} in the catalog. Click one to edit price, stock, or copy.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary ml-auto shrink-0">
          <Plus size={16} strokeWidth={2} aria-hidden />
          New product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-ink-faint mt-8">
          Nothing in the catalog yet - add the first one.
        </p>
      ) : (
      <div className="mt-8 border border-rule rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-canvas text-left text-xs text-ink-faint uppercase tracking-wide">
              <th className="px-4 py-3 font-medium" />
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Left</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.slug} className="border-t border-rule">
                <td className="px-4 py-3">
                  <PlaceholderPhoto
                    label={product.photoLabel}
                    src={product.imageUrl}
                    rounded="rounded-lg"
                    className="w-11 h-11"
                    sizes="44px"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-ink">{product.name}</td>
                <td className="px-4 py-3 text-ink-soft">₹{product.price}</td>
                <td className="px-4 py-3 text-ink-soft">{product.left}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${product.slug}`}
                    className="link-arrow justify-end"
                  >
                    Edit <ChevronRight size={14} strokeWidth={1.8} aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
