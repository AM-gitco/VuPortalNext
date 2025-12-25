import { SessionOptions } from "iron-session";

export interface SessionData {
    userId?: number;
    username?: string;
    role?: string;
    isLoggedIn: boolean;
    isVerified?: boolean;
}

export const defaultSession: SessionData = {
    isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_PASSWORD || "complex_password_at_least_32_characters_long",
    cookieName: "vu_auth_portal_session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
};
