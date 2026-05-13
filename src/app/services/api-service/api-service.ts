import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getData(endpoint: string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl + endpoint}`)
      .pipe(catchError(this.handleError));
  }

  postData(endpoint: string, data: any): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl + endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  deleteData(endpoint: string, data: any): Observable<any> {
    return this.http
      .delete<any>(`${this.baseUrl + endpoint}`, { body: data })
      .pipe(catchError(this.handleError));
  }

  updateData(endpoint: string, data: any): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl + endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred', error);
    return throwError(() => error);
  }
}
