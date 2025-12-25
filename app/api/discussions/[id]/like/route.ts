import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { discussions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn) {
        return new NextResponse(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
    }

    try {
        const { id } = await params;
        const discussionId = parseInt(id);

        if (isNaN(discussionId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid ID" }), { status: 400 });
        }

        // Simple increment for now (user can like multiple times - ideally should track likes table)
        // schema.ts discussion has 'likes' column
        await db.update(discussions)
            .set({ likes: sql`${discussions.likes} + 1` })
            .where(eq(discussions.id, discussionId));

        return NextResponse.json({ message: "Liked" });
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to like discussion" }), { status: 500 });
    }
}
