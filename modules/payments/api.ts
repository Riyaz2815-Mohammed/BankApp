import api from "@/lib/api";
import { PaymentResponse } from "./types";

export const getPayments = (accountId?: string) =>
    api.get<PaymentResponse[]>("/api/v1/payments", { params: accountId ? { accountId } : {} }).then((r) => r.data);

export const getPayment = (paymentId: string) =>
    api.get<PaymentResponse>(`/api/v1/payments/${paymentId}`).then((r) => r.data);
