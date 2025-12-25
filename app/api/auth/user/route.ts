import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
        return new NextResponse(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
    });

    if (!user) {
        return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 401 });
    }

    // Return user without sensitive data if needed, but schema usually returns all.
    // Ideally exclude password.
    const { password, ...safeUser } = user;

    return NextResponse.json(safeUser);
}
