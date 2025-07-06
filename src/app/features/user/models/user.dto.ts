export interface UserDTO {
  id: number;
  login: string;
  role: string;
}

export interface EditUserDTO {
  login: string;
  role: string;
}

export type CreateUserDTO = Omit<UserDTO, 'id'> & { password?: string };

