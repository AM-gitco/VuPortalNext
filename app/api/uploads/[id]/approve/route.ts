import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { uploads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || session.role !== 'admin') {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
    }

    try {
        const { id } = await params;
        const uploadId = parseInt(id);

        if (isNaN(uploadId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid ID" }), { status: 400 });
        }

        await db.update(uploads)
            .set({ isApproved: true })
            .where(eq(uploads.id, uploadId));

        return NextResponse.json({ message: "Upload approved" });
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to approve upload" }), { status: 500 });
    }
}
