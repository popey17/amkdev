import { About } from "@/components/about/about";
import { TechMarquee } from "@/components/about/tech-marquee";
import { Contact } from "@/components/contact/contact";
import { ContactHashScroll } from "@/components/contact/contact-hash-scroll";
import { Hero } from "@/components/hero/hero";
import { SiteHeader } from "@/components/layout/site-header";
import { Projects } from "@/components/projects/projects";
import { CursorTrail } from "@/components/ui/cursor-trail";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { projects } from "@/data/projects";
import { techStack } from "@/data/tech-stack";

export default function Home() {
  return (
    <>
      <ContactHashScroll />
      <ScrollProgress />
      <SiteHeader />
      {/* Opaque and above the sticky footer, so scrolling to the end lifts it off like a curtain. */}
      <main className="relative z-10 rounded-b-[clamp(1.5rem,4vw,3rem)] border-b border-line bg-surface shadow-[0_2.5rem_5rem_-1rem_rgb(0_0_0/0.35)]">
        <Hero />
        <About />
        <TechMarquee items={techStack} />
        <Projects projects={projects} />
      </main>
      <Contact email={process.env.NEXT_PUBLIC_CONTACT_EMAIL} />
      <CursorTrail />
    </>
  );
}
