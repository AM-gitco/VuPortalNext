/**
 * API Query Functions
 * Centralized query functions for React Query
 */

const API_BASE = "";

export async function apiRequest(method: string, endpoint: string, data?: any) {
    const options: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    };

    if (data && (method === "POST" || method === "PATCH" || method === "PUT")) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response;
}

// Query Functions for useQuery hooks
export const queryFunctions = {
    // User uploads
    myUploads: async () => {
        const response = await apiRequest("GET", "/api/uploads/my");
        return response.json();
    },

    // All uploads (admin/public)
    allUploads: async () => {
        const response = await apiRequest("GET", "/api/uploads");
        return response.json();
    },

    // User discussions
    myDiscussions: async () => {
        const response = await apiRequest("GET", "/api/discussions/my");
        return response.json();
    },

    // All discussions
    allDiscussions: async () => {
        const response = await apiRequest("GET", "/api/discussions");
        return response.json();
    },

    // User badges
    myBadges: async () => {
        const response = await apiRequest("GET", "/api/badges/my");
        return response.json();
    },

    // Announcements
    announcements: async () => {
        const response = await apiRequest("GET", "/api/announcements");
        return response.json();
    },

    // All announcements (admin)
    allAnnouncements: async () => {
        const response = await apiRequest("GET", "/api/announcements/all");
        return response.json();
    },

    // Solutions
    allSolutions: async () => {
        const response = await apiRequest("GET", "/api/solutions");
        return response.json();
    },

    // User solutions
    mySolutions: async () => {
        const response = await apiRequest("GET", "/api/solutions/my");
        return response.json();
    },

    // Admin - Users
    adminUsers: async () => {
        const response = await apiRequest("GET", "/api/admin/users");
        return response.json();
    },

    // Subject stats
    subjectStats: async (subjectId: string) => {
        const response = await apiRequest("GET", `/api/subjects/${subjectId}/stats`);
        return response.json();
    },
};
