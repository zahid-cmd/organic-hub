import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { SearchArea } from '../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';

interface Supplier {
  id: number;
  supplierCode: string;
  supplierName: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  status: string;
  remarks?: string | null;
  contactPerson?: string | null;

}

@Component({
  selector: 'app-supplier-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    SearchArea,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './supplier-list-page.html',
  styleUrls: ['./supplier-list-page.css']
})
export class SupplierListPageComponent implements OnInit {

  // =====================================================
  // DATA
  // =====================================================

  suppliers: Supplier[] = [];

  pageSize = 10;                // 🔒 Standard 10 records
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  // =====================================================
  // SORTING (STANDARD)
  // =====================================================

  sortColumn: keyof Supplier = 'supplierCode';
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
    this.loadSuppliers();
  }

  // =====================================================
  // LOAD DATA
  // =====================================================

  loadSuppliers(): void {

    this.loading = true;
    this.error = null;

    this.apiService.getSuppliers().subscribe({

      next: (data: Supplier[]) => {
        this.suppliers = data ?? [];
        this.currentPage = 1;
        this.loading = false;
      },

      error: (err) => {
        console.error('Load suppliers failed:', err);
        this.error = 'Failed to load suppliers.';
        this.toast.error('Failed to load suppliers.');
        this.loading = false;
      }

    });
  }

  // =====================================================
  // FILTERING
  // =====================================================

  get filteredSuppliers(): Supplier[] {

    const search = this.searchText.trim().toLowerCase();

    return this.suppliers
      .filter(s =>
        (!search ||
          s.supplierCode?.toLowerCase().includes(search) ||
          s.supplierName?.toLowerCase().includes(search) ||
          s.primaryPhone?.toLowerCase().includes(search))
      )
      .filter(s =>
        !this.statusFilter || s.status === this.statusFilter
      );
  }

  // =====================================================
  // SORTING
  // =====================================================

  onSort(column: keyof Supplier): void {

    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
  }

  get sortedSuppliers(): Supplier[] {

    return [...this.filteredSuppliers].sort((a, b) => {

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
  // PAGINATION (STANDARD)
  // =====================================================

  get totalRecords(): number {
    return this.filteredSuppliers.length;
  }

  get pagedSuppliers(): Supplier[] {

    const start = (this.currentPage - 1) * this.pageSize;

    return this.sortedSuppliers.slice(
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
    this.router.navigate(['/supplier/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onBack(): void {
    this.router.navigate(['/dashboard']);
  }

  onView(supplier: Supplier): void {
    this.router.navigate(['/supplier/form'], {
      queryParams: { mode: 'view', id: supplier.id }
    });
  }

  onEdit(supplier: Supplier): void {
    this.router.navigate(['/supplier/form'], {
      queryParams: { mode: 'edit', id: supplier.id }
    });
  }

  // =====================================================
  // DELETE (STANDARD TOAST CONFIRM)
  // =====================================================

  onDelete(supplier: Supplier): void {

    this.toast.confirm(
      `Are you sure you want to delete "${supplier.supplierName}"?`,
      () => this.executeDelete(supplier.id)
    );
  }

  private executeDelete(id: number): void {

    this.apiService.deleteSupplier(id).subscribe({

      next: () => {

        this.toast.success('Supplier deleted successfully.');

        this.suppliers =
          this.suppliers.filter(s => s.id !== id);

        // Adjust page if last item removed
        if (this.currentPage > 1 &&
            this.pagedSuppliers.length === 0) {
          this.currentPage--;
        }
      },

      error: (err) => {

        console.error('Delete failed:', err);

        const message =
          err?.error?.message ||
          'Cannot delete supplier.';

        this.toast.error(message);
      }

    });
  }

}
