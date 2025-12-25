import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploads, solutions, discussions } from "@/lib/db/schema";
import { eq, inArray, count, and } from "drizzle-orm";
import { z } from "zod";

const statsSchema = z.object({
    subjects: z.array(z.string()),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { subjects } = statsSchema.parse(body);

        if (subjects.length === 0) {
            return NextResponse.json({});
        }

        // We can run these in parallel
        const stats: Record<string, { resources: number; solutions: number; discussions: number }> = {};

        // Initialize mock stats
        subjects.forEach(s => {
            const subjectCode = s.split(" - ")[0]; // Handle "CS101 - Intro" format if needed, though usually stored as ID
            stats[s] = { resources: 0, solutions: 0, discussions: 0 };
        });

        // 1. Fetch counts in parallel
        const [uploadCounts, solutionCounts, discussionCounts] = await Promise.all([
            db.select({
                subject: uploads.subject,
                count: count(),
            })
                .from(uploads)
                .where(inArray(uploads.subject, subjects))
                .groupBy(uploads.subject),
            db.select({
                subject: solutions.subject,
                count: count(),
            })
                .from(solutions)
                .where(inArray(solutions.subject, subjects))
                .groupBy(solutions.subject),
            db.select({
                subject: discussions.subject,
                count: count(),
            })
                .from(discussions)
                .where(inArray(discussions.subject, subjects))
                .groupBy(discussions.subject)
        ]);

        // Merge results
        uploadCounts.forEach(row => {
            if (row.subject && stats[row.subject]) {
                stats[row.subject].resources = row.count;
            }
        });
        solutionCounts.forEach(row => {
            if (row.subject && stats[row.subject]) {
                stats[row.subject].solutions = row.count;
            }
        });
        discussionCounts.forEach(row => {
            if (row.subject && stats[row.subject]) {
                stats[row.subject].discussions = row.count;
            }
        });

        return NextResponse.json(stats);

    } catch (error) {
        console.error("Stats API Error:", error);
        return new NextResponse(JSON.stringify({ message: "Failed to fetch stats" }), { status: 500 });
    }
}
