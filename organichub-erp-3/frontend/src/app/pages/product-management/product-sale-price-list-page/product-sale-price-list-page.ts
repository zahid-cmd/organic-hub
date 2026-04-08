import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';

import { PaginationComponent } from '../../../components/pagination/pagination';
import { SearchArea } from '../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { HistoryDrawerComponent } from '../../../components/history-drawer/history-drawer';

interface ProductSalePrice {
  id: number;
  productId: number;
  productName: string;
  price: number;
  oldPrice: number;
  status: string;
  effectiveFrom: string;
}

@Component({
  selector: 'app-product-sale-price-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    SearchArea,
    PageSubHeaderComponent,
    OrganicToast,
    HistoryDrawerComponent
  ],
  templateUrl: './product-sale-price-list-page.html',
  styleUrls: ['./product-sale-price-list-page.css']
})
export class ProductSalePriceListPage implements OnInit {

  prices: ProductSalePrice[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  sortColumn: keyof ProductSalePrice = 'productName';
  sortDirection: 'asc' | 'desc' = 'asc';

  showHistory = false;
  selectedProductName: string = '';
  historyData: any[] = [];
  historyLoading = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPrices();
  }

  loadPrices(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getProductSalePrices().subscribe({
      next: (data: ProductSalePrice[]) => {
        this.prices = Array.isArray(data) ? data : [];
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load product prices.';
        this.toast.error('Failed to load product prices.');
        this.loading = false;
      }
    });
  }

  get filteredPrices(): ProductSalePrice[] {
    const search = this.searchText.trim().toLowerCase();

    return this.prices
      .filter(p => !search || p.productName?.toLowerCase().includes(search))
      .filter(p => !this.statusFilter || p.status === this.statusFilter);
  }

  onSort(column: keyof ProductSalePrice): void {
    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }

  get sortedPrices(): ProductSalePrice[] {
    return [...this.filteredPrices].sort((a, b) => {

      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === 'asc'
          ? valueA - valueB
          : valueB - valueA;
      }

      const aStr = (valueA ?? '').toString().toLowerCase();
      const bStr = (valueB ?? '').toString().toLowerCase();

      if (aStr < bStr)
        return this.sortDirection === 'asc' ? -1 : 1;

      if (aStr > bStr)
        return this.sortDirection === 'asc' ? 1 : -1;

      return 0;
    });
  }

  get totalRecords(): number {
    return this.filteredPrices.length;
  }

  get pagedPrices(): ProductSalePrice[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedPrices.slice(start, start + this.pageSize);
  }

  serial(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  onSearch(value: string): void {
    this.searchText = value ?? '';
    this.currentPage = 1;
  }

  onStatusChange(value: string): void {
    this.statusFilter = value ?? '';
    this.currentPage = 1;
  }

  onClear(): void {
    this.searchText = '';
    this.statusFilter = '';
    this.currentPage = 1;
  }

  onAdd(): void {
    this.router.navigate(['/product/sale-price/form']);
  }

  onBack(): void {
    this.router.navigate(['/product']);
  }

  // ✅ FIXED EDIT NAVIGATION
  onEdit(row: ProductSalePrice): void {
    this.router.navigate(['/product/sale-price/form'], {
      queryParams: {
        productId: row.productId,
        mode: 'edit'
      }
    });
  }

  openHistory(row: ProductSalePrice): void {

    this.showHistory = true;
    this.selectedProductName = row.productName;
    this.historyLoading = true;

    this.apiService
      .getProductSalePriceHistory(row.productId)
      .subscribe({
        next: (res: any[]) => {

          this.historyData = (res ?? []).sort(
            (a, b) =>
              new Date(b.effectiveFrom).getTime() -
              new Date(a.effectiveFrom).getTime()
          );

          this.historyLoading = false;
        },
        error: () => {
          this.historyData = [];
          this.historyLoading = false;
        }
      });
  }

  closeHistory(): void {
    this.showHistory = false;
    this.selectedProductName = '';
    this.historyData = [];
  }
}