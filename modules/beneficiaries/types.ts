export interface Beneficiary {
    id: string;
    customerId: string;
    accountId: string;
    accountNo: string;
    accountType: string;
    accountHolderName: string;
    nickname: string;
    sourceAccountId?: string;
    sourceAccountNo?: string;
}

export interface BeneficiaryRequest {
    accountId: string;
    sourceAccountId: string;
    nickname: string;
}

export interface AccountLookup {
    id: string;
    accountNo: string;
    accountType: string;
    accountHolderName: string;
}
