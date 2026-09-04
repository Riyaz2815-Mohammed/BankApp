import api from "@/lib/api";
import { Account, AccountRequest } from "./types";

export const getAccounts = () => api.get<Account[]>("/api/accounts").then((r) => r.data);
export const getMyAccounts = () => api.get<Account[]>("/api/me/accounts").then((r) => r.data);
export const getAccount = (id: string) => api.get<Account>(`/api/accounts/${id}`).then((r) => r.data);
export const createAccount = (data: AccountRequest) => api.post<Account>("/api/accounts", data).then((r) => r.data);
export const updateAccount = (id: string, data: AccountRequest) => api.put<Account>(`/api/accounts/${id}`, data).then((r) => r.data);
export const deleteAccount = (id: string) => api.delete(`/api/accounts/${id}`);
