import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SearchArea } from '../../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

interface MfsAccount {
  id: number;
  accountCode: string;
  accountName: string;
  shortAccountName: string;
  walletOrMerchantNumber: string;
  mfsLedgerName: string;
  branchId: number;
  branchName: string;
  isCollectionAccount: boolean;
  isPaymentAccount: boolean;
  status: string;
}

@Component({
  selector: 'app-mfs-account-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchArea,
    PageSubHeaderComponent,
    PaginationComponent,
    OrganicToast
  ],
  templateUrl: './mfs-account-list-page.html',
  styleUrls: ['./mfs-account-list-page.css']
})
export class MfsAccountListPageComponent implements OnInit {

  accounts: MfsAccount[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;

  sortField: keyof MfsAccount | null = null;
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
    this.loadAccounts();
  }

  // =====================================================
  // LOAD DATA
  // =====================================================
  loadAccounts(): void {

    this.loading = true;

    this.apiService.getMfsAccounts().subscribe({
      next: (data: any[]) => {

        this.accounts = (data ?? []).map(a => ({
          id: a.id,
          accountCode: a.accountCode,
          accountName: a.accountName,
          shortAccountName: a.shortAccountName,
          walletOrMerchantNumber: a.walletOrMerchantNumber,
          mfsLedgerName: a.mfsLedgerName,
          branchId: a.branchId,
          branchName: a.branchName ?? '', // 🔥 FIXED
          isCollectionAccount: a.isCollectionAccount,
          isPaymentAccount: a.isPaymentAccount,
          status: a.status
        }));

        this.loading = false;
      },
      error: () => {
        this.accounts = [];
        this.loading = false;
        this.toast.error('Failed to load MFS accounts.');
      }
    });
  }

  // =====================================================
  // FILTER + SORT
  // =====================================================
  get filtered(): MfsAccount[] {

    let result = this.accounts;

    const search = this.searchText.toLowerCase();

    // SEARCH
    result = result.filter(a =>
      (!search ||
        a.accountCode?.toLowerCase().includes(search) ||
        a.accountName?.toLowerCase().includes(search) ||
        a.mfsLedgerName?.toLowerCase().includes(search) ||
        a.branchName?.toLowerCase().includes(search))
    );

    // STATUS FILTER
    result = result.filter(a =>
      !this.statusFilter || a.status === this.statusFilter
    );

    // SORT
    if (this.sortField) {

      result = [...result].sort((a, b) => {

        const valueA = a[this.sortField!];
        const valueB = b[this.sortField!];

        if (valueA == null) return 1;
        if (valueB == null) return -1;

        if (typeof valueA === 'string') {
          return this.sortDirection === 'asc'
            ? valueA.localeCompare(valueB as string)
            : (valueB as string).localeCompare(valueA);
        }

        return this.sortDirection === 'asc'
          ? (valueA > valueB ? 1 : -1)
          : (valueA < valueB ? 1 : -1);
      });
    }

    return result;
  }

  // =====================================================
  // PAGINATION
  // =====================================================
  get totalRecords(): number {
    return this.filtered.length;
  }

  get paged(): MfsAccount[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  serial(i: number): number {
    return (this.currentPage - 1) * this.pageSize + i + 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  // =====================================================
  // HEADER ACTIONS
  // =====================================================
  onAdd(): void {
    this.router.navigate(['/mfs-account/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onClear(): void {
    this.searchText = '';
    this.statusFilter = '';
    this.currentPage = 1;
  }

  onBack(): void {
    this.router.navigate(['/dashboard']);
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

  // =====================================================
  // SORT
  // =====================================================
  onSort(field: keyof MfsAccount): void {

    if (this.sortField === field) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  // =====================================================
  // ROW ACTIONS
  // =====================================================
  onView(row: MfsAccount): void {
    this.router.navigate(['/mfs-account/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: MfsAccount): void {
    this.router.navigate(['/mfs-account/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  onDelete(row: MfsAccount): void {

    this.toast.confirm(
      `Delete "${row.mfsLedgerName}"?`,
      () => {
        this.apiService.deleteMfsAccount(row.id).subscribe({
          next: () => {
            this.toast.success('Deleted successfully.');
            this.loadAccounts();
          },
          error: () => {
            this.toast.error('Delete failed.');
          }
        });
      }
    );
  }
}