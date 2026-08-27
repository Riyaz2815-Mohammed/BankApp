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
