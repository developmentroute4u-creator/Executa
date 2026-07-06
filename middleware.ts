import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth/login") || req.nextUrl.pathname.startsWith("/auth/register");

    // Payment success pages must be reachable immediately after PhonePe redirect,
    // before the session cookie fully hydrates. Guard is handled client-side.
    if (req.nextUrl.pathname.includes("/payment-success")) {
      return null;
    }

    if (isAuthPage) {
      // Always allow access to auth pages — even if already logged in.
      // Users must explicitly click through the sign-in page to reach their dashboard.
      return null;
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Role isolation: freelancers cannot access client pages and vice versa
    if (req.nextUrl.pathname.startsWith("/client") && token.role !== "client") {
      return NextResponse.redirect(new URL("/freelancer/workspace", req.url));
    }

    if (req.nextUrl.pathname.startsWith("/freelancer") && token.role !== "freelancer") {
      return NextResponse.redirect(new URL("/client/dashboard", req.url));
    }

    return null;
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle the logic
    },
  }
);

export const config = {
  matcher: ["/client/:path*", "/freelancer/:path*", "/auth/:path*"],
};
