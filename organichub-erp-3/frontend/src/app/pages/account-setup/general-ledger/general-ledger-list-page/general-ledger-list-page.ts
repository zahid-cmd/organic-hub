import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SearchArea } from '../../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

interface GeneralLedger {
  id: number;
  ledgerCode: string;
  ledgerName: string;
  subGroupCode: string;
  subGroupName: string;
  groupCode: string;
  groupName: string;
  status: string;
}

@Component({
  selector: 'app-general-ledger-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchArea,
    PageSubHeaderComponent,
    PaginationComponent,
    OrganicToast
  ],
  templateUrl: './general-ledger-list-page.html',
  styleUrls: ['./general-ledger-list-page.css']
})
export class GeneralLedgerListPageComponent implements OnInit {

  ledgers: GeneralLedger[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  // ✅ SORTING (STRICT SAFE)
  sortField: keyof GeneralLedger | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadLedgers();
  }

  // =====================================================
  // LOAD
  // =====================================================
  loadLedgers(): void {

    this.loading = true;
    this.error = null;

    this.apiService.getGeneralLedgers().subscribe({
      next: (data: any[]) => {

        this.ledgers = (data ?? []).map(l => ({
          id: l.id,
          ledgerCode: l.ledgerCode,
          ledgerName: l.ledgerName,
          subGroupCode: l.accountSubGroup?.subGroupCode ?? '',
          subGroupName: l.accountSubGroup?.subGroupName ?? '',
          groupCode: l.accountSubGroup?.accountGroup?.groupCode ?? '',
          groupName: l.accountSubGroup?.accountGroup?.groupName ?? '',
          status: l.status
        }));

        this.loading = false;
      },
      error: () => {
        this.ledgers = [];
        this.loading = false;
        this.toast.error('Failed to load general ledgers.');
      }
    });
  }

  // =====================================================
  // SORTING
  // =====================================================
  onSort(field: keyof GeneralLedger): void {

    if (this.sortField === field) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  get sortedLedgers(): GeneralLedger[] {

    if (!this.sortField) return this.filteredLedgers;

    return [...this.filteredLedgers].sort((a, b) => {

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
  get filteredLedgers(): GeneralLedger[] {

    const search = this.searchText.toLowerCase();

    return this.ledgers
      .filter(l =>
        (!search ||
          l.ledgerCode?.toLowerCase().includes(search) ||
          l.ledgerName?.toLowerCase().includes(search) ||
          l.subGroupCode?.toLowerCase().includes(search) ||
          l.subGroupName?.toLowerCase().includes(search) ||
          l.groupCode?.toLowerCase().includes(search) ||
          l.groupName?.toLowerCase().includes(search))
      )
      .filter(l =>
        !this.statusFilter || l.status === this.statusFilter
      );
  }

  get totalRecords(): number {
    return this.sortedLedgers.length;
  }

  get pagedLedgers(): GeneralLedger[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedLedgers.slice(start, start + this.pageSize);
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
    this.router.navigate(['/general-ledger/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onView(row: GeneralLedger): void {
    this.router.navigate(['/general-ledger/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: GeneralLedger): void {
    this.router.navigate(['/general-ledger/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  onDelete(row: GeneralLedger): void {

    this.toast.confirm(
      `Delete "${row.ledgerName}"?`,
      () => {

        this.apiService.deleteGeneralLedger(row.id).subscribe({
          next: () => {
            this.toast.success('Deleted successfully.');
            this.loadLedgers();
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