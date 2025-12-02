import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const response = NextResponse.next();

    // Add CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: response.headers });
    }

    // For non-OPTIONS requests, continue with the response
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

    return response;
  }

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
    "/api/:path*",
    "/table/:path*",
    "/team/:path*",
    "/create-organization",
    "/join-organization",
    "/sign-in",
    "/sign-up",
  ],
};
