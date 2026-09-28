import api from "@/lib/api";
import { Account, AccountRequest } from "./types";

export const getAccounts = () => api.get<Account[]>("/api/v1/accounts").then((r) => r.data);
export const getAccount = (id: string) => api.get<Account>(`/api/v1/accounts/${id}`).then((r) => r.data);
export const createAccount = (data: AccountRequest) => api.post<Account>("/api/v1/accounts", data).then((r) => r.data);
export const updateAccount = (id: string, data: AccountRequest) => api.put<Account>(`/api/v1/accounts/${id}`, data).then((r) => r.data);
export const deleteAccount = (id: string) => api.delete(`/api/v1/accounts/${id}`);
