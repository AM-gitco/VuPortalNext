import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { solutions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
        return new NextResponse(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
    }

    try {
        const mySolutions = await db.select()
            .from(solutions)
            .where(eq(solutions.userId, session.userId))
            .orderBy(desc(solutions.createdAt));

        return NextResponse.json(mySolutions);
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to fetch your solutions" }), { status: 500 });
    }
}
