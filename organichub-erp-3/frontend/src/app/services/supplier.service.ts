import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SupplierDto {
  id: number;
  supplierCode: string;
  supplierName: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private baseUrl = 'https://localhost:5150/api/Suppliers';
  // ⚠️ Change port if needed

  constructor(private http: HttpClient) {}

  // ===============================
  // GET ALL SUPPLIERS
  // ===============================
  getAll(): Observable<SupplierDto[]> {
    return this.http.get<SupplierDto[]>(this.baseUrl);
  }
}