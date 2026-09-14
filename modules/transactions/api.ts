import api from "@/lib/api";
import { Transaction, TransactionRequest, TransferRequest, TransferResponse } from "./types";

export const getTransactions = (accountId: string) =>
    api.get<Transaction[]>(`/api/transactions?accountId=${accountId}`).then((r) => r.data);

export const createTransaction = (accountId: string, data: TransactionRequest) =>
    api.post<Transaction>(`/api/transactions`, { ...data, accountId }).then((r) => r.data);

export const transfer = (data: TransferRequest) =>
    api.post<TransferResponse>("/api/me/transfer", data).then((r) => r.data);
