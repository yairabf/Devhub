import type { Metadata } from "next";

import { AiSection } from "@/components/home/AiSection";
import { CtaSection } from "@/components/home/CtaSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { PricingSection } from "@/components/home/PricingSection";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteNav } from "@/components/home/SiteNav";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "DevHub — Stop Losing Your Developer Knowledge",
  description:
    "DevHub is a developer knowledge hub for code snippets, AI prompts, commands, notes, files, images and links — searchable from one place.",
};

/**
 * Marketing homepage. Public: a signed-in visitor is never redirected away, the nav
 * just points them at the dashboard instead of sign-up.
 */
export default async function Home() {
  const session = await auth();

  return (
    <div className="home-root min-h-screen bg-background">
      <SiteNav isSignedIn={Boolean(session?.user)} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AiSection />
        <PricingSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
