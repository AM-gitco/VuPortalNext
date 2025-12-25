import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { discussions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
        return new NextResponse(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
    }

    try {
        const { id } = await params;
        const discussionId = parseInt(id);

        if (isNaN(discussionId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid ID" }), { status: 400 });
        }

        // Verify ownership
        const [existing] = await db.select().from(discussions).where(eq(discussions.id, discussionId));

        if (!existing) {
            return new NextResponse(JSON.stringify({ message: "Discussion not found" }), { status: 404 });
        }

        if (existing.userId !== session.userId && session.role !== "admin") {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
        }

        await db.delete(discussions).where(eq(discussions.id, discussionId));

        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to delete discussion" }), { status: 500 });
    }
}
