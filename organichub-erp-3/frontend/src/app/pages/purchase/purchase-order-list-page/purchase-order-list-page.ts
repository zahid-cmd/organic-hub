import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { SearchArea } from '../../../components/search-area/search-area';
import { PaginationComponent } from '../../../components/pagination/pagination';

@Component({
  selector: 'app-purchase-order-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PageSubHeaderComponent,
    SearchArea,
    PaginationComponent
  ],
  templateUrl: './purchase-order-list-page.html',
  styleUrls: ['./purchase-order-list-page.css'],
})
export class PurchaseOrderListPage implements OnInit {

  constructor(
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {}

  loading = false;

  searchText = '';
  statusFilter = '';

  statusOptions = ['Approved', 'Draft'];

  pageSize = 10;
  currentPage = 1;
  totalRecords = 0;

  orders: any[] = [];
  private filteredOrders: any[] = [];
  pagedOrders: any[] = [];

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {

    this.loading = true;

    this.api.getPurchaseOrders().subscribe({
      next: (data: any[]) => {

        this.orders = data || [];
        this.currentPage = 1;
        this.applyFiltersAndPaging();
        this.loading = false;

      },
      error: (err: any) => {

        console.error('Failed to load purchase orders', err);
        this.toast.error('Failed to load purchase orders.');
        this.loading = false;

      }
    });

  }

  onSearch(value: string): void {
    this.searchText = (value ?? '').toLowerCase();
    this.currentPage = 1;
    this.applyFiltersAndPaging();
  }

  onStatusChange(value: string): void {
    this.statusFilter = value ?? '';
    this.currentPage = 1;
    this.applyFiltersAndPaging();
  }

  onClear(): void {
    this.searchText = '';
    this.statusFilter = '';
    this.currentPage = 1;
    this.applyFiltersAndPaging();
  }

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

    this.filteredOrders = this.orders.filter(o => {

      const matchText =
        !text ||
        o.orderNo?.toLowerCase().includes(text) ||
        o.supplierName?.toLowerCase().includes(text);

      const matchStatus =
        !this.statusFilter || o.status === this.statusFilter;

      return matchText && matchStatus;
    });

    this.totalRecords = this.filteredOrders.length;
    this.applyPaging();
  }

  private applyPaging(): void {

    const start = (this.currentPage - 1) * this.pageSize;

    this.pagedOrders =
      this.filteredOrders.slice(start, start + this.pageSize);
  }

  onAdd(): void {
    this.router.navigate(['/purchase/order/form']);
  }

  onBack(): void {
    this.router.navigate(['/purchase']);
  }

  onView(order: any): void {
    this.router.navigate(['/purchase/order/form'], {
      queryParams: { mode: 'view', id: order.id }
    });
  }

  onEdit(order: any): void {
    this.router.navigate(['/purchase/order/form'], {
      queryParams: { mode: 'edit', id: order.id }
    });
  }

  onOrderPrint(index: number): void {

    const order = this.pagedOrders[index];
    if (!order) return;

    const url = `/print/purchase-order/${order.id}`;
    window.open(url, '_blank');

  }

}