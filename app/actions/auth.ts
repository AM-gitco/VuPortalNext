"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { users, pendingUsers, otpCodes, insertUserSchema, loginSchema, otpVerificationSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { redirect } from "next/navigation";

async function getSession() {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function signupAction(prevState: any, formData: FormData) {
    try {
        const rawData = Object.fromEntries(formData.entries());
        const validatedFields = insertUserSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return { success: false, error: validatedFields.error.flatten().fieldErrors };
        }

        const { email, username, password, fullName } = validatedFields.data;

        // Check existing user
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existingUser) {
            return { success: false, message: "User already exists with this email" };
        }

        const existingUsername = await db.query.users.findFirst({
            where: eq(users.username, username),
        });

        if (existingUsername) {
            return { success: false, message: "Username is already taken" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create pending user
        // Note: pendingUsers schema might need adjustment if it doesn't match insertUser schema exactly, 
        // but based on copy it should have username, fullName, email, password.
        await db.insert(pendingUsers).values({
            username,
            fullName,
            email,
            password: hashedPassword,
        });

        // Generate OTP
        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await db.insert(otpCodes).values({
            email,
            code,
            expiresAt,
        });

        console.log(`🔐 SIGNUP OTP for ${email}: ${code}`);

        return { success: true, message: "OTP sent", email };
    } catch (error: any) {
        console.error("Signup error:", error);
        return { success: false, message: "Internal server error" };
    }
}

export async function verifySignupAction(prevState: any, formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const code = formData.get("code") as string;

        const validation = otpVerificationSchema.safeParse({ email, code });
        if (!validation.success) {
            return { success: false, message: "Invalid input" };
        }

        // Verify OTP
        const validOtp = await db.query.otpCodes.findFirst({
            where: and(
                eq(otpCodes.email, email),
                eq(otpCodes.code, code),
                eq(otpCodes.isUsed, false),
                gt(otpCodes.expiresAt, new Date())
            ),
        });

        if (!validOtp) {
            return { success: false, message: "Invalid or expired code" };
        }

        // Get pending user
        const pendingUser = await db.query.pendingUsers.findFirst({
            where: eq(pendingUsers.email, email),
        });

        if (pendingUser) {
            // Move to users
            const [newUser] = await db.insert(users).values({
                username: pendingUser.username,
                fullName: pendingUser.fullName,
                email: pendingUser.email,
                password: pendingUser.password,
                role: "student",
                isVerified: true,
            }).returning();

            // Cleanup
            await db.update(otpCodes).set({ isUsed: true }).where(eq(otpCodes.id, validOtp.id));
            await db.delete(pendingUsers).where(eq(pendingUsers.email, email));

            // Create session
            const session = await getSession();
            session.userId = newUser.id;
            session.username = newUser.username;
            session.role = newUser.role;
            session.isLoggedIn = true;
            session.isVerified = true;
            await session.save();

            redirect("/dashboard");
        } else {
            return { success: false, message: "Registration record not found." };
        }

    } catch (error) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            throw error;
        }
        console.error("Verify Signup Error:", error);
        return { success: false, message: "Verification failed" };
    }
}

export async function verifyResetOtpAction(prevState: any, formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const code = formData.get("code") as string;

        // Verify OTP
        const validOtp = await db.query.otpCodes.findFirst({
            where: and(
                eq(otpCodes.email, email),
                eq(otpCodes.code, code),
                eq(otpCodes.isUsed, false),
                gt(otpCodes.expiresAt, new Date())
            ),
        });

        if (!validOtp) {
            return { success: false, message: "Invalid or expired code" };
        }

        // We DO NOT consume the OTP here, as it will be consumed by the Reset Password Action
        return { success: true, canResetPassword: true };

    } catch (error) {
        console.error("Verify Reset Error:", error);
        return { success: false, message: "Verification failed" };
    }
}

export async function resendOtpAction(prevState: any, formData: FormData) {
    try {
        const email = formData.get("email") as string;
        if (!email) return { success: false, message: "Email required" };

        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Invalidate old codes?
        // await db.delete(otpCodes).where(eq(otpCodes.email, email)); 
        // Better to just insert new one.

        await db.insert(otpCodes).values({
            email,
            code,
            expiresAt,
        });

        console.log(`🔐 RESEND OTP for ${email}: ${code}`);
        return { success: true, message: "OTP sent" };

    } catch (error) {
        console.error("Resend OTP Error:", error);
        return { success: false, message: "Failed to resend OTP" };
    }
}

export async function loginAction(prevState: any, formData: FormData) {
    try {
        const rawData = Object.fromEntries(formData.entries());
        const validation = loginSchema.safeParse(rawData);

        if (!validation.success) {
            return { success: false, message: "Invalid input" };
        }

        const { email, password } = validation.data;

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            return { success: false, message: "Invalid credentials" };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { success: false, message: "Invalid credentials" };
        }

        if (!user.isVerified) {
            // Logic to trigger OTP resend could go here
            return { success: false, message: "Account not verified", isVerified: false, email: user.email };
        }

        const session = await getSession();
        session.userId = user.id;
        session.username = user.username;
        session.role = user.role;
        session.isLoggedIn = true;
        session.isVerified = true;
        await session.save();

        redirect("/dashboard");
    } catch (error) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            throw error;
        }
        console.error("Login Error:", error);
        return { success: false, message: "Login failed" };
    }
}

export async function forgotPasswordAction(prevState: any, formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const validation = forgotPasswordSchema.safeParse({ email });

        if (!validation.success) {
            return { success: false, message: "Invalid email" };
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            // Should we reveal if user exists? Usually no for security, but for UX yes.
            // Let's return success even if not found to prevent enumeration, or message "If email exists..."
            // But current logic expects email return to switch view.
            // Let's mimic existing behavior: check user.
            return { success: false, message: "User not found" };
        }

        // Generate OTP
        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await db.insert(otpCodes).values({
            email,
            code,
            expiresAt,
        });

        console.log(`🔐 RESET PASSWORD OTP for ${email}: ${code}`);
        return { success: true, message: "Reset code sent", email };

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return { success: false, message: "Internal server error" };
    }
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
    try {
        const rawData = Object.fromEntries(formData.entries());
        const validation = resetPasswordSchema.safeParse(rawData);

        if (!validation.success) {
            return { success: false, message: "Invalid input" };
        }

        const { email, code, newPassword } = validation.data;

        // Verify and Consume OTP
        const validOtp = await db.query.otpCodes.findFirst({
            where: and(
                eq(otpCodes.email, email),
                eq(otpCodes.code, code),
                eq(otpCodes.isUsed, false),
                gt(otpCodes.expiresAt, new Date())
            ),
        });

        if (!validOtp) {
            return { success: false, message: "Invalid or expired code" };
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.email, email));

        // Consume OTP
        await db.update(otpCodes)
            .set({ isUsed: true })
            .where(eq(otpCodes.id, validOtp.id));

        return { success: true, message: "Password updated successfully" };

    } catch (error) {
        console.error("Reset Password Error:", error);
        return { success: false, message: "Internal server error" };
    }
}

export async function logoutAction() {
    const session = await getSession();
    session.destroy();
    redirect("/auth");
}
