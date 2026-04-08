import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { SearchArea } from '../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';

interface ProductCategory {
  id: number;
  categoryCode: string;
  categoryName: string;

  // 🔹 Parent Product Type
  productTypeId: number;
  productTypeName: string;
  productTypeCode: string;

  status: string;
  remarks?: string | null;
}

@Component({
  selector: 'app-product-category-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    SearchArea,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './product-category-list-page.html',
  styleUrls: ['./product-category-list-page.css']
})
export class ProductCategoryListPageComponent implements OnInit {

  // =====================================================
  // DATA
  // =====================================================

  categories: ProductCategory[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  // =====================================================
  // SORTING (STANDARD BEHAVIOUR)
  // =====================================================

  sortColumn: keyof ProductCategory = 'categoryCode';
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
    this.loadCategories();
  }

  // =====================================================
  // LOAD DATA
  // =====================================================

  loadCategories(): void {

    this.loading = true;
    this.error = null;

    this.apiService.getCategories().subscribe({

      next: (data: ProductCategory[]) => {
        this.categories = data ?? [];
        this.currentPage = 1;
        this.loading = false;
      },

      error: (err) => {
        console.error('Load categories failed:', err);
        this.error = 'Failed to load categories.';
        this.toast.error('Failed to load categories.');
        this.loading = false;
      }

    });
  }

  // =====================================================
  // FILTERING
  // =====================================================

  get filteredCategories(): ProductCategory[] {

    const search = this.searchText.trim().toLowerCase();

    return this.categories
      .filter(c =>
        (!search ||
          c.categoryCode?.toLowerCase().includes(search) ||
          c.categoryName?.toLowerCase().includes(search) ||
          c.productTypeName?.toLowerCase().includes(search) ||
          c.productTypeCode?.toLowerCase().includes(search))
      )
      .filter(c =>
        !this.statusFilter || c.status === this.statusFilter
      );
  }

  // =====================================================
  // SORTING
  // =====================================================

  onSort(column: keyof ProductCategory): void {

    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
  }

  get sortedCategories(): ProductCategory[] {

    return [...this.filteredCategories].sort((a, b) => {

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
    return this.filteredCategories.length;
  }

  get pagedCategories(): ProductCategory[] {

    const start = (this.currentPage - 1) * this.pageSize;

    return this.sortedCategories.slice(
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
    this.router.navigate(['/product-category/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onBack(): void {
    this.router.navigate(['/product']);
  }

  onView(category: ProductCategory): void {
    this.router.navigate(['/product-category/form'], {
      queryParams: { mode: 'view', id: category.id }
    });
  }

  onEdit(category: ProductCategory): void {
    this.router.navigate(['/product-category/form'], {
      queryParams: { mode: 'edit', id: category.id }
    });
  }

  // =====================================================
  // DELETE
  // =====================================================

  onDelete(category: ProductCategory): void {

    this.toast.confirm(
      `Are you sure you want to delete "${category.categoryName}"?`,
      () => this.executeDelete(category.id)
    );
  }

  private executeDelete(id: number): void {

    this.apiService.deleteCategory(id).subscribe({

      next: (res: any) => {

        const message =
          res?.message || 'Category deleted successfully.';

        this.toast.success(message);

        this.categories =
          this.categories.filter(c => c.id !== id);

        if (this.currentPage > 1 &&
            this.pagedCategories.length === 0) {
          this.currentPage--;
        }
      },

      error: (err) => {

        console.error('Delete failed:', err);

        const message =
          err?.error?.message ||
          'Cannot delete category. Subcategories exist.';

        this.toast.error(message);
      }

    });
  }
}
