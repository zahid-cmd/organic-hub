import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { SearchArea } from '../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';

interface Warehouse {
  id: number;
  warehouseCode: string;
  warehouseName: string;
  companyName: string;
  branchName: string;
  isDefault: boolean;
  status: string;
}

@Component({
  selector: 'app-warehouse-setup-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchArea,
    PageSubHeaderComponent,
    PaginationComponent, // ✅ Added
    OrganicToast
  ],
  templateUrl: './warehouse-setup-list-page.html',
  styleUrls: ['./warehouse-setup-list-page.css']
})
export class WarehouseSetupListPageComponent implements OnInit {

  warehouses: Warehouse[] = [];

  isLoading = false;
  loadError = '';

  // ==========================
  // PAGINATION STATE
  // ==========================
  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // =====================================================
  // LOAD DATA
  // =====================================================
  private loadData(): void {

    this.isLoading = true;
    this.loadError = '';

    this.api.getWarehouses().subscribe({
      next: (data) => {
        this.warehouses = data ?? [];
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Failed to load warehouses.';
        this.toast.error(this.loadError);
        this.isLoading = false;
      }
    });
  }

  // =====================================================
  // FILTER
  // =====================================================
  get filteredWarehouses(): Warehouse[] {

    const search = this.searchText.trim().toLowerCase();

    return this.warehouses.filter(w =>
      (
        (w.warehouseCode ?? '') +
        (w.warehouseName ?? '') +
        (w.companyName ?? '') +
        (w.branchName ?? '')
      )
        .toLowerCase()
        .includes(search) &&
      (!this.statusFilter || w.status === this.statusFilter)
    );
  }

  // =====================================================
  // PAGINATION
  // =====================================================
  get totalRecords(): number {
    return this.filteredWarehouses.length;
  }

  get pagedWarehouses(): Warehouse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredWarehouses.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  serial(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  // =====================================================
  // SEARCH / FILTER
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
    this.router.navigate(['/general-setup/warehouse-setup/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onView(row: Warehouse): void {
    this.router.navigate(['/general-setup/warehouse-setup/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: Warehouse): void {
    this.router.navigate(['/general-setup/warehouse-setup/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  // =====================================================
  // DELETE
  // =====================================================
  onDelete(row: Warehouse): void {

    this.toast.confirm(
      `Are you sure you want to delete "${row.warehouseName}"?`,
      () => this.executeDelete(row)
    );
  }

  private executeDelete(row: Warehouse): void {

    this.api.deleteWarehouse(row.id).subscribe({

      next: (res: any) => {

        const message =
          res?.message || 'Warehouse deleted successfully.';

        this.toast.success(message);

        this.warehouses =
          this.warehouses.filter(w => w.id !== row.id);

      },

      error: (err) => {

        const message =
          err?.error?.message ||
          'Cannot delete warehouse. Related records exist.';

        this.toast.error(message);
      }

    });
  }

  onBack(): void {
    this.router.navigate(['/general-setup']);
  }

}