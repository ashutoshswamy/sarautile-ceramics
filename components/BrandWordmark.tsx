// Oversized "sarautile" under the footer. Each glyph is traced by a dotted
// stroke that marches continuously (animated stroke-dashoffset).
export default function BrandWordmark() {
  return (
    <section className="wordmark" aria-hidden="true">
      <svg
        className="wordmark__svg"
        viewBox="0 0 1000 200"
        preserveAspectRatio="xMidYMid meet"
      >
        <text
          className="wordmark__text"
          x="500"
          y="150"
          textAnchor="middle"
        >
          sarautile
        </text>
      </svg>
    </section>
  );
}
