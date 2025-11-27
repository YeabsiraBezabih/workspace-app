import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token");

  // Define protected routes
  const protectedRoutes = ["/table", "/team", "/create-organization", "/join-organization"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ["/sign-in", "/sign-up"];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/table", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/table/:path*",
    "/team/:path*",
    "/create-organization",
    "/join-organization",
    "/sign-in",
    "/sign-up",
  ],
};
