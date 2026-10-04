export interface Customer {
    id: string;
    pan: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

export interface CustomerRequest {
    pan: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

export interface RegisterUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    pan: string;
    phoneNumber: string;
    username: string;
    temporaryPassword: string;
    accountType: string;
    initialBalance: number;
}

export interface RegisterUserResponse {
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    pan: string;
    phoneNumber: string;
    keycloakUserId: string;
    accountId: string;
    accountNo: string;
    accountType: string;
    balance: number;
}

export interface CreateManagerRequest {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    temporaryPassword: string;
}

export interface CreateManagerResponse {
    keycloakId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    message: string;
}

export interface ManagerResponse {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
}
