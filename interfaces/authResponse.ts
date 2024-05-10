interface AuthResponse {
    userID: number;
    token: string;
    email: string;
    username?: string;
    name: string;
    lastName: string;
    userTypeID: number;
}