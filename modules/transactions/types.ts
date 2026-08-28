export interface Transaction {
    id: string;
    accountType: string;
    customer_id: string;
    balance: number;
    amount: number;
    timestamp: string;
}

export interface TransactionRequest {
    type: string;
    amount: number;
}
