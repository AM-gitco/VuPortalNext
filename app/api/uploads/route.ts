import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { uploads, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { writeFile } from "fs/promises";
import { join } from "path";
import { cwd } from "process";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
        return new NextResponse(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const subject = formData.get("subject") as string;
        const uploadType = formData.get("uploadType") as string;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const textContent = formData.get("textContent") as string;
        const externalLink = formData.get("externalLink") as string;

        let fileUrl = "";

        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Unique filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_"); // Sanitize
            const filename = `${uniqueSuffix}-${originalName}`;

            // Save to public/uploads
            const uploadDir = join(cwd(), "public", "uploads");
            const filepath = join(uploadDir, filename);

            await writeFile(filepath, buffer);
            fileUrl = `/uploads/${filename}`;
        }

        const [newUpload] = await db.insert(uploads).values({
            userId: session.userId,
            subject,
            uploadType,
            title,
            description: description || null,
            fileUrl: fileUrl || null,
            textContent: textContent || null,
            externalLink: externalLink || null,
            isApproved: false // Default to pending
        }).returning();

        return NextResponse.json(newUpload);

    } catch (error) {
        console.error("Upload error:", error);
        return new NextResponse(JSON.stringify({ message: "Failed to process upload" }), { status: 500 });
    }
}

export async function GET(request: Request) {
    // Get all approved community uploads
    try {
        const allUploads = await db.select()
            .from(uploads)
            .where(eq(uploads.isApproved, true))
            .orderBy(desc(uploads.createdAt));

        return NextResponse.json(allUploads);
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: "Failed to fetch uploads" }), { status: 500 });
    }
}
