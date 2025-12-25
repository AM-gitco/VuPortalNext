import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const setupSchema = z.object({
    degreeProgram: z.string().min(1),
    subjects: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
        return new NextResponse(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { degreeProgram, subjects } = setupSchema.parse(body);

        const [updatedUser] = await db.update(users)
            .set({ degreeProgram, subjects, isVerified: true })
            .where(eq(users.id, session.userId))
            .returning();

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Profile setup error:", error);
        return new NextResponse(JSON.stringify({ message: "Invalid request data" }), { status: 400 });
    }
}
