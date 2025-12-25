import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { uploads } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
        return new NextResponse(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
    }

    try {
        const myUploads = await db.select()
            .from(uploads)
            .where(eq(uploads.userId, session.userId))
            .orderBy(desc(uploads.createdAt));

        return NextResponse.json(myUploads);
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to fetch user uploads" }), { status: 500 });
    }
}
