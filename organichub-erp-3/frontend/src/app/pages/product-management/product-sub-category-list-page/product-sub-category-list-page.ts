import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';

import { PaginationComponent } from '../../../components/pagination/pagination';
import { SearchArea } from '../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';

interface ProductSubCategory {
  id: number;
  subCategoryCode: string;
  subCategoryName: string;
  categoryId: number;
  categoryName: string;
  categoryCode: string;
  status: string;
}

@Component({
  selector: 'app-product-sub-category-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    SearchArea,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './product-sub-category-list-page.html',
  styleUrls: ['./product-sub-category-list-page.css']
})
export class ProductSubCategoryListPageComponent implements OnInit {

  subCategories: ProductSubCategory[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  sortColumn: keyof ProductSubCategory = 'subCategoryCode';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSubCategories();
  }

  loadSubCategories(): void {

    this.loading = true;
    this.error = null;

    this.apiService.getSubCategories().subscribe({

      next: (data: any[]) => {

        this.subCategories = data ?? [];
        this.currentPage = 1;
        this.loading = false;
      },

      error: () => {
        this.error = 'Failed to load sub categories.';
        this.toast.error(this.error);
        this.loading = false;
      }

    });
  }

  get filteredSubCategories(): ProductSubCategory[] {

    const search = this.searchText.trim().toLowerCase();

    return this.subCategories
      .filter(s =>
        !search ||
        s.subCategoryCode?.toLowerCase().includes(search) ||
        s.subCategoryName?.toLowerCase().includes(search) ||
        s.categoryName?.toLowerCase().includes(search)
      )
      .filter(s =>
        !this.statusFilter || s.status === this.statusFilter
      );
  }

  onSort(column: keyof ProductSubCategory): void {

    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
  }

  get sortedSubCategories(): ProductSubCategory[] {

    return [...this.filteredSubCategories].sort((a, b) => {

      const valueA = (a[this.sortColumn] ?? '').toString().toLowerCase();
      const valueB = (b[this.sortColumn] ?? '').toString().toLowerCase();

      if (valueA < valueB)
        return this.sortDirection === 'asc' ? -1 : 1;

      if (valueA > valueB)
        return this.sortDirection === 'asc' ? 1 : -1;

      return 0;
    });
  }

  get totalRecords(): number {
    return this.filteredSubCategories.length;
  }

  get pagedSubCategories(): ProductSubCategory[] {

    const start = (this.currentPage - 1) * this.pageSize;

    return this.sortedSubCategories.slice(
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

  onAdd(): void {
    this.router.navigate(['/product/sub-category/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onBack(): void {
    this.router.navigate(['/product']);
  }

  onView(row: ProductSubCategory): void {
    this.router.navigate(['/product/sub-category/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: ProductSubCategory): void {
    this.router.navigate(['/product/sub-category/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  onDelete(row: ProductSubCategory): void {

    this.toast.confirm(
      `Are you sure you want to delete "${row.subCategoryName}"?`,
      () => this.executeDelete(row)
    );
  }

  private executeDelete(row: ProductSubCategory): void {

    this.apiService.deleteSubCategory(row.id).subscribe({

      next: () => {

        this.toast.success('Sub category deleted successfully.');

        this.subCategories =
          this.subCategories.filter(s => s.id !== row.id);

        if (
          this.currentPage > 1 &&
          this.pagedSubCategories.length === 0
        ) {
          this.currentPage--;
        }
      },

      error: () => {
        this.toast.error(
          'Cannot delete sub category. Related records exist.'
        );
      }

    });
  }
}