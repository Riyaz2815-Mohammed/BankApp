import api from "@/lib/api";
import { Customer, CustomerRequest, RegisterUserRequest, RegisterUserResponse } from "./types";

export const getCustomers = () => api.get<Customer[]>("/api/customers").then((r) => r.data);
export const getCustomer = (id: string) => api.get<Customer>(`/api/customers/${id}`).then((r) => r.data);
export const createCustomer = (data: CustomerRequest) => api.post<Customer>("/api/customers", data).then((r) => r.data);
export const updateCustomer = (id: string, data: CustomerRequest) => api.put<Customer>(`/api/customers/${id}`, data).then((r) => r.data);
export const deleteCustomer = (id: string) => api.delete(`/api/customers/${id}`);
export const registerUser = (data: RegisterUserRequest) => api.post<RegisterUserResponse>("/api/register", data).then((r) => r.data);
