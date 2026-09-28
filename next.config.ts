import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acceder al dev server desde otros dispositivos de la red
  // (probar en el celu por Tailscale / LAN). Solo afecta a `next dev`.
  allowedDevOrigins: ["100.108.99.50", "192.168.1.8"],
  // <ViewTransition> de React: la tarjeta de inscripción se transforma en el
  // título del formulario al navegar (SignupPaths → SignupFlow).
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
