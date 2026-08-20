export interface Customer {
    id: string;
    pan: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

export interface Account {
    id: string;
    accountNo: string;
    accountType: string;
    balance: number;
    customerId: string;
}

export interface Transaction {
    id: string;
    type: string;
    accountId: string;
    balance: number;
    amount: number;
    transactionTime: string;
}

export interface Beneficiary {
    id: string;
    customerId: string;
    beneficiaryAccountId: string;
    nickname: string;
}

export interface ErrorResponse {
    status: number;
    error: string;
    message: string;
    timestamp: string;
}
