import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { announcements, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const announcementSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
});

export async function GET() {
    try {
        const allAnnouncements = await db.select()
            .from(announcements)
            .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
        return NextResponse.json(allAnnouncements);
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to fetch announcements" }), { status: 500 });
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
        return new NextResponse(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
    }

    // Verify admin role if needed, but for now we follow the frontend check or DB check
    // Ideally we check DB user role.
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
    });

    if (user?.role !== 'admin') {
        return new NextResponse(JSON.stringify({ message: "Unauthorized. Admin only." }), { status: 403 });
    }

    try {
        const body = await request.json();
        const { title, content } = announcementSchema.parse(body);

        const [newAnnouncement] = await db.insert(announcements).values({
            userId: session.userId,
            title,
            content,
            isApproved: true, // Auto-approve admin announcements
            isPinned: false
        }).returning();

        return NextResponse.json(newAnnouncement);
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Invalid request data" }), { status: 400 });
    }
}
