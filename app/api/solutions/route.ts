import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { solutions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

const solutionSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    solutionType: z.string().min(1, "Type is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    textContent: z.string().min(1, "Content is required"),
});

export async function GET() {
    try {
        const allSolutions = await db.select()
            .from(solutions)
            .orderBy(desc(solutions.createdAt));
        return NextResponse.json(allSolutions);
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to fetch solutions" }), { status: 500 });
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
        const data = solutionSchema.parse(body);

        const [newSolution] = await db.insert(solutions).values({
            userId: session.userId,
            ...data,
            helpfulVotes: 0,
            isApproved: false
        }).returning();

        return NextResponse.json(newSolution);
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to submit solution" }), { status: 500 });
    }
}
