import path from "path";
import { Font, StyleSheet } from "@react-pdf/renderer";

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

// Styles shared by invoices and labels so both documents look the same.
export const s = StyleSheet.create({
  page: { fontFamily: "DM Sans", fontSize: 10, color: INK, padding: 44 },
  row: { flexDirection: "row" },
  faint: { color: FAINT },
  kicker: { fontSize: 8, color: FAINT, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  bold: { fontWeight: 600 },
  th: { fontSize: 8, color: FAINT, textTransform: "uppercase", letterSpacing: 1, paddingVertical: 6 },
  td: { paddingVertical: 7 },
  line: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: RULE },
  item: { flex: 1 },
  num: { width: 70, textAlign: "right" },
});
