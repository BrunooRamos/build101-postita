import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupFlow } from "../../components/SignupFlow";
import { APPLY_OPEN, APPLY_PATH, APPLY_URL } from "../../event";

export const metadata: Metadata = {
  title: "busco equipo · build 101",
  alternates: { canonical: `${APPLY_URL}/solo` },
};

export default function SoloPage() {
  if (!APPLY_OPEN) redirect(APPLY_PATH);
  return <SignupFlow mode="solo" />;
}
