import api from "@/lib/api";
import { Transaction, TransactionRequest } from "./types";

export const getTransactions = (accountId: string) =>
    api.get<Transaction[]>(`/api/accounts/${accountId}/transactions`).then((r) => r.data);

export const createTransaction = (accountId: string, data: TransactionRequest) =>
    api.post<Transaction>(`/api/accounts/${accountId}/transactions`, data).then((r) => r.data);
