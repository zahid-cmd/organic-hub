import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { SearchArea } from '../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { PaginationComponent } from '../../../components/pagination/pagination'; // ✅ ADDED
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';

interface ProductType {
  id: number;
  typeCode: string;
  typeName: string;
  status: string;
  remarks: string | null;

  isRawMaterial: boolean;
  isFinishedProduct: boolean;
  isPackingMaterial: boolean;

  isPurchasable: boolean;
  isSellable: boolean;
  isProductionItem: boolean;

  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

@Component({
  selector: 'app-product-type-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchArea,
    PageSubHeaderComponent,
    PaginationComponent, // ✅ ADDED
    OrganicToast
  ],
  templateUrl: './product-type-list-page.html',
  styleUrls: ['./product-type-list-page.css']
})
export class ProductTypeListPageComponent implements OnInit {

  productTypes: ProductType[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  sortColumn: keyof ProductType = 'typeCode';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProductTypes();
  }

  // ======================================================
  // LOAD
  // ======================================================

  loadProductTypes(): void {

    this.loading = true;
    this.error = null;

    this.apiService.getProductTypes().subscribe({

      next: (data: ProductType[]) => {
        this.productTypes = data ?? [];
        this.currentPage = 1;
        this.loading = false;
      },

      error: () => {
        this.error = 'Failed to load product types.';
        this.toast.error(this.error);
        this.loading = false;
      }

    });
  }

  // ======================================================
  // FILTER
  // ======================================================

  get filtered(): ProductType[] {

    const search = this.searchText.trim().toLowerCase();

    return this.productTypes
      .filter(p =>
        (!search ||
          p.typeCode?.toLowerCase().includes(search) ||
          p.typeName?.toLowerCase().includes(search))
      )
      .filter(p =>
        !this.statusFilter || p.status === this.statusFilter
      );
  }

  // ======================================================
  // SORT
  // ======================================================

  onSort(column: keyof ProductType): void {

    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
  }

  get sorted(): ProductType[] {

    return [...this.filtered].sort((a, b) => {

      let aVal: any = a[this.sortColumn];
      let bVal: any = b[this.sortColumn];

      if (typeof aVal === 'boolean') {
        aVal = aVal ? 1 : 0;
        bVal = bVal ? 1 : 0;
      }

      aVal = (aVal ?? '').toString().toLowerCase();
      bVal = (bVal ?? '').toString().toLowerCase();

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // ======================================================
  // PAGINATION
  // ======================================================

  get totalRecords(): number {
    return this.sorted.length;
  }

  get paged(): ProductType[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sorted.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  serial(i: number): number {
    return (this.currentPage - 1) * this.pageSize + i + 1;
  }

  // ======================================================
  // SEARCH / FILTER
  // ======================================================

  onSearch(v: string): void {
    this.searchText = v ?? '';
    this.currentPage = 1;
  }

  onStatusChange(v: string): void {
    this.statusFilter = v ?? '';
    this.currentPage = 1;
  }

  onClear(): void {
    this.searchText = '';
    this.statusFilter = '';
    this.currentPage = 1;
  }

  // ======================================================
  // ACTIONS
  // ======================================================

  onAdd(): void {
    this.router.navigate(['/product-type/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onView(row: ProductType): void {
    this.router.navigate(['/product-type/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: ProductType): void {
    this.router.navigate(['/product-type/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  onDelete(row: ProductType): void {

    this.toast.confirm(
      `Delete "${row.typeName}"?`,
      () => {

        this.apiService.deleteProductType(row.id).subscribe({

          next: () => {
            this.toast.success('Deleted successfully.');
            this.loadProductTypes();
          },

          error: (err) => {
            const msg =
              err?.error?.message ||
              'Cannot delete product type.';
            this.toast.error(msg);
          }

        });

      }
    );
  }

  onBack(): void {
    this.router.navigate(['/product']);
  }
}