import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupFlow } from "../../components/SignupFlow";
import { APPLY_OPEN, APPLY_PATH, APPLY_URL } from "../../event";

export const metadata: Metadata = {
  title: "inscribí a tu equipo — build 101",
  alternates: { canonical: `${APPLY_URL}/equipo` },
};

export default function EquipoPage() {
  if (!APPLY_OPEN) redirect(APPLY_PATH);
  return <SignupFlow mode="team" />;
}
