// Stock ceramic-mug photos (Unsplash), stored in /public/images.
// Picked deterministically from a label so a given mug/shot always shows the
// same photo across the site.
const MUG_IMAGES = [
  "/images/mug-1.jpg",
  "/images/mug-2.jpg",
  "/images/mug-3.jpg",
  "/images/mug-4.jpg",
  "/images/mug-5.jpg",
  "/images/mug-6.jpg",
  "/images/mug-7.jpg",
  "/images/mug-8.jpg",
  "/images/mug-9.jpg",
  "/images/mug-10.jpg",
] as const;

export function pickMugImage(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
  }
  return MUG_IMAGES[Math.abs(h) % MUG_IMAGES.length];
}

export default MUG_IMAGES;
