import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/* ================= CREATE ORDER ================= */

export interface CreateOnlineOrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOnlineOrderRequest {
  customerName: string;
  phone: string;
  address: string;   // 🔥 make required (backend expects it)
  items: CreateOnlineOrderItem[];
}

export interface CreateOnlineOrderResponse {
  message: string;
  orderNo: string;
  totalAmount: number;
}

/* ================= ORDER SUMMARY ================= */

export interface OrderSummaryItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderSummaryResponse {
  orderNo: string;
  orderDate: string;
  customerName: string;
  phone: string;
  address: string;   // 🔥 ADDED — fixes TS2339
  totalAmount: number;
  items: OrderSummaryItem[];
}

/* ================= SERVICE ================= */

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:5150/api/online-orders';

  constructor(private http: HttpClient) {}

  createOrder(
    payload: CreateOnlineOrderRequest
  ): Observable<CreateOnlineOrderResponse> {
    return this.http.post<CreateOnlineOrderResponse>(
      this.apiUrl,
      payload
    );
  }

  getOrderByOrderNo(
    orderNo: string
  ): Observable<OrderSummaryResponse> {
    return this.http.get<OrderSummaryResponse>(
      `${this.apiUrl}/by-order-no/${orderNo}`
    );
  }
}