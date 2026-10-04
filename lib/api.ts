import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        if (response.data && typeof response.data === "object" && "data" in response.data && "status" in response.data) {
            response.data = response.data.data;
        }
        return response;
    },
    async (error) => {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            await signOut({ redirect: false });
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
