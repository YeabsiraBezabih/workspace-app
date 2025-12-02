import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  console.log(`([LOG middleware] ========= Processing request: ${request.method} ${request.url})`);

  // Handle CORS preflight requests for all routes
  if (request.method === "OPTIONS") {
    console.log(`([LOG middleware] ========= Handling CORS preflight request`);
    const response = new Response(null, { status: 200 });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
    return response;
  }

  // Add CORS headers to all responses
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  response.headers.set("Access-Control-Allow-Credentials", "true");

  // Handle authentication logic for non-API routes
  if (!request.nextUrl.pathname.startsWith("/api")) {
    const sessionToken = request.cookies.get("better-auth.session_token");

    // Define protected routes
    const protectedRoutes = ["/table", "/team", "/create-organization", "/join-organization"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (isProtectedRoute && !sessionToken) {
      console.log(`([LOG middleware] ========= Redirecting to sign-in (protected route)`);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Redirect authenticated users away from auth pages
    const authRoutes = ["/sign-in", "/sign-up"];
    const isAuthRoute = authRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (isAuthRoute && sessionToken) {
      console.log(`([LOG middleware] ========= Redirecting to table (already authenticated)`);
      return NextResponse.redirect(new URL("/table", request.url));
    }
  }

  console.log(`([LOG middleware] ========= Request processed successfully`);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
