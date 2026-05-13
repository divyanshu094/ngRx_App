import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { LoginRequest, RegisterRequest, AuthResponse } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

   headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  });

  getData(endpoint:string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl+endpoint}`, { headers: this.headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  postData(endpoint:string,data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl+endpoint}`, data, { headers: this.headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Authentication endpoints
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}auth/login`, loginData, { headers: this.headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}auth/register`, registerData, { headers: this.headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('An error occurred', error);
    return throwError(() => error);
  }

}
