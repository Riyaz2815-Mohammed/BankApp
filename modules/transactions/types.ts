export interface Transaction {
    id: string;
    transactionType: string;
    accountId: string;
    balance: number;
    amount: number;
    timestamp: string;
    description?: string;
}

export interface TransferPreviewResponse {
    fromAccountNo: string;
    fromAccountBalance: number;
    toAccountNo: string;
    toAccountName: string;
    amount: number;
    estimatedAt: string;
}

export interface TransferRequest {
    paymentId: string;
    fromAccountId: string;
    recipientAccountNo: string;
    amount: number;
    note?: string;
}
