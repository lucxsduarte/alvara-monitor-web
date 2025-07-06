import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateUserDTO, UserDTO } from '../models/user.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly adminApiUrl = `${environment.apiUrl}/admin/usuarios`;
  private http = inject(HttpClient);

  getAll(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(this.adminApiUrl);
  }

  create(data: CreateUserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(this.adminApiUrl, data);
  }

  update(id: number, data: { login: string, role: string }): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.adminApiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/${id}`);
  }
}
