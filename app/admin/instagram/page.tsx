import { Trash2 } from "lucide-react";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import SubmitButton from "@/components/admin/SubmitButton";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { addInstagramPost, deleteInstagramPost } from "./actions";

export default async function AdminInstagramPage() {
  const { data: posts } = await getSupabaseAdmin()
    .from("instagram_posts")
    .select("id, url, created_at")
    .order("created_at", { ascending: false })
    .returns<{ id: number; url: string; created_at: string }[]>();

  return (
    <div className="max-w-[560px]">
      <h1 className="display-2">Instagram</h1>
      <p className="lede text-[0.95rem] mt-2">
        Paste a post link after you share it. Shows up on the homepage right away.
      </p>

      <form action={addInstagramPost} className="flex gap-3 mt-8">
        <input
          name="url"
          required
          placeholder="https://www.instagram.com/p/..."
          className="field flex-1"
        />
        <SubmitButton>Add</SubmitButton>
      </form>

      <div className="flex flex-col mt-6">
        {(posts ?? []).map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 py-3 border-b border-rule text-sm"
          >
            <span className="text-ink truncate">{p.url}</span>
            <form
              action={deleteInstagramPost.bind(null, p.id)}
              className="ml-auto shrink-0"
            >
              <ConfirmSubmitButton
                confirmTitle="Remove this post?"
                confirmBody="It disappears from the homepage immediately."
                aria-label="Remove post"
                className="text-ink-faint cursor-pointer transition-colors hover:text-warn-ink disabled:opacity-60"
              >
                <Trash2 size={15} strokeWidth={1.8} />
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
        {(posts ?? []).length === 0 && (
          <p className="text-sm text-ink-faint py-3">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
