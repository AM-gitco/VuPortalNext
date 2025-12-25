import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { solutions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
        return new NextResponse(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
    }

    try {
        const { id } = await params;
        const solutionId = parseInt(id);

        if (isNaN(solutionId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid ID" }), { status: 400 });
        }

        const [existing] = await db.select().from(solutions).where(eq(solutions.id, solutionId));

        if (!existing) {
            return new NextResponse(JSON.stringify({ message: "Solution not found" }), { status: 404 });
        }

        if (existing.userId !== session.userId && session.role !== "admin") {
            return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
        }

        await db.delete(solutions).where(eq(solutions.id, solutionId));

        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to delete solution" }), { status: 500 });
    }
}
