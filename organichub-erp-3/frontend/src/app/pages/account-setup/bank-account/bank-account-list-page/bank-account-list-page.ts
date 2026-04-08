import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SearchArea } from '../../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

interface BankAccount {
  id: number;
  accountCode: string;
  accountName: string;
  bankAccountName: string;
  branchId: number;
  branchName: string; // 🔥 FIXED
  isCollectionAccount: boolean;
  isPaymentAccount: boolean;
  status: string;
}

@Component({
  selector: 'app-bank-account-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchArea,
    PageSubHeaderComponent,
    PaginationComponent,
    OrganicToast
  ],
  templateUrl: './bank-account-list-page.html',
  styleUrls: ['./bank-account-list-page.css']
})
export class BankAccountListPageComponent implements OnInit {

  accounts: BankAccount[] = [];

  loading = false;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  pageSize = 10;
  currentPage = 1;

  sortField: keyof BankAccount | null = null;
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

    this.apiService.getBankAccounts().subscribe({
      next: (data: any[]) => {

        this.accounts = (data ?? []).map(a => ({
          id: a.id,
          accountCode: a.accountCode,
          accountName: a.accountName,
          bankAccountName: a.bankAccountName,
          branchId: a.branchId,
          branchName: a.branchName ?? '', // 🔥 FIXED HERE
          isCollectionAccount: a.isCollectionAccount,
          isPaymentAccount: a.isPaymentAccount,
          status: a.status
        }));

        this.loading = false;
      },
      error: () => {
        this.accounts = [];
        this.loading = false;
        this.toast.error('Failed to load bank accounts.');
      }
    });
  }

  // ================= SORT =================
  onSort(field: keyof BankAccount): void {

    if (this.sortField === field) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  get sortedAccounts(): BankAccount[] {

    if (!this.sortField)
      return this.filteredAccounts;

    return [...this.filteredAccounts].sort((a, b) => {

      const aVal = (a[this.sortField!] ?? '')
        .toString().toLowerCase();

      const bVal = (b[this.sortField!] ?? '')
        .toString().toLowerCase();

      if (aVal < bVal)
        return this.sortDirection === 'asc' ? -1 : 1;

      if (aVal > bVal)
        return this.sortDirection === 'asc' ? 1 : -1;

      return 0;
    });
  }

  // ================= FILTER =================
  get filteredAccounts(): BankAccount[] {

    const search = this.searchText.toLowerCase();

    return this.accounts
      .filter(a =>
        (!search ||
          a.accountCode.toLowerCase().includes(search) ||
          a.accountName.toLowerCase().includes(search) ||
          a.bankAccountName.toLowerCase().includes(search) ||
          a.branchName.toLowerCase().includes(search)) // 🔥 FIXED
      )
      .filter(a =>
        !this.statusFilter || a.status === this.statusFilter
      );
  }

  // ================= PAGINATION =================
  get totalRecords(): number {
    return this.sortedAccounts.length;
  }

  get pagedAccounts(): BankAccount[] {

    const start =
      (this.currentPage - 1) * this.pageSize;

    return this.sortedAccounts.slice(
      start,
      start + this.pageSize
    );
  }

  serial(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  onSearch(value: string) {
    this.searchText = value ?? '';
    this.currentPage = 1;
  }

  onStatusChange(value: string) {
    this.statusFilter = value ?? '';
    this.currentPage = 1;
  }

  onClear(): void {
    this.searchText = '';
    this.statusFilter = '';
    this.currentPage = 1;
  }

  // ================= NAVIGATION =================
  onAdd() {
    this.router.navigate(['/bank-account/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onView(row: BankAccount) {
    this.router.navigate(['/bank-account/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: BankAccount) {
    this.router.navigate(['/bank-account/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  onDelete(row: BankAccount) {

    this.toast.confirm(
      `Delete "${row.bankAccountName}"?`,
      () => {

        this.apiService.deleteBankAccount(row.id).subscribe({
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

  onBack(): void {
    this.router.navigate(['/dashboard']);
  }
}