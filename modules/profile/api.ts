import api from "@/lib/api";
import { ProfileResponse, ProfileUpdateRequest } from "./types";

export const getProfile = () => api.get<ProfileResponse>("/api/v1/profile").then((r) => r.data);
export const updateProfile = (data: ProfileUpdateRequest) => api.put<ProfileResponse>("/api/v1/profile", data).then((r) => r.data);
