import api from "@/lib/api";
import { Transaction, TransactionRequest, TransferRequest, TransferResponse } from "./types";

export const getTransactions = (accountId: string) =>
    api.get<Transaction[]>(`/api/v1/transactions?accountId=${accountId}`).then((r) => r.data);

export const createTransaction = (accountId: string, data: TransactionRequest) =>
    api.post<Transaction>(`/api/v1/transactions`, { ...data, accountId }).then((r) => r.data);

export const transfer = (data: TransferRequest) =>
    api.post<TransferResponse>("/api/v1/transfer", data).then((r) => r.data);
