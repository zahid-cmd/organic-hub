import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SearchArea } from '../../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

interface AccountSubGroup {
  id: number;
  subGroupCode: string;
  subGroupName: string;
  groupCode: string;
  groupName: string;
  status: string;
}

@Component({
  selector: 'app-account-subgroup-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchArea,
    PageSubHeaderComponent,
    PaginationComponent,
    OrganicToast
  ],
  templateUrl: './account-subgroup-list-page.html',
  styleUrls: ['./account-subgroup-list-page.css']
})
export class AccountSubgroupListPageComponent implements OnInit {

  subGroups: AccountSubGroup[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  // ✅ SORTING (STRICT SAFE)
  sortField: keyof AccountSubGroup | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSubGroups();
  }

  // =====================================================
  // LOAD
  // =====================================================
  loadSubGroups(): void {

    this.loading = true;
    this.error = null;

    this.apiService.getAccountSubGroups().subscribe({
      next: (data: any[]) => {

        this.subGroups = (data ?? []).map(s => ({
          id: s.id,
          subGroupCode: s.subGroupCode,
          subGroupName: s.subGroupName,
          groupCode: s.accountGroup?.groupCode ?? '',
          groupName: s.accountGroup?.groupName ?? '',
          status: s.status
        }));

        this.loading = false;
      },
      error: () => {

        this.subGroups = [];
        this.loading = false;

        this.toast.error('Failed to load account sub-groups.');
      }
    });
  }

  // =====================================================
  // SORTING
  // =====================================================
  onSort(field: keyof AccountSubGroup): void {

    if (this.sortField === field) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  get sortedSubGroups(): AccountSubGroup[] {

    if (!this.sortField) return this.filteredSubGroups;

    return [...this.filteredSubGroups].sort((a, b) => {

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
  // FILTER
  // =====================================================
  get filteredSubGroups(): AccountSubGroup[] {

    const search = this.searchText.toLowerCase();

    return this.subGroups
      .filter(s =>
        (!search ||
          s.subGroupCode?.toLowerCase().includes(search) ||
          s.subGroupName?.toLowerCase().includes(search) ||
          s.groupName?.toLowerCase().includes(search))
      )
      .filter(s =>
        !this.statusFilter || s.status === this.statusFilter
      );
  }

  get totalRecords(): number {
    return this.sortedSubGroups.length;
  }

  get pagedSubGroups(): AccountSubGroup[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedSubGroups.slice(start, start + this.pageSize);
  }

  serial(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  // =====================================================
  // SEARCH
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
    this.router.navigate(['/account-subgroup/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onView(row: AccountSubGroup): void {
    this.router.navigate(['/account-subgroup/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: AccountSubGroup): void {
    this.router.navigate(['/account-subgroup/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  onDelete(row: AccountSubGroup): void {

    this.toast.confirm(
      `Delete "${row.subGroupName}"?`,
      () => {

        this.apiService.deleteAccountSubGroup(row.id).subscribe({
          next: () => {
            this.toast.success('Deleted successfully.');
            this.loadSubGroups();
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