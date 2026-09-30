export interface ProfileResponse {
    id: string;
    pan: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

export interface ProfileUpdateRequest {
    pan: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}
