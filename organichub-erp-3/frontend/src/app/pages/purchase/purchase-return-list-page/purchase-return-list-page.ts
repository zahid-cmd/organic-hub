import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/* shared components */
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { SearchArea } from '../../../components/search-area/search-area';
import { PaginationComponent } from '../../../components/pagination/pagination';

@Component({
  selector: 'app-purchase-return-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PageSubHeaderComponent,
    SearchArea,
    PaginationComponent
  ],
  templateUrl: './purchase-return-list-page.html',
  styleUrls: ['./purchase-return-list-page.css'],
})
export class PurchaseReturnListPage {

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
      returnNo: 'PR-1001',
      returnDate: '2026-01-12',
      supplierName: 'Supplier A',
      totalAmount: 3200,
      status: 'Approved'
    },
    {
      returnNo: 'PR-1002',
      returnDate: '2026-01-15',
      supplierName: 'Supplier B',
      totalAmount: 1800,
      status: 'Draft'
    },
    {
      returnNo: 'PR-1003',
      returnDate: '2026-01-18',
      supplierName: 'Supplier C',
      totalAmount: 4500,
      status: 'Approved'
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
        r.supplierName.toLowerCase().includes(text);

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
    this.router.navigate(['/purchase/return/form']);
  }

  onView(index: number): void {
    this.router.navigate(['/purchase/return/form'], {
      queryParams: { mode: 'view', index }
    });
  }

  onEdit(index: number): void {
    this.router.navigate(['/purchase/return/form'], {
      queryParams: { mode: 'edit', index }
    });
  }

  onBack(): void {
    this.router.navigate(['/purchase']);
  }

  /* =========================
     ✅ PURCHASE RETURN PRINT
  ========================== */
  onReturnPrint(i: number): void {
    const ret = this.pagedReturns[i];

    this.router.navigate(
      ['/purchase/return/print'],
      {
        queryParams: {
          returnNo: ret.returnNo
        }
      }
    );
  }
}
