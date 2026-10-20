import type { WrappedMetrics } from "@/lib/wrapped-types";
import metrics from "@/wrapped/metrics.json";
import { Wrapped } from "./Wrapped";

// Los números están cerrados: se leen de wrapped/metrics.json al compilar, sin
// fetch ni store. Para cambiarlos: `npm run metrics`, commit y deploy.
export default function WrappedPage() {
  return <Wrapped m={metrics as WrappedMetrics} />;
}
