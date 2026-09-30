import type { Metadata } from "next";
import Link from "next/link";
import { FlowNav } from "./components/SiteChrome";
import { PixelBlocks, PIXELS_SMALL } from "./components/PixelBlocks";
import { APPLY_PATH } from "./event";

export const metadata: Metadata = {
  title: "página no encontrada · build 101",
  robots: { index: false },
};

// 404 con la voz de la terminal: mismo marco de celdas que el resto del sitio.
export default function NotFound() {
  return (
    <>
      <FlowNav />
      <main className="wrap nf">
        <div className="nf-frame">
          <PixelBlocks id="px-404" cells={PIXELS_SMALL} cols={4} rows={4} className="nf-pixels" />
          <p className="mono-line">$ cd esta-pagina</p>
          <p className="nf-error">no such file or directory</p>
          <h1 className="h2 nf-code">404.</h1>
          <p className="lede">Esta página no existe o se movió. Lo que buscás seguro está en el inicio.</p>
          <div className="nf-actions">
            <Link href="/" className="btn btn-primary">
              volver al inicio →
            </Link>
            <Link href={APPLY_PATH} className="link-quiet">
              o inscribite
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
