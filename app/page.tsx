import { ScrollProgress } from "./components/ScrollProgress";
import { Hero } from "./components/Hero";
import { EventSection } from "./components/EventSection";
import { PressSection } from "./components/Press";
import { Recap } from "./components/Recap";
import { Founders } from "./components/Founders";
import { Sponsors } from "./components/Sponsors";
import { Mentors } from "./components/Mentors";
import { Jury } from "./components/Jury";
import { FAQ } from "./components/FAQ";
import { SiteFooter, SiteNav } from "./components/SiteChrome";
import { WrappedBanner } from "./components/WrappedBanner";
import { FollowSection } from "./components/Socials";
import { KonamiMatrix } from "./components/KonamiMatrix";
import { DeployFX } from "./components/DeployFX";
import { FakeCrash } from "./components/FakeCrash";
import { StructuredData } from "./components/StructuredData";

export default function Home() {
  return (
    <>
      <StructuredData />
      <ScrollProgress />
      <KonamiMatrix />
      <DeployFX />
      <FakeCrash />

      <WrappedBanner />
      <SiteNav />

      <main>
        <Hero />
        <EventSection />
        <PressSection />
        <Recap />
        <Jury />
        <Sponsors />
        <Founders />
        <Mentors />
        <FAQ />

        <FollowSection />
      </main>

      <SiteFooter />
    </>
  );
}
