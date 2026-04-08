import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { SearchArea } from '../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';

interface Customer {
  id: number;
  customerCode: string;
  customerName: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  status: string;
  remarks?: string | null;
}

@Component({
  selector: 'app-customer-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    SearchArea,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './customer-list-page.html',
  styleUrls: ['./customer-list-page.css']
})
export class CustomerListPageComponent implements OnInit {

  // =====================================================
  // DATA
  // =====================================================

  customers: Customer[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  // =====================================================
  // SORTING (STANDARD)
  // =====================================================

  sortColumn: keyof Customer = 'customerCode';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.loadCustomers();
  }

  // =====================================================
  // LOAD DATA
  // =====================================================

  loadCustomers(): void {

    this.loading = true;
    this.error = null;

    this.apiService.getCustomers().subscribe({

      next: (data: Customer[]) => {
        this.customers = data ?? [];
        this.currentPage = 1;
        this.loading = false;
      },

      error: (err) => {
        console.error('Load customers failed:', err);
        this.error = 'Failed to load customers.';
        this.toast.error('Failed to load customers.');
        this.loading = false;
      }

    });
  }

  // =====================================================
  // FILTERING
  // =====================================================

  get filteredCustomers(): Customer[] {

    const search = this.searchText.trim().toLowerCase();

    return this.customers
      .filter(c =>
        (!search ||
          c.customerCode?.toLowerCase().includes(search) ||
          c.customerName?.toLowerCase().includes(search) ||
          c.primaryPhone?.toLowerCase().includes(search))
      )
      .filter(c =>
        !this.statusFilter || c.status === this.statusFilter
      );
  }

  // =====================================================
  // SORTING
  // =====================================================

  onSort(column: keyof Customer): void {

    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
  }

  get sortedCustomers(): Customer[] {

    return [...this.filteredCustomers].sort((a, b) => {

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
    return this.filteredCustomers.length;
  }

  get pagedCustomers(): Customer[] {

    const start = (this.currentPage - 1) * this.pageSize;

    return this.sortedCustomers.slice(
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

  // =====================================================
  // SEARCH / FILTER EVENTS
  // =====================================================

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

  onAdd(): void {
    this.router.navigate(['/customer/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onBack(): void {
    this.router.navigate(['/dashboard']);
  }

  onView(customer: Customer): void {
    this.router.navigate(['/customer/form'], {
      queryParams: { mode: 'view', id: customer.id }
    });
  }

  onEdit(customer: Customer): void {
    this.router.navigate(['/customer/form'], {
      queryParams: { mode: 'edit', id: customer.id }
    });
  }

  // =====================================================
  // DELETE
  // =====================================================

  onDelete(customer: Customer): void {

    this.toast.confirm(
      `Are you sure you want to delete "${customer.customerName}"?`,
      () => this.executeDelete(customer.id)
    );
  }

  private executeDelete(id: number): void {

    this.apiService.deleteCustomer(id).subscribe({

      next: () => {

        this.toast.success('Customer deleted successfully.');

        this.customers =
          this.customers.filter(c => c.id !== id);

        if (this.currentPage > 1 &&
            this.pagedCustomers.length === 0) {
          this.currentPage--;
        }
      },

      error: (err) => {

        console.error('Delete failed:', err);

        const message =
          err?.error?.message ||
          'Cannot delete customer.';

        this.toast.error(message);
      }

    });
  }

}
