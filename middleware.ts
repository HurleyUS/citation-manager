import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth is handled by the app's own `/api/auth` + Convex session cookies.
 * Clerk was previously listed in middleware/package.json but never mounted
 * via ClerkProvider — removed to stop claiming a wired integration.
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
