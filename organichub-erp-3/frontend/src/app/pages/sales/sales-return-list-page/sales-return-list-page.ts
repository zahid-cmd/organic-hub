import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/* shared components */
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { SearchArea } from '../../../components/search-area/search-area';
import { PaginationComponent } from '../../../components/pagination/pagination';

@Component({
  selector: 'app-sales-return-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PageSubHeaderComponent,
    SearchArea,
    PaginationComponent
  ],
  templateUrl: './sales-return-list-page.html',
  styleUrls: ['./sales-return-list-page.css'],
})
export class SalesReturnListPage {

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
  returns = [
    {
      returnNo: 'SR-1001',
      returnDate: '2026-01-12',
      customerName: 'Customer A',
      totalAmount: 3200,
      status: 'Approved'
    },
    {
      returnNo: 'SR-1002',
      returnDate: '2026-01-15',
      customerName: 'Customer B',
      totalAmount: 1800,
      status: 'Draft'
    }
  ];

  private filteredReturns: any[] = [];
  pagedReturns: any[] = [];

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

    this.filteredReturns = this.returns.filter(r => {
      const matchText =
        !text ||
        r.returnNo.toLowerCase().includes(text) ||
        r.customerName.toLowerCase().includes(text);

      const matchStatus =
        !this.statusFilter || r.status === this.statusFilter;

      return matchText && matchStatus;
    });

    this.totalRecords = this.filteredReturns.length;
    this.applyPaging();
  }

  private applyPaging(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedReturns = this.filteredReturns.slice(start, start + this.pageSize);
  }

  /* =========================
     ACTIONS
  ========================== */
  onAdd(): void {
    this.router.navigate(['/sales/return/form']);
  }

  onBack(): void {
    this.router.navigate(['/sales']);
  }

/* =========================
   ✅ SALES RETURN PRINT
========================== */
onReturnView(i: number): void {
  const ret = this.pagedReturns[i];

  this.router.navigate(
    ['/sales/invoice/return/print'],
    {
      queryParams: {
        returnNo: ret.returnNo
      }
    }
  );
}


}

