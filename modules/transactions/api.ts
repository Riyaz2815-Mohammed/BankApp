import api from "@/lib/api";
import { Transaction, TransferPreviewResponse, TransferRequest } from "./types";
import { PaymentResponse } from "@/modules/payments/types";
import { PagedResponse } from "@/types";

export const getTransactions = (accountId: string, page = 0, size = 10) =>
    api.get<PagedResponse<Transaction>>("/api/v1/transactions", { params: { accountId, page, size } }).then((r) => r.data);

export const previewTransfer = (fromAccountId: string, recipientAccountNo: string, amount: number) =>
    api.get<TransferPreviewResponse>("/api/v2/transfer/preview", { params: { fromAccountId, recipientAccountNo, amount } }).then((r) => r.data);

export const transfer = (data: Omit<TransferRequest, "paymentId">) =>
    api.post<PaymentResponse>("/api/v2/transfer", { ...data, paymentId: crypto.randomUUID() }).then((r) => r.data);
