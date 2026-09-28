import type { Metadata } from "next";
import { FlowNav } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "inscripción — build 101",
  description:
    "inscribite a build 101, la hackathon de ia más grande de uruguay: con tu equipo de 3 o solo, y te ayudamos a encontrar con quién construir.",
};

export default function InscripcionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FlowNav />
      <main className="flow-page">{children}</main>
    </>
  );
}
