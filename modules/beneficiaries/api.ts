import api from "@/lib/api";
import { AccountLookup, Beneficiary, BeneficiaryRequest } from "./types";

// Admin-scoped (by customerId)
export const getBeneficiaries = (customerId: string) =>
    api.get<Beneficiary[]>(`/api/customers/${customerId}/beneficiaries`).then((r) => r.data);

export const createBeneficiary = (customerId: string, data: BeneficiaryRequest) =>
    api.post<Beneficiary>(`/api/customers/${customerId}/beneficiaries`, data).then((r) => r.data);

export const updateBeneficiary = (customerId: string, beneficiaryId: string, data: BeneficiaryRequest) =>
    api.put<Beneficiary>(`/api/customers/${customerId}/beneficiaries/${beneficiaryId}`, data).then((r) => r.data);

export const deleteBeneficiary = (customerId: string, beneficiaryId: string) =>
    api.delete(`/api/customers/${customerId}/beneficiaries/${beneficiaryId}`);

// Current-user scoped (JWT-based)
export const getMyBeneficiaries = () =>
    api.get<Beneficiary[]>("/api/me/beneficiaries").then((r) => r.data);

export const addMyBeneficiary = (data: BeneficiaryRequest) =>
    api.post<Beneficiary>("/api/me/beneficiaries", data).then((r) => r.data);

export const removeMyBeneficiary = (beneficiaryId: string) =>
    api.delete(`/api/me/beneficiaries/${beneficiaryId}`);

// Account lookup by account number (used in add-beneficiary flow)
export const lookupAccount = (accountNo: string) =>
    api.get<AccountLookup>(`/api/accounts/lookup?accountNo=${encodeURIComponent(accountNo)}`).then((r) => r.data);
