import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GeistPixelCircle } from "geist/font/pixel";
import {
  CANONICAL_URL,
  SEO_DESCRIPTION,
  SEO_TITLE,
  SITE_NAME,
  SITE_URL,
} from "./event";
import { PointerSpot } from "./components/PointerSpot";
import "./globals.css";

// Tres roles: Geist Pixel (Circle) para titulares, Geist Sans para leer
// (texto, formularios) y Geist Mono para la voz "terminal" (wordmark, nav,
// labels, terminal, números).
// Variable fonts: sin `weight` se sirve el eje completo.
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  alternates: {
    canonical: CANONICAL_URL,
    languages: {
      "es-UY": CANONICAL_URL,
      "x-default": CANONICAL_URL,
    },
  },
  keywords: [
    "build 101",
    "hackathon uruguay",
    "hackathon montevideo",
    "hackathon 2026",
    "hackathon de ia",
    "hackathon inteligencia artificial uruguay",
    "producto de ia en un fin de semana",
    "builders uruguay",
    "product building montevideo",
  ],
  authors: [{ name: SITE_NAME, url: CANONICAL_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // La imagen OG/Twitter es app/opengraph-image.jpg (file convention, con su
  // .alt.txt); X/Twitter cae en og:image automáticamente.
  openGraph: {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    url: CANONICAL_URL,
    siteName: SITE_NAME,
    locale: "es_UY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
  },
  category: "event",
};

// El sitio es oscuro siempre: un solo themeColor, sin variante por sistema.
export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // Un solo tema: el color sale de los tokens del CSS, así que no hay script
    // de pre-paint, ni data-theme, ni riesgo de flash de tema equivocado.
    <html lang="es-UY" className={`${sans.variable} ${mono.variable} ${GeistPixelCircle.variable}`}>
      <body>
        {children}
        <PointerSpot />
      </body>
    </html>
  );
}
