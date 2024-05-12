interface Farm {
    userID: number;
    name: string;
    address?: string;
    hectares: number;
    isActive: boolean;
}

interface FarmResponse extends Farm {
    farmID: number;
    user: UserResponse;
}
