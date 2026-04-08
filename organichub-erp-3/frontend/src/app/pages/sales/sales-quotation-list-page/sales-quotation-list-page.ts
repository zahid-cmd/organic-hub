import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { SearchArea } from '../../../components/search-area/search-area';
import { PaginationComponent } from '../../../components/pagination/pagination';

@Component({
  selector: 'app-sales-quotation-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PageSubHeaderComponent,
    SearchArea,
    PaginationComponent
  ],
  templateUrl: './sales-quotation-list-page.html',
  styleUrls: ['./sales-quotation-list-page.css'],
})
export class SalesQuotationListPage {

  /* =========================
     STATE
  ========================== */
  searchText = '';
  statusFilter = '';
  statusOptions = ['Approved', 'Draft'];

  pageSize = 10;
  currentPage = 1;
  totalRecords = 0;

  /* =========================
     UI DEMO DATA
  ========================== */
  orders = [
    {
      orderNo: 'SQ-1001',
      orderDate: '2026-01-05',
      customerName: 'Customer A',
      totalAmount: 12500,
      status: 'Approved'
    },
    {
      orderNo: 'SQ-1002',
      orderDate: '2026-01-07',
      customerName: 'Customer B',
      totalAmount: 8900,
      status: 'Draft'
    },
    {
      orderNo: 'SQ-1003',
      orderDate: '2026-01-10',
      customerName: 'Customer C',
      totalAmount: 15600,
      status: 'Approved'
    }
  ];

  private filteredOrders: any[] = [];
  pagedOrders: any[] = [];

  constructor(private router: Router) {
    this.applyFiltersAndPaging();
  }

  /* =========================
     SEARCH & FILTER
  ========================== */
  onSearch(value: string): void {
    this.searchText = value.toLowerCase();
    this.currentPage = 1;
    this.applyFiltersAndPaging();
  }

  onStatusChange(value: string): void {
    this.statusFilter = value;
    this.currentPage = 1;
    this.applyFiltersAndPaging();
  }

  onClear(): void {
    this.searchText = '';
    this.statusFilter = '';
    this.currentPage = 1;
    this.applyFiltersAndPaging();
  }

  /* =========================
     PAGINATION
  ========================== */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyPaging();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.applyPaging();
  }

  serial(i: number): number {
    return (this.currentPage - 1) * this.pageSize + i + 1;
  }

  /* =========================
     CORE
  ========================== */
  private applyFiltersAndPaging(): void {
    const text = this.searchText.trim();

    this.filteredOrders = this.orders.filter(o => {
      const matchText =
        !text ||
        o.orderNo.toLowerCase().includes(text) ||
        o.customerName.toLowerCase().includes(text);

      const matchStatus =
        !this.statusFilter || o.status === this.statusFilter;

      return matchText && matchStatus;
    });

    this.totalRecords = this.filteredOrders.length;
    this.applyPaging();
  }

  private applyPaging(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedOrders = this.filteredOrders.slice(start, start + this.pageSize);
  }

  /* =========================
     ACTIONS
  ========================== */
  onAdd(): void {
    this.router.navigate(['/sales/quotation/form']);
  }

  onBack(): void {
    this.router.navigate(['/sales']);
  }
  /* =========================
   ✅ SALES QUOTATION PRINT
========================== */
onQuotationPrint(i: number): void {
  const quotation = this.pagedOrders[i];

  this.router.navigate(
    ['/sales/quotation/print'],
    {
      queryParams: {
        quotationNo: quotation.orderNo
      }
    }
  );
}

}
