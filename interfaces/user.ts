interface User {
    userID: number;
    userTypeID: number;
    name: string;
    lastName: string;
    documentTypeID?: number;
    documentNumber?: string;
    username?: string;
    email: string;
    password?: string;
    phone?: string;
    address?: string;
    isActive: boolean;
    userType?: UserType;
    documentType?: DocumentType;
  }