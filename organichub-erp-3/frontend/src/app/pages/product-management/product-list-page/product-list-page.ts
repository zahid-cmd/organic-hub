import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';

import { PaginationComponent } from '../../../components/pagination/pagination';
import { SearchArea } from '../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';

interface Product {
  id: number;
  productCode: string;
  productName: string;
  sku?: string;
  barcode?: string;
  unitName: string;
  categoryName: string;
  subCategoryName: string;
  status: string;
}

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    SearchArea,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './product-list-page.html',
  styleUrls: ['./product-list-page.css']
})
export class ProductListPageComponent implements OnInit {

  products: Product[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  sortColumn: keyof Product | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load products.';
        this.toast.error('Failed to load products.');
        this.loading = false;
      }
    });
  }

  onSort(column: keyof Product): void {

    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.products = [...this.products].sort((a, b) => {

      let valueA = (a[column] ?? '').toString().toLowerCase();
      let valueB = (b[column] ?? '').toString().toLowerCase();

      // IMPORTANT — numeric sorting after removing P-
      if (column === 'productCode') {
        valueA = valueA.replace(/^p-/i, '');
        valueB = valueB.replace(/^p-/i, '');
      }

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.currentPage = 1;
  }

  get filteredProducts(): Product[] {

    const search = this.searchText.trim().toLowerCase();

    return this.products
      .filter(p =>
        (!search ||
          p.productCode?.toLowerCase().includes(search) ||
          p.productName?.toLowerCase().includes(search) ||
          p.categoryName?.toLowerCase().includes(search) ||
          p.subCategoryName?.toLowerCase().includes(search))
      )
      .filter(p =>
        !this.statusFilter || p.status === this.statusFilter
      );
  }

  get totalRecords(): number {
    return this.filteredProducts.length;
  }

  get pagedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  serial(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
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
    this.router.navigate(['/product/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onBack(): void {
    this.router.navigate(['/dashboard']);
  }

  onView(product: Product): void {
    this.router.navigate(['/product/form'], {
      queryParams: { mode: 'view', id: product.id }
    });
  }

  onEdit(product: Product): void {
    this.router.navigate(['/product/form'], {
      queryParams: { mode: 'edit', id: product.id }
    });
  }

  onDelete(product: Product): void {

    this.toast.confirm(
      `Delete product "${product.productName}"?`,
      () => this.executeDelete(product.id)
    );
  }

  private executeDelete(id: number): void {

    this.apiService.deleteProduct(id).subscribe({
      next: () => {
        this.toast.success('Product deleted successfully.');
        this.products = this.products.filter(p => p.id !== id);
      },
      error: () => {
        this.toast.error('Delete failed.');
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }
}