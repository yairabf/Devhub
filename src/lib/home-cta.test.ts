import { describe, it, expect } from "vitest";

import {
  getClosingCta,
  getFooterColumns,
  getFreePlanCta,
  getHeroCta,
  getProPlanCta,
  PRO_UPGRADE_HREF,
  type HomeViewer,
} from "@/lib/home-cta";

const SIGNED_OUT: HomeViewer = { isSignedIn: false, isPro: false };
const FREE: HomeViewer = { isSignedIn: true, isPro: false };
const PRO: HomeViewer = { isSignedIn: true, isPro: true };

describe("getHeroCta", () => {
  it("sells a sign-up to a signed-out visitor", () => {
    expect(getHeroCta(SIGNED_OUT)).toEqual({
      href: "/register",
      label: "Get Started Free",
    });
  });

  it("sends any signed-in visitor to the dashboard", () => {
    expect(getHeroCta(FREE).href).toBe("/dashboard");
    expect(getHeroCta(PRO).href).toBe("/dashboard");
  });
});

describe("getClosingCta", () => {
  it("sells a sign-up to a signed-out visitor", () => {
    expect(getClosingCta(SIGNED_OUT)).toEqual({
      href: "/register",
      label: "Create Your Account",
    });
  });

  it("sends any signed-in visitor to the dashboard", () => {
    expect(getClosingCta(FREE).href).toBe("/dashboard");
    expect(getClosingCta(PRO).href).toBe("/dashboard");
  });
});

describe("getFreePlanCta", () => {
  it("sells a sign-up to a signed-out visitor", () => {
    expect(getFreePlanCta(SIGNED_OUT)).toEqual({
      href: "/register",
      label: "Get Started",
    });
  });

  it("sends a signed-in visitor to the dashboard — they already have this plan", () => {
    expect(getFreePlanCta(FREE).href).toBe("/dashboard");
    expect(getFreePlanCta(PRO).href).toBe("/dashboard");
  });
});

describe("getProPlanCta", () => {
  it("sells a sign-up to a signed-out visitor", () => {
    expect(getProPlanCta(SIGNED_OUT)).toEqual({
      href: "/register",
      label: "Go Pro",
    });
  });

  it("keeps the upgrade path for a signed-in free user", () => {
    expect(getProPlanCta(FREE)).toEqual({
      href: PRO_UPGRADE_HREF,
      label: "Go Pro",
    });
  });

  it("never points an already-signed-in user at the sign-up form", () => {
    expect(getProPlanCta(FREE).href).not.toBe("/register");
    expect(getProPlanCta(PRO).href).not.toBe("/register");
  });

  it("stops selling Pro to someone already on Pro", () => {
    expect(getProPlanCta(PRO)).toEqual({
      href: "/dashboard",
      label: "Open Dashboard",
    });
  });
});

describe("getFooterColumns", () => {
  it("offers sign-in and registration to a signed-out visitor", () => {
    const account = getFooterColumns(SIGNED_OUT)[1];

    expect(account.heading).toBe("Account");
    expect(account.links.map(l => l.href)).toEqual(["/sign-in", "/register"]);
  });

  it("collapses to a single dashboard link once signed in", () => {
    const account = getFooterColumns(FREE)[1];

    expect(account.links).toEqual([
      { href: "/dashboard", label: "Open Dashboard" },
    ]);
  });

  it("keeps the product column in both states", () => {
    for (const viewer of [SIGNED_OUT, FREE, PRO]) {
      const [product] = getFooterColumns(viewer);
      expect(product.heading).toBe("Product");
      expect(product.links.map(l => l.href)).toEqual(["#features", "#pricing"]);
    }
  });
});

describe("no CTA invites an authenticated visitor to register", () => {
  it("holds for every derivation on the page", () => {
    for (const viewer of [FREE, PRO]) {
      const hrefs = [
        getHeroCta(viewer).href,
        getClosingCta(viewer).href,
        getFreePlanCta(viewer).href,
        getProPlanCta(viewer).href,
        ...getFooterColumns(viewer).flatMap(c => c.links.map(l => l.href)),
      ];
      expect(hrefs).not.toContain("/register");
    }
  });
});
