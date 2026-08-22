export interface Transaction {
    id: string;
    type: string;
    accountId: string;
    balance: number;
    amount: number;
    transactionTime: string;
}

export interface TransactionRequest {
    type: string;
    amount: number;
}
