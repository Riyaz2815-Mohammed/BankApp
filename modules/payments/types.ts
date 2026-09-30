export interface PaymentResponse {
    paymentId: string;
    fromAccountNo: string;
    toAccountNo: string;
    toAccountName: string;
    amount: number;
    note?: string;
    status: "PENDING" | "COMPLETED" | "FAILED";
    initiatedByName: string;
    initiatedAt: string;
    completedAt?: string;
    failureReason?: string;
}
