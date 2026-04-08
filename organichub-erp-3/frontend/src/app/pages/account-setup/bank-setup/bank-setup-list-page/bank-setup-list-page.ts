import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SearchArea } from '../../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

interface BankSetup {
  id: number;
  bankCode: string;
  bankName: string;
  shortName: string;
  status: string;
}

@Component({
  selector: 'app-bank-setup-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchArea,
    PageSubHeaderComponent,
    PaginationComponent,
    OrganicToast
  ],
  templateUrl: './bank-setup-list-page.html',
  styleUrls: ['./bank-setup-list-page.css']
})
export class BankSetupListPageComponent implements OnInit {

  banks: BankSetup[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  // STRICT SAFE SORT
  sortField: keyof BankSetup | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadBanks();
  }

  // =====================================================
  // LOAD DATA
  // =====================================================
  loadBanks(): void {

    this.loading = true;
    this.error = null;

    this.apiService.getBankSetups().subscribe({
      next: (data: any[]) => {

        this.banks = (data ?? []).map(b => ({
          id: b.id,
          bankCode: b.bankCode,
          bankName: b.bankName,
          shortName: b.shortName,
          status: b.status
        }));

        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load banks.';
        this.loading = false;
        this.toast.error(this.error);
      }
    });
  }

  // =====================================================
  // SORTING
  // =====================================================
  onSort(field: keyof BankSetup): void {

    if (this.sortField === field) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  get sortedBanks(): BankSetup[] {

    if (!this.sortField) return this.filteredBanks;

    return [...this.filteredBanks].sort((a, b) => {

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
  get filteredBanks(): BankSetup[] {

    const search = this.searchText.toLowerCase();

    return this.banks
      .filter(b =>
        (!search ||
          b.bankCode?.toLowerCase().includes(search) ||
          b.bankName?.toLowerCase().includes(search) ||
          b.shortName?.toLowerCase().includes(search))
      )
      .filter(b =>
        !this.statusFilter || b.status === this.statusFilter
      );
  }

  get totalRecords(): number {
    return this.sortedBanks.length;
  }

  get pagedBanks(): BankSetup[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedBanks.slice(start, start + this.pageSize);
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
    this.router.navigate(['/bank-setup/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onView(row: BankSetup): void {
    this.router.navigate(['/bank-setup/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: BankSetup): void {
    this.router.navigate(['/bank-setup/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  onDelete(row: BankSetup): void {

    this.toast.confirm(
      `Delete "${row.bankName}"?`,
      () => {

        this.apiService.deleteBankSetup(row.id).subscribe({
          next: () => {
            this.toast.success('Deleted successfully.');
            this.loadBanks();
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