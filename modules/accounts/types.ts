export interface Account {
    id: string;
    accountNo: string;
    accountType: string;
    balance: number;
    customerId: string;
    customerName?: string;
}

export interface AccountRequest {
    accountType: string;
    balance: number;
    customerId: string;
}
