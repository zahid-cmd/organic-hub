import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PurchaseInvoiceService {

  private baseUrl = '/api/PurchaseInvoice';

  constructor(private http: HttpClient) {}

  /* ================= GET BY ID ================= */

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  /* ================= LIST ================= */

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  /* ================= CREATE ================= */

  create(payload: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload);
  }

  /* ================= UPDATE ================= */

  update(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload);
  }

  /* ================= DELETE ================= */

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

}