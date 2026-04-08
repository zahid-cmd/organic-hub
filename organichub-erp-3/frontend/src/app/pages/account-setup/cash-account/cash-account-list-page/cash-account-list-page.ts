import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SearchArea } from '../../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

interface CashAccount {
  id: number;
  accountCode: string;
  accountName: string;
  cashAccountName: string;
  branchName: string;
  isCollectionAccount: boolean;
  isPaymentAccount: boolean;
  status: string;
}

@Component({
  selector: 'app-cash-account-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchArea,
    PageSubHeaderComponent,
    PaginationComponent,
    OrganicToast
  ],
  templateUrl: './cash-account-list-page.html',
  styleUrls: ['./cash-account-list-page.css']
})
export class CashAccountListPageComponent implements OnInit {

  accounts: CashAccount[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;

  sortField: keyof CashAccount | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  // ================= LOAD =================
  loadAccounts(): void {
    this.loading = true;

    this.apiService.getCashAccounts().subscribe({
      next: (data: any[]) => {
        this.accounts = (data ?? []).map(a => ({
          id: a.id,
          accountCode: a.accountCode,
          accountName: a.accountName,
          cashAccountName: a.cashAccountName,
          branchName: a.branch?.branchName ?? '',
          isCollectionAccount: a.isCollectionAccount,
          isPaymentAccount: a.isPaymentAccount,
          status: a.status
        }));
        this.loading = false;
      },
      error: () => {
        this.accounts = [];
        this.loading = false;
        this.toast.error('Failed to load cash accounts.');
      }
    });
  }

  // ================= SORT =================
  onSort(field: keyof CashAccount): void {
    if (this.sortField === field) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  get sorted(): CashAccount[] {
    if (!this.sortField) return this.filtered;

    return [...this.filtered].sort((a, b) => {
      const aVal = (a[this.sortField!] ?? '').toString().toLowerCase();
      const bVal = (b[this.sortField!] ?? '').toString().toLowerCase();

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // ================= FILTER =================
  get filtered(): CashAccount[] {
    const search = this.searchText.toLowerCase();

    return this.accounts
      .filter(a =>
        (!search ||
          a.accountCode.toLowerCase().includes(search) ||
          a.accountName.toLowerCase().includes(search) ||
          a.cashAccountName.toLowerCase().includes(search) ||
          a.branchName.toLowerCase().includes(search))
      )
      .filter(a =>
        !this.statusFilter || a.status === this.statusFilter
      );
  }

  get totalRecords(): number {
    return this.sorted.length;
  }

  get paged(): CashAccount[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sorted.slice(start, start + this.pageSize);
  }

  serial(i: number): number {
    return (this.currentPage - 1) * this.pageSize + i + 1;
  }

  onSearch(v: string) {
    this.searchText = v ?? '';
    this.currentPage = 1;
  }

  onStatusChange(v: string) {
    this.statusFilter = v ?? '';
    this.currentPage = 1;
  }

  onClear() {
    this.searchText = '';
    this.statusFilter = '';
    this.currentPage = 1;
  }

  onAdd() {
    this.router.navigate(['/cash-account/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onView(row: CashAccount) {
    this.router.navigate(['/cash-account/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: CashAccount) {
    this.router.navigate(['/cash-account/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  onDelete(row: CashAccount) {
    this.toast.confirm(
      `Delete "${row.cashAccountName}"?`,
      () => {
        this.apiService.deleteCashAccount(row.id).subscribe({
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

  onBack() {
    this.router.navigate(['/dashboard']);
  }

  onPageChange(p: number) {
    this.currentPage = p;
  }

  onPageSizeChange(s: number) {
    this.pageSize = s;
    this.currentPage = 1;
  }
}