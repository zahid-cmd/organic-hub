import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PaginationComponent } from '../../../components/pagination/pagination';
import { SearchArea } from '../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';

@Component({
  selector: 'app-stock-summary',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    SearchArea,
    PageSubHeaderComponent
  ],
  templateUrl: './stock-summary.html',
  styleUrls: ['./stock-summary.css']
})
export class StockSummaryComponent {

  /* =========================
     DATA (SINGLE SOURCE)
  ========================== */

  items = Array.from({ length: 60 }, (_, i) => {
    const currentStock = Math.floor(Math.random() * 200);
    const reorderLevel = 40;

    return {
      productCode: `PRD-${1001 + i}`,
      productName: `Sample Product ${i + 1}`,
      currentStock,
      reorderLevel,
      reorderQty: 100,
      stockValue: Math.floor(Math.random() * 50000) + 5000,

      // 🔑 SINGLE SOURCE OF STATUS
      status: currentStock <= reorderLevel ? 'Low Stock' : 'Healthy'
    };
  });

  /* =========================
     SEARCH & FILTER
  ========================== */

  searchText = '';
  statusFilter = '';
  statusOptions = ['Healthy', 'Low Stock'];

  /* =========================
     PAGINATION
  ========================== */

  pageSize = 10;
  currentPage = 1;

  constructor(private router: Router) {}

  /* =========================
     COMPUTED
  ========================== */

  get filteredItems() {
    return this.items.filter(item =>
      (item.productCode + item.productName)
        .toLowerCase()
        .includes(this.searchText) &&
      (!this.statusFilter || item.status === this.statusFilter)
    );
  }

  get totalRecords() {
    return this.filteredItems.length;
  }

  get pagedItems() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredItems.slice(start, start + this.pageSize);
  }

  serial(i: number) {
    return (this.currentPage - 1) * this.pageSize + i + 1;
  }

  /* =========================
     EVENTS
  ========================== */

  onSearch(value: string) {
    this.searchText = value.toLowerCase();
    this.currentPage = 1;
  }

  onStatusChange(value: string) {
    this.statusFilter = value;
    this.currentPage = 1;
  }

  onClear() {
    this.searchText = '';
    this.statusFilter = '';
    this.currentPage = 1;
  }

  onBack() {
    this.router.navigate(['/dashboard']);
  }

  onView(item: any) {
    this.router.navigate(
      ['/store-management/product-ledger'],
      { queryParams: { productCode: item.productCode } }
    );
  }

  onAdjust(item: any) {
    console.log('Adjust stock:', item);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }
}
