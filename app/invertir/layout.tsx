import type { Metadata } from "next";
import { InvestmentShell } from "./ui";
import "./investing.css";

export const metadata: Metadata = {
  title: "la ronda · build 101",
  description: "Diez equipos. Un millón de dólares de juego. Invertí en lo que viene en build 101.",
  alternates: { canonical: "/invertir" },
  robots: { index: false, follow: false },
};

export default function InvestmentLayout({ children }: { children: React.ReactNode }) {
  return <InvestmentShell>{children}</InvestmentShell>;
}
