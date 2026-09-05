export interface Beneficiary {
    id: string;
    customerId: string;
    accountId: string;
    accountNo: string;
    accountType: string;
    accountHolderName: string;
    nickname: string;
}

export interface BeneficiaryRequest {
    accountId: string;
    nickname: string;
}

export interface AccountLookup {
    id: string;
    accountNo: string;
    accountType: string;
    accountHolderName: string;
}
