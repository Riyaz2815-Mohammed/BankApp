export interface Transaction {
    id: string;
    accountType: string;
    customer_id: string;
    balance: number;
    amount: number;
    timestamp: string;
    description?: string;
}

export interface TransactionRequest {
    type: string;
    amount: number;
}

export interface TransferRequest {
    paymentId: string;
    fromAccountId: string;
    recipientAccountNo: string;
    amount: number;
    note?: string;
}
