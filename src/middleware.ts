import authConfig from "@/lib/auth/config";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { DEFAULT_LOGIN_REDIRECT } from "./lib/app-config";

const protectedRoutes = "/dashboard";
export const apiAuthPrefix = "/api/auth";
export const authRoutes = "/auth";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isProtectedRoute = nextUrl.pathname.startsWith(protectedRoutes);
  const isAuthRoute = nextUrl.pathname.startsWith(authRoutes);

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return null;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
