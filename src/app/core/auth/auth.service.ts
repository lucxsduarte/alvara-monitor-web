import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, catchError, Observable, of, tap} from "rxjs";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {jwtDecode} from "jwt-decode";

interface LoginResponse {
  token: string;
}

interface DecodedToken {
  sub: string;
  roles: string[];
  exp: number;
  iss: string;
}

export interface AuthenticatedUser {
  login: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly tokenKey = 'auth_token';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private currentUserSubject = new BehaviorSubject<AuthenticatedUser | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromToken();
  }

  login(credentials: { login: string; senha: string }): Observable<LoginResponse | null> {
    if (environment.useMockData) {
      if (credentials.login === 'admin' && credentials.senha === '123') {
        const mockAdminToken = this.createMockAdminToken();
        this.handleAuthentication(mockAdminToken);
        return of({token: mockAdminToken});
      }

      return of(null);
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.handleAuthentication(response.token);
      }),
      catchError(error => {
        this.logout();
        console.error('Erro no login:', error);
        return of(null);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    void this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  public userHasRole(requiredRole: string): boolean {
    return this.currentUserSubject.getValue()?.roles.includes(requiredRole) ?? false;
  }

  loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      this.handleAuthentication(token);
    } else {
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
    }
  }

  private handleAuthentication(token: string): void {
    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      const user: AuthenticatedUser = {
        login: decodedToken.sub,
        roles: decodedToken.roles || []
      };

      localStorage.setItem(this.tokenKey, token);
      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error("[AuthService - handleAuthentication] Erro ao decodificar token. Fazendo logout.", error);
      this.logout();
    }
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private createMockAdminToken(): string {
    const header = btoa(JSON.stringify({
      alg: 'HS256',
      typ: 'JWT'
    }));
    const payload = btoa(JSON.stringify({
      sub: 'admin',
      roles: ['ROLE_ADMIN'],
      exp: Date.now() / 1000 + (2 * 60 * 60)
    }));
    const signature = 'mock-signature';
    return `${header}.${payload}.${signature}`;
  }
}
