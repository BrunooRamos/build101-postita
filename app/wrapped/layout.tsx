import type { Metadata } from "next";
import "./wrapped.css";

// /wrapped: el loop para la tele del cierre. Fuera del menú, del sitemap y de
// los buscadores.
export const metadata: Metadata = {
  title: "wrapped · build 101",
  description: "build 101 wrapped: los números de la hackathon, en vivo.",
  alternates: { canonical: "/wrapped" },
  robots: { index: false, follow: false },
};

export default function WrappedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
