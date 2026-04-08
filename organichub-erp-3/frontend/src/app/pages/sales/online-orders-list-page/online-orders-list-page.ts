import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';

import { PaginationComponent } from '../../../components/pagination/pagination';
import { SearchArea } from '../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';

interface OnlineOrder {
  id: number;
  orderNo: string;
  orderDate: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  status: string;
  isConverted: boolean;
}

@Component({
  selector: 'app-online-orders-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    SearchArea,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './online-orders-list-page.html',
  styleUrls: ['./online-orders-list-page.css']
})
export class OnlineOrdersListPageComponent implements OnInit {

  orders: OnlineOrder[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Pending', 'Confirmed', 'Cancelled', 'Converted'];

  loading = false;
  error: string | null = null;

  sortColumn: keyof OnlineOrder = 'orderNo';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getOnlineOrders().subscribe({
      next: (data: OnlineOrder[]) => {
        this.orders = data ?? [];
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load online orders.';
        this.toast.error('Failed to load online orders.');
        this.loading = false;
      }
    });
  }

  // =====================================================
  // FILTER
  // =====================================================

  get filteredOrders(): OnlineOrder[] {

    const search = this.searchText.trim().toLowerCase();

    return this.orders
      .filter(o =>
        (!search ||
          o.orderNo?.toLowerCase().includes(search) ||
          o.customerName?.toLowerCase().includes(search) ||
          o.phone?.toLowerCase().includes(search))
      )
      .filter(o =>
        !this.statusFilter || o.status === this.statusFilter
      );
  }

  // =====================================================
  // SORT
  // =====================================================

  onSort(column: keyof OnlineOrder): void {

    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
  }

  get sortedOrders(): OnlineOrder[] {

    return [...this.filteredOrders].sort((a, b) => {

      let valueA = a[this.sortColumn];
      let valueB = b[this.sortColumn];

      if (valueA == null) valueA = '';
      if (valueB == null) valueB = '';

      const aStr = valueA.toString().toLowerCase();
      const bStr = valueB.toString().toLowerCase();

      if (aStr < bStr)
        return this.sortDirection === 'asc' ? -1 : 1;

      if (aStr > bStr)
        return this.sortDirection === 'asc' ? 1 : -1;

      return 0;
    });
  }

  // =====================================================
  // PAGINATION
  // =====================================================

  get totalRecords(): number {
    return this.filteredOrders.length;
  }

  get pagedOrders(): OnlineOrder[] {

    const start = (this.currentPage - 1) * this.pageSize;

    return this.sortedOrders.slice(
      start,
      start + this.pageSize
    );
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

  // =====================================================
  // NAVIGATION
  // =====================================================

  onView(row: OnlineOrder): void {
    this.router.navigate(['/sales/online-orders/view', row.id]);
  }

  onBack(): void {
    this.router.navigate(['/sales']);
  }

  onRefresh(): void {
  this.loadOrders();
  this.toast.success('Orders refreshed.');
  }
}
