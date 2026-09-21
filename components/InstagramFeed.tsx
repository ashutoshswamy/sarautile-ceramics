"use client";

import { useEffect } from "react";
import { Camera } from "lucide-react";
import type { InstagramPost } from "@/lib/queries";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

// Renders Instagram's own oEmbed widget per post - the post's live content
// (caption, likes) and the click-through to instagram.com are both built
// into that widget, nothing custom to wire up. New posts show up here as
// soon as they're added in /admin/instagram; Instagram doesn't offer a way
// to detect them automatically without a Meta developer app + access token.
export default function InstagramFeed({ posts }: { posts: InstagramPost[] }) {
  useEffect(() => {
    if (posts.length === 0) return;

    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }
    const existing = document.getElementById("instagram-embed-script");
    if (existing) return;

    const script = document.createElement("script");
    script.id = "instagram-embed-script";
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, [posts]);

  if (posts.length === 0) return null;

  return (
    <section className="container-x section-tight rise">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="display-2">From the workshop</h2>
        <a
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on Instagram"
          className="ml-auto shrink-0 grid place-items-center w-9 h-9 rounded-full border border-rule-strong text-ink transition-colors hover:border-ink"
        >
          <Camera size={16} strokeWidth={1.6} />
        </a>
      </div>

      <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {posts.map((post) => (
          <div key={post.id} className="w-[320px] shrink-0 snap-start">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={post.url}
              data-instgrm-version="14"
              style={{ margin: 0 }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
