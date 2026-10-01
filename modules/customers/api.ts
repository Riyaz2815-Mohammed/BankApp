import api from "@/lib/api";
import { Customer, CustomerRequest, RegisterUserRequest, RegisterUserResponse, CreateManagerRequest, CreateManagerResponse, ManagerResponse } from "./types";

export const getCustomers = () => api.get<Customer[]>("/api/v1/customers").then((r) => r.data);
export const getCustomer = (id: string) => api.get<Customer>(`/api/v1/customers/${id}`).then((r) => r.data);
export const updateCustomer = (id: string, data: CustomerRequest) => api.put<Customer>(`/api/v1/customers/${id}`, data).then((r) => r.data);
export const deleteCustomer = (id: string) => api.delete(`/api/v1/customers/${id}`);
export const registerUser = (data: RegisterUserRequest) => api.post<RegisterUserResponse>("/api/v1/register", data).then((r) => r.data);
export const createManager = (data: CreateManagerRequest) => api.post<CreateManagerResponse>("/api/v1/managers", data).then((r) => r.data);
export const getManagers = () => api.get<ManagerResponse[]>("/api/v1/managers").then((r) => r.data);
