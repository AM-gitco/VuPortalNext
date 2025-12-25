import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "./lib/session";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define protected routes
    const isDashboardRoute = pathname.startsWith("/dashboard");
    const isAuthRoute = pathname.startsWith("/auth");

    // Get session
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    // 1. If user is NOT logged in and trying to access dashboard, redirect to auth
    if (isDashboardRoute && !session.isLoggedIn) {
        return NextResponse.redirect(new URL("/auth", request.url));
    }

    // 2. If user IS logged in and trying to access auth page, redirect to dashboard
    if (isAuthRoute && session.isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/auth/:path*",
    ],
};
