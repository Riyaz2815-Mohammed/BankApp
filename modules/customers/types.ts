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
}

export interface RegisterUserResponse {
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    pan: string;
    phoneNumber: string;
    keycloakUserId: string;
    message: string;
}
