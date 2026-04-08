import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SearchArea } from '../../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

interface PosAccount {
  id: number;
  accountCode: string;
  accountName: string;                 // Ledger Name
  terminalOrMerchantId: string;

  branchId: number;
  branchName: string;

  linkedBankAccountId?: number;
  linkedBankAccountName?: string;

  isCollectionAccount: boolean;
  isPaymentAccount: boolean;
  status: string;
}

@Component({
  selector: 'app-pos-account-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchArea,
    PageSubHeaderComponent,
    PaginationComponent,
    OrganicToast
  ],
  templateUrl: './pos-account-list-page.html',
  styleUrls: ['./pos-account-list-page.css']
})
export class PosAccountListPageComponent implements OnInit {

  accounts: PosAccount[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;

  sortField: keyof PosAccount | null = null;
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
  // LOAD
  // =====================================================
  loadAccounts(): void {

    this.loading = true;

    this.apiService.getPosAccounts().subscribe({
      next: (data: any[]) => {

        this.accounts = (data ?? []).map(a => ({
          id: a.id,
          accountCode: a.accountCode,
          accountName: a.accountName,
          terminalOrMerchantId: a.terminalOrMerchantId,

          branchId: a.branchId,
          branchName: a.branchName ?? '',

          linkedBankAccountId: a.linkedBankAccountId,
          linkedBankAccountName: a.linkedBankAccountName ?? '',

          isCollectionAccount: a.isCollectionAccount,
          isPaymentAccount: a.isPaymentAccount,
          status: a.status
        }));

        this.loading = false;
      },
      error: () => {
        this.accounts = [];
        this.loading = false;
        this.toast.error('Failed to load POS accounts.');
      }
    });
  }

  // =====================================================
  // FILTER
  // =====================================================
  get filtered(): PosAccount[] {

    let result = this.accounts;
    const search = this.searchText.toLowerCase();

    result = result.filter(a =>
      (!search ||
        a.accountCode?.toLowerCase().includes(search) ||
        a.accountName?.toLowerCase().includes(search) ||
        a.terminalOrMerchantId?.toLowerCase().includes(search) ||
        a.branchName?.toLowerCase().includes(search) ||
        a.linkedBankAccountName?.toLowerCase().includes(search))
    );

    result = result.filter(a =>
      !this.statusFilter || a.status === this.statusFilter
    );

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

  get paged(): PosAccount[] {
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
    this.router.navigate(['/pos-account/form'], {
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
  onSort(field: keyof PosAccount): void {

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
  onView(row: PosAccount): void {
    this.router.navigate(['/pos-account/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: PosAccount): void {
    this.router.navigate(['/pos-account/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  onDelete(row: PosAccount): void {

    this.toast.confirm(
      `Delete "${row.accountName}"?`,
      () => {
        this.apiService.deletePosAccount(row.id).subscribe({
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