import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, catchError, Observable, of, tap} from "rxjs";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {AuthResponse} from "./auth-response";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private tokenKey = 'auth_token';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private currentUserSubject = new BehaviorSubject<{ nome: string; email: string } | null>(null);

  login(credentials: { name: string; password: string }): Observable<AuthResponse | null> {
    if (environment.useMockData) {
      if (credentials.name === 'admin' && credentials.password === '123') {
        const mockResponse: AuthResponse = {
          token: 'mock-token-jwt',
          user: {
            nome: 'Admin Mock',
            email: 'admin@mock.com'
          }
        };
        this.setToken(mockResponse.token);
        this.currentUserSubject.next(mockResponse.user);
        return of(mockResponse);
      }

      return of(null);
    }

    return this.http.post<AuthResponse>(`${environment.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.token);
        this.currentUserSubject.next(response.user);
      }),
      catchError(error => {
        console.error('Erro no login:', error);
        return of(null);
      })
    );
  }

  logout(): void {
    this.removeToken();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getCurrentUser(): Observable<{ nome: string; email: string } | null> {
    return this.currentUserSubject.asObservable();
  }

  loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      this.isAuthenticatedSubject.next(true);
      // No backend real, você pode futuramente decodificar o JWT
      this.currentUserSubject.next(
        environment.useMockData
          ? { nome: 'Admin Mock', email: 'admin@mock.com' }
          : null // <- no futuro, buscar user real ou via refresh
      );
    } else {
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
    }
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.isAuthenticatedSubject.next(true);
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
