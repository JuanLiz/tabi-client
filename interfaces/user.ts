interface User {
  name: string;
  lastName: string;
  documentTypeID?: number;
  documentNumber?: string;
  username?: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

interface UserResponse extends Omit<User, 'password'> {
  userTypeID: number;
  userID: number;
  userType?: UserType;
  password?: string;
  documentType?: DocumentType;
}