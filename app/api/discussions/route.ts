import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { discussions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

const discussionSchema = z.object({
    subject: z.string().optional(),
    content: z.string().min(1, "Discussion content is required"),
});

export async function GET() {
    try {
        const allDiscussions = await db.select().from(discussions).orderBy(desc(discussions.createdAt));
        return NextResponse.json(allDiscussions);
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to fetch discussions" }), { status: 500 });
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
        return new NextResponse(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { subject, content } = discussionSchema.parse(body);

        const [newDiscussion] = await db.insert(discussions).values({
            userId: session.userId,
            subject: subject || "General",
            content,
            likes: 0,
            isPublic: true,
        }).returning();

        return NextResponse.json(newDiscussion);
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to create discussion" }), { status: 500 });
    }
}
