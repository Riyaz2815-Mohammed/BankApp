import api from "@/lib/api";
import { PaymentResponse } from "./types";
import { PagedResponse } from "@/types";

export const getPayments = (page = 0, size = 10, accountId?: string) =>
    api.get<PagedResponse<PaymentResponse>>("/api/v1/payments", { params: { ...(accountId ? { accountId } : {}), page, size } }).then((r) => r.data);

export const getPayment = (paymentId: string) =>
    api.get<PaymentResponse>(`/api/v1/payments/${paymentId}`).then((r) => r.data);
