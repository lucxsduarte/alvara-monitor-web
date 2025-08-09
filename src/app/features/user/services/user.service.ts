import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {delay, Observable, of} from 'rxjs';
import {environment} from '../../../environments/environment';
import {CreateUserDTO, UserDTO} from '../models/user.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly adminApiUrl = `${environment.apiUrl}/admin/users`;
  private http = inject(HttpClient);

  private mockUsers: UserDTO[] = [
    {id: 1, login: 'admin-master', role: 'ROLE_ADMIN'},
    {id: 2, login: 'joao.silva', role: 'ROLE_USER'},
    {id: 3, login: 'maria.santos', role: 'ROLE_USER'}
  ];

  getAll(): Observable<UserDTO[]> {
    if (environment.useMockData) {
      return of([...this.mockUsers]).pipe(delay(100));
    }

    return this.http.get<UserDTO[]>(this.adminApiUrl);
  }

  create(data: CreateUserDTO): Observable<UserDTO> {
    if (environment.useMockData) {
      const novoId = Math.max(...this.mockUsers.map(u => u.id)) + 1;
      const newUser: UserDTO = {
        id: novoId,
        login: data.login,
        role: data.role
      };
      this.mockUsers.push(newUser);
      return of(newUser).pipe(delay(100));
    }

    return this.http.post<UserDTO>(this.adminApiUrl, data);
  }

  update(id: number, data: { login: string, role: string }): Observable<UserDTO> {
    if (environment.useMockData) {
      const index = this.mockUsers.findIndex(u => u.id === id);
      if (index > -1) {
        this.mockUsers[index].login = data.login;
        this.mockUsers[index].role = data.role;
        return of({ ...this.mockUsers[index] }).pipe(delay(100));
      }
      return of();
    }

    return this.http.put<UserDTO>(`${this.adminApiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    if (environment.useMockData) {
      this.mockUsers = this.mockUsers.filter(u => u.id !== id);
      return of(undefined).pipe(delay(100));
    }

    return this.http.delete<void>(`${this.adminApiUrl}/${id}`);
  }
}
