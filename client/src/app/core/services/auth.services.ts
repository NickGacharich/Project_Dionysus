
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '../../shared/models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5000/api/auth';
  private readonly tokenKey = 'dionysus_token';
  private readonly userKey = 'dionysus_user';

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(tap((response) => this.saveSession(response)));
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, data)
      .pipe(tap((response) => this.saveSession(response)));
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): AuthUser | null {
    const user = sessionStorage.getItem(this.userKey);

    if (!user) return null;

    try {
      return JSON.parse(user) as AuthUser;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
  }

  private saveSession(response: AuthResponse): void {
    sessionStorage.setItem(this.tokenKey, response.token);
    sessionStorage.setItem(
      this.userKey,
      JSON.stringify(response.user)
    );
  }

  getMe(): Observable<{ user: AuthUser }> {
    return this.http.get<{ user: AuthUser }>(
      `${this.apiUrl}/me`
    );
  }
  
  updateProfile(data: {
    displayName: string;
    avatar: string;
  }): Observable<{
    message: string;
    user: AuthUser;
  }> {
    return this.http.put<{
      message: string;
      user: AuthUser;
    }>(`${this.apiUrl}/profile`, data);
  }
}