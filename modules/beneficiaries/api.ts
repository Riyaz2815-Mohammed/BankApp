import api from "@/lib/api";
import { AccountLookup, Beneficiary, BeneficiaryRequest } from "./types";

export const getBeneficiaries = (customerId?: string) =>
    api.get<Beneficiary[]>(`/api/beneficiaries${customerId ? `?customerId=${customerId}` : ""}`).then((r) => r.data);

export const addBeneficiary = (data: BeneficiaryRequest, customerId?: string) =>
    api.post<Beneficiary>(`/api/beneficiaries${customerId ? `?customerId=${customerId}` : ""}`, data).then((r) => r.data);

export const updateBeneficiary = (beneficiaryId: string, data: BeneficiaryRequest) =>
    api.put<Beneficiary>(`/api/beneficiaries/${beneficiaryId}`, data).then((r) => r.data);

export const deleteBeneficiary = (beneficiaryId: string) =>
    api.delete(`/api/beneficiaries/${beneficiaryId}`);

export const lookupAccount = (accountNo: string) =>
    api.get<AccountLookup>(`/api/accounts/lookup?accountNo=${encodeURIComponent(accountNo)}`).then((r) => r.data);
