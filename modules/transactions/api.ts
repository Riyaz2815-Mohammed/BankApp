import api from "@/lib/api";
import { Transaction, TransferRequest } from "./types";
import { PaymentResponse } from "@/modules/payments/types";

export const getTransactions = (accountId: string) =>
    api.get<Transaction[]>(`/api/v1/transactions?accountId=${accountId}`).then((r) => r.data);

export const transfer = (data: Omit<TransferRequest, "paymentId">) =>
    api.post<PaymentResponse>("/api/v2/transfer", { ...data, paymentId: crypto.randomUUID() }).then((r) => r.data);
