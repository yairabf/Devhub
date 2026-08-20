import type { Metadata } from "next";

import { AiSection } from "@/components/home/AiSection";
import { CtaSection } from "@/components/home/CtaSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { PricingSection } from "@/components/home/PricingSection";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteNav } from "@/components/home/SiteNav";
import { auth } from "@/auth";
import { isUserPro } from "@/lib/db/user";
import type { HomeViewer } from "@/lib/home-cta";

export const metadata: Metadata = {
  title: "DevHub — Stop Losing Your Developer Knowledge",
  description:
    "DevHub is a developer knowledge hub for code snippets, AI prompts, commands, notes, files, images and links — searchable from one place.",
};

/**
 * Marketing homepage. Public: a signed-in visitor is never redirected away, every
 * CTA just points them at the dashboard instead of sign-up. `isPro` is read from
 * the database because the JWT session carries only `user.id`.
 */
export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;
  const viewer: HomeViewer = {
    isSignedIn: Boolean(userId),
    isPro: userId ? await isUserPro(userId) : false,
  };

  return (
    <div className="home-root min-h-screen bg-background">
      <SiteNav viewer={viewer} />
      <main>
        <HeroSection viewer={viewer} />
        <FeaturesSection />
        <AiSection />
        <PricingSection viewer={viewer} />
        <CtaSection viewer={viewer} />
      </main>
      <SiteFooter viewer={viewer} />
    </div>
  );
}
