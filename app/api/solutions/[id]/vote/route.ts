import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { solutions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn) {
        return new NextResponse(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
    }

    try {
        const { id } = await params;
        const solutionId = parseInt(id);

        if (isNaN(solutionId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid ID" }), { status: 400 });
        }

        await db.update(solutions)
            .set({ helpfulVotes: sql`${solutions.helpfulVotes} + 1` })
            .where(eq(solutions.id, solutionId));

        return NextResponse.json({ message: "Voted" });
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to vote" }), { status: 500 });
    }
}
