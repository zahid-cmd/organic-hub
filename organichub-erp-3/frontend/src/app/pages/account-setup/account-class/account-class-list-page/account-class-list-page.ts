import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SearchArea } from '../../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { ApiService } from '../../../../services/api.service';

interface AccountClass {
  id: number;
  classCode: string;
  className: string;
  classMode: string;
  status: string;
  remarks?: string | null;
}

@Component({
  selector: 'app-account-class-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchArea,
    PageSubHeaderComponent,
    OrganicToast,
    PaginationComponent
  ],
  templateUrl: './account-class-list-page.html',
  styleUrls: ['./account-class-list-page.css']
})
export class AccountClassListPageComponent implements OnInit {

  classes: AccountClass[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  sortColumn: keyof AccountClass = 'classCode';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private toast: ToastService,
    private apiService: ApiService
  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.loadClasses();
  }

  // =====================================================
  // LOAD FROM API
  // =====================================================

  loadClasses(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getAccountClasses()
      .subscribe({
        next: (data: AccountClass[]) => {
          this.classes = data;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load account classes.';
          this.toast.error(this.error);
          this.loading = false;
        }
      });
  }

  // =====================================================
  // FILTER
  // =====================================================

  get filteredClasses(): AccountClass[] {
    const search = this.searchText.trim().toLowerCase();

    return this.classes
      .filter(c =>
        (!search ||
          c.classCode?.toLowerCase().includes(search) ||
          c.className?.toLowerCase().includes(search) ||
          c.classMode?.toLowerCase().includes(search))
      )
      .filter(c =>
        !this.statusFilter || c.status === this.statusFilter
      );
  }

  // =====================================================
  // SORT
  // =====================================================

  onSort(column: keyof AccountClass): void {
    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }

  get sortedClasses(): AccountClass[] {
    return [...this.filteredClasses].sort((a, b) => {
      const aVal = (a[this.sortColumn] ?? '').toString().toLowerCase();
      const bVal = (b[this.sortColumn] ?? '').toString().toLowerCase();

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // =====================================================
  // PAGINATION
  // =====================================================

  get totalRecords(): number {
    return this.filteredClasses.length;
  }

  get pagedClasses(): AccountClass[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedClasses.slice(start, start + this.pageSize);
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
  // SEARCH & FILTER EVENTS
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
    this.router.navigate(['/account-class/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onBack(): void {
    this.router.navigate(['/dashboard']);
  }

  onView(row: AccountClass): void {
    this.router.navigate(['/account-class/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: AccountClass): void {
    this.router.navigate(['/account-class/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  // =====================================================
  // DELETE (SOFT DELETE VIA API)
  // =====================================================

  onDelete(row: AccountClass): void {
    this.toast.confirm(
      `Delete "${row.className}"?`,
      () => {

        this.apiService.deleteAccountClass(row.id)
          .subscribe({
            next: (res: any) => {
              this.toast.success(res?.message || 'Deleted successfully.');
              this.loadClasses(); // reload from DB
            },
            error: () => {
              this.toast.error('Delete failed.');
            }
          });

      }
    );
  }
}