import path from "path";
import { Font } from "@react-pdf/renderer";

const root = process.cwd();
Font.register({
  family: "DM Sans",
  fonts: [
    { src: path.join(root, "lib/fonts/DMSans-Regular.ttf") },
    { src: path.join(root, "lib/fonts/DMSans-SemiBold.ttf"), fontWeight: 600 },
  ],
});

export const LOGO = path.join(root, "public/logo-nobg.png");
export const INK = "#33243a";
export const FAINT = "#8a7d8f";
export const RULE = "#e7ddd6";
export const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
