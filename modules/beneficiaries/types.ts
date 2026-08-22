export interface Beneficiary {
    id: string;
    customerId: string;
    beneficiaryAccountId: string;
    nickname: string;
}

export interface BeneficiaryRequest {
    accountId: string;
    nickname: string;
}
