import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryBatchList {

  batchId: number;
  batchNo: string;

  productName: string;
  warehouseName: string;

  unitCost: number;

  qtyIn: number;
  qtyOut: number;
  qtyBalance: number;

  batchDate: string;
  batchStatus: number;
  sourceNo: string;

}

@Injectable({
  providedIn: 'root'
})
export class InventoryBatchService {

  private api = 'http://localhost:5150/api/inventory-batch';

  constructor(private http: HttpClient) {}

  getBatches(): Observable<InventoryBatchList[]> {
    return this.http.get<InventoryBatchList[]>(this.api);
  }

  getLedger(batchId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${batchId}/ledger`);
  }
}