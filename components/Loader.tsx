"use client";

import { useEffect, useState } from "react";

export default function Loader() {
  const [hide, setHide] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // fixed 1.5s: matches the progress-bar fill animation in globals.css
    const t = setTimeout(() => setHide(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hide) return;
    const t = setTimeout(() => setGone(true), 600); // match CSS fade-out
    return () => clearTimeout(t);
  }, [hide]);

  if (gone) return null;

  return (
    <div
      className="loader"
      data-hide={hide}
      role="status"
      aria-label="Loading"
    >
      <div className="fire" aria-hidden="true">
        <span className="fire-glow" />
        <span className="flame" />
        <span className="flame flame-mid" />
        <span className="flame flame-core" />
      </div>
      <span className="loader-word">firing</span>
      <div className="loader-bar" aria-hidden="true">
        <div className="loader-bar-fill" />
      </div>
    </div>
  );
}
