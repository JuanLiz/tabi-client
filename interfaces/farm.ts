interface Farm {
    name: string;
    address: string;
    hectares: number;
}

interface FarmResponse extends Farm {
    userID: number;
    farmID: number;
    user?: UserResponse;
}
