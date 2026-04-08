import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { SearchArea } from '../../../components/search-area/search-area';
import { PaginationComponent } from '../../../components/pagination/pagination';

@Component({
  selector: 'app-sales-invoice-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PageSubHeaderComponent,
    SearchArea,
    PaginationComponent
  ],
  templateUrl: './sales-invoice-list-page.html',
  styleUrls: ['./sales-invoice-list-page.css']
})
export class SalesInvoiceListPage {

  searchText = '';
  statusFilter = '';
  statusOptions = ['Approved', 'Draft'];

  pageSize = 10;
  currentPage = 1;
  totalRecords = 0;

  invoices = [
    {
      invoiceNo: 'SINV-1001',
      invoiceDate: '2026-01-08',
      customerName: 'Customer A',
      totalAmount: 15800,
      status: 'Approved'
    },
    {
      invoiceNo: 'SINV-1002',
      invoiceDate: '2026-01-10',
      customerName: 'Customer B',
      totalAmount: 9200,
      status: 'Draft'
    }
  ];

  private filteredInvoices: any[] = [];
  pagedInvoices: any[] = [];

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

  private applyFiltersAndPaging(): void {
    const text = this.searchText.trim();

    this.filteredInvoices = this.invoices.filter(i => {
      const matchText =
        !text ||
        i.invoiceNo.toLowerCase().includes(text) ||
        i.customerName.toLowerCase().includes(text);

      const matchStatus =
        !this.statusFilter || i.status === this.statusFilter;

      return matchText && matchStatus;
    });

    this.totalRecords = this.filteredInvoices.length;
    this.applyPaging();
  }

  private applyPaging(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedInvoices = this.filteredInvoices.slice(
      start,
      start + this.pageSize
    );
  }

  /* =========================
     ACTIONS
  ========================== */
  onAdd(): void {
    this.router.navigate(['/sales/invoice/form']);
  }

  onBack(): void {
    this.router.navigate(['/sales']);
  }

  onView(i: number): void {
    this.router.navigate(['/sales/invoice/form'], {
      queryParams: { mode: 'view', index: i }
    });
  }

  onEdit(i: number): void {
    this.router.navigate(['/sales/invoice/form'], {
      queryParams: { mode: 'edit', index: i }
    });
  }

  /* =========================
     ✅ SALES INVOICE PRINT
  ========================== */
  onInvoiceView(i: number): void {
    const invoice = this.pagedInvoices[i];

    this.router.navigate(
      ['/sales/invoice/print'],
      {
        queryParams: {
          invoiceNo: invoice.invoiceNo
        }
      }
    );
  }
}
