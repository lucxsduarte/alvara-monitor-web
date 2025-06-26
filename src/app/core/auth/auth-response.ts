export interface AuthResponse {
  token: string;
  user: {
    nome: string;
    email: string;
  };
}
