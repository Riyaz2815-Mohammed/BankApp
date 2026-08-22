import api from "@/lib/api";
import { Beneficiary, BeneficiaryRequest } from "./types";

export const getBeneficiaries = (customerId: string) =>
    api.get<Beneficiary[]>(`/api/customers/${customerId}/beneficiaries`).then((r) => r.data);

export const createBeneficiary = (customerId: string, data: BeneficiaryRequest) =>
    api.post<Beneficiary>(`/api/customers/${customerId}/beneficiaries`, data).then((r) => r.data);

export const deleteBeneficiary = (customerId: string, beneficiaryId: string) =>
    api.delete(`/api/customers/${customerId}/beneficiaries/${beneficiaryId}`);
