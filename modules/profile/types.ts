export interface ProfileResponse {
    id: string;
    pan: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

export interface ProfileUpdateRequest {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

export interface ProfileUpdateResponse extends ProfileResponse {
    emailChanged: boolean;
}
