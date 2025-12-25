import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || session.role !== 'admin') {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 403 });
    }

    try {
        const allUsers = await db.select({
            id: users.id,
            email: users.email,
            fullName: users.fullName,
            role: users.role,
            isVerified: users.isVerified,
            createdAt: users.createdAt
        }).from(users).orderBy(desc(users.createdAt));

        return NextResponse.json(allUsers);
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to fetch users" }), { status: 500 });
    }
}
