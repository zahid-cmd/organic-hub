import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SearchArea } from '../../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

interface AccountGroup {
  id: number;
  groupCode: string;
  groupName: string;
  classCode: string;
  classMode: string;
  accountClassName: string;
  status: string;
}

@Component({
  selector: 'app-account-group-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchArea,
    PageSubHeaderComponent,
    PaginationComponent,
    OrganicToast
  ],
  templateUrl: './account-group-list-page.html',
  styleUrls: ['./account-group-list-page.css']
})
export class AccountGroupListPageComponent implements OnInit {

  groups: AccountGroup[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  // ✅ STRICT-SAFE SORTING
  sortField: keyof AccountGroup | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  // =====================================================
  // LOAD GROUPS
  // =====================================================
  loadGroups(): void {

    this.loading = true;
    this.error = null;

    this.apiService.getAccountGroups().subscribe({
      next: (data: any[]) => {

        this.groups = (data ?? []).map(g => ({
          id: g.id,
          groupCode: g.groupCode,
          groupName: g.groupName,
          classCode: g.accountClass?.classCode ?? '',
          classMode: g.accountClass?.classMode ?? '',
          accountClassName: g.accountClass?.className ?? '',
          status: g.status
        }));

        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load account groups.';
        this.loading = false;
        this.toast.error(this.error);
      }
    });
  }

  // =====================================================
  // SORTING
  // =====================================================
  onSort(field: keyof AccountGroup): void {

    if (this.sortField === field) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  get sortedGroups(): AccountGroup[] {

    if (!this.sortField) return this.filteredGroups;

    return [...this.filteredGroups].sort((a, b) => {

      const aValue = (a[this.sortField!] ?? '')
        .toString()
        .toLowerCase();

      const bValue = (b[this.sortField!] ?? '')
        .toString()
        .toLowerCase();

      if (aValue < bValue)
        return this.sortDirection === 'asc' ? -1 : 1;

      if (aValue > bValue)
        return this.sortDirection === 'asc' ? 1 : -1;

      return 0;
    });
  }

  // =====================================================
  // FILTERING
  // =====================================================
  get filteredGroups(): AccountGroup[] {

    const search = this.searchText.toLowerCase();

    return this.groups
      .filter(g =>
        (!search ||
          g.groupCode?.toLowerCase().includes(search) ||
          g.groupName?.toLowerCase().includes(search) ||
          g.accountClassName?.toLowerCase().includes(search))
      )
      .filter(g =>
        !this.statusFilter || g.status === this.statusFilter
      );
  }

  get totalRecords(): number {
    return this.sortedGroups.length;
  }

  get pagedGroups(): AccountGroup[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedGroups.slice(start, start + this.pageSize);
  }

  serial(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  // =====================================================
  // SEARCH & FILTER
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
    this.router.navigate(['/account-group/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onView(row: AccountGroup): void {
    this.router.navigate(['/account-group/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: AccountGroup): void {
    this.router.navigate(['/account-group/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  onDelete(row: AccountGroup): void {

    this.toast.confirm(
      `Delete "${row.groupName}"?`,
      () => {

        this.apiService.deleteAccountGroup(row.id).subscribe({
          next: () => {
            this.toast.success('Deleted successfully.');
            this.loadGroups();
          },
          error: () => {
            this.toast.error('Delete failed.');
          }
        });

      }
    );
  }

  onBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // =====================================================
  // PAGINATION
  // =====================================================
  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }
}