import { auth } from "@/auth";
import authConfig from "@/auth.config";

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/items"];

export const proxy = auth((req) => {
  const isProtected = PROTECTED_PREFIXES.some((p) =>
    req.nextUrl.pathname.startsWith(p),
  );
  if (!req.auth && isProtected) {
    const signInUrl = new URL(authConfig.pages.signIn, req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/items/:path*"],
};
