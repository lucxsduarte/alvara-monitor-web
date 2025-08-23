export interface UserResponseDTO {
  id: number;
  login: string;
  role: string;
}

export interface EditUserRequestDTO {
  login: string;
  role: string;
}

export type CreateUserRequestDTO = Omit<UserResponseDTO, 'id'> & { password?: string };

