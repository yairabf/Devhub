import { FOOTER_PRODUCT_COLUMN } from "@/lib/home-content";

/**
 * Who is looking at the marketing page. Every CTA on it derives from this one
 * value: the page previously handed the session to `SiteNav` alone, so a
 * signed-in visitor was invited to create an account five times.
 */
export interface HomeViewer {
  isSignedIn: boolean;
  isPro: boolean;
}

export interface HomeCta {
  href: string;
  label: string;
}

export interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

const DASHBOARD_CTA: HomeCta = { href: "/dashboard", label: "Open Dashboard" };

/**
 * Where "Go Pro" sends a signed-in free user. There is no checkout in the app
 * yet, so this is an interim target — `/register` would drop an already
 * authenticated user onto a sign-up form, which is the bug this module exists
 * to fix. Change this one constant when billing lands.
 */
export const PRO_UPGRADE_HREF = "/settings";

/** Hero primary CTA. */
export function getHeroCta(viewer: HomeViewer): HomeCta {
  if (viewer.isSignedIn) return DASHBOARD_CTA;
  return { href: "/register", label: "Get Started Free" };
}

/** The closing CTA section at the bottom of the page. */
export function getClosingCta(viewer: HomeViewer): HomeCta {
  if (viewer.isSignedIn) return DASHBOARD_CTA;
  return { href: "/register", label: "Create Your Account" };
}

/** Free plan card. A signed-in visitor already has at least this plan. */
export function getFreePlanCta(viewer: HomeViewer): HomeCta {
  if (viewer.isSignedIn) return DASHBOARD_CTA;
  return { href: "/register", label: "Get Started" };
}

/**
 * Pro plan card. The upgrade path is preserved for a signed-in free user —
 * only a visitor who is already on Pro is sent to the dashboard instead.
 */
export function getProPlanCta(viewer: HomeViewer): HomeCta {
  if (!viewer.isSignedIn) return { href: "/register", label: "Go Pro" };
  if (viewer.isPro) return DASHBOARD_CTA;
  return { href: PRO_UPGRADE_HREF, label: "Go Pro" };
}

/** Footer auth links collapse to a single dashboard link once signed in. */
export function getFooterColumns(viewer: HomeViewer): FooterColumn[] {
  return [
    FOOTER_PRODUCT_COLUMN,
    {
      heading: "Account",
      links: viewer.isSignedIn
        ? [DASHBOARD_CTA]
        : [
            { label: "Sign in", href: "/sign-in" },
            { label: "Create account", href: "/register" },
          ],
    },
  ];
}
