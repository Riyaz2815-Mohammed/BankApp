import api from "@/lib/api";
import { AccountLookup, Beneficiary, BeneficiaryRequest } from "./types";

export const getBeneficiaries = (customerId?: string) =>
    api.get<Beneficiary[]>(`/api/v1/beneficiaries${customerId ? `?customerId=${customerId}` : ""}`).then((r) => r.data);

export const getBeneficiariesByAccount = (accountId: string) =>
    api.get<Beneficiary[]>(`/api/v1/beneficiaries?accountId=${accountId}`).then((r) => r.data);

export const addBeneficiary = (data: BeneficiaryRequest, customerId?: string) =>
    api.post<Beneficiary>(`/api/v1/beneficiaries${customerId ? `?customerId=${customerId}` : ""}`, data).then((r) => r.data);

export const updateBeneficiary = (beneficiaryId: string, data: BeneficiaryRequest) =>
    api.put<Beneficiary>(`/api/v1/beneficiaries/${beneficiaryId}`, data).then((r) => r.data);

export const deleteBeneficiary = (beneficiaryId: string) =>
    api.delete(`/api/v1/beneficiaries/${beneficiaryId}`);

export const lookupAccount = (accountNo: string) =>
    api.get<AccountLookup>(`/api/v1/accounts/lookup?accountNo=${encodeURIComponent(accountNo)}`).then((r) => r.data);
