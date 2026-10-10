import type { Metadata } from "next";
import { FlowNav } from "../components/SiteChrome";
import { APPLY_CLOSED_MESSAGE, APPLY_OPEN, APPLY_SELECTION_MESSAGE } from "../event";

export const metadata: Metadata = {
  title: "inscripción · build 101",
  description: APPLY_OPEN
    ? "inscribite a build 101, la hackathon de IA más grande de uruguay: con tu equipo de 3 o solo, y te ayudamos a encontrar con quién construir."
    : `${APPLY_CLOSED_MESSAGE} ${APPLY_SELECTION_MESSAGE}`,
};

export default function InscripcionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FlowNav />
      <main className="flow-page">{children}</main>
    </>
  );
}
