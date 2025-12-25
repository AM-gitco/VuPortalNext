import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { announcements } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || session.role !== 'admin') {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
    }

    try {
        // Admin sees all announcements including unapproved
        const allAnnouncements = await db.select()
            .from(announcements)
            .orderBy(desc(announcements.createdAt));

        return NextResponse.json(allAnnouncements);
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to fetch announcements" }), { status: 500 });
    }
}
