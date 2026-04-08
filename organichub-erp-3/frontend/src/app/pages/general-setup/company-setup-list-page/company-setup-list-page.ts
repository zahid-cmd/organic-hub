import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';

import { PaginationComponent } from '../../../components/pagination/pagination';
import { SearchArea } from '../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';

interface Company {
  id: number;
  companyCode: string;
  companyName: string;
  email: string;
  website: string;
  bin: string;
  status: string;
}

@Component({
  selector: 'app-company-setup-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    SearchArea,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './company-setup-list-page.html',
  styleUrls: ['./company-setup-list-page.css']
})
export class CompanySetupListPageComponent implements OnInit {

  companies: Company[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  sortColumn: keyof Company = 'companyCode';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {

    this.loading = true;
    this.error = null;

    this.apiService.getCompanies().subscribe({

      next: (data: Company[]) => {
        this.companies = data ?? [];
        this.currentPage = 1;
        this.loading = false;
      },

      error: (err) => {
        console.error('Load companies failed:', err);
        this.error = 'Failed to load companies.';
        this.toast.error('Failed to load companies.');
        this.loading = false;
      }

    });
  }

  get filteredCompanies(): Company[] {

    const search = this.searchText.trim().toLowerCase();

    return this.companies
      .filter(c =>
        (!search ||
          c.companyCode?.toLowerCase().includes(search) ||
          c.companyName?.toLowerCase().includes(search) ||
          c.email?.toLowerCase().includes(search) ||
          c.website?.toLowerCase().includes(search) ||
          c.bin?.toLowerCase().includes(search))
      )
      .filter(c =>
        !this.statusFilter || c.status === this.statusFilter
      );
  }

  onSort(column: keyof Company): void {

    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
  }

  get sortedCompanies(): Company[] {

    return [...this.filteredCompanies].sort((a, b) => {

      let valueA = a[this.sortColumn] ?? '';
      let valueB = b[this.sortColumn] ?? '';

      const aStr = valueA.toString().toLowerCase();
      const bStr = valueB.toString().toLowerCase();

      if (aStr < bStr)
        return this.sortDirection === 'asc' ? -1 : 1;

      if (aStr > bStr)
        return this.sortDirection === 'asc' ? 1 : -1;

      return 0;
    });
  }

  get totalRecords(): number {
    return this.filteredCompanies.length;
  }

  get pagedCompanies(): Company[] {

    const start = (this.currentPage - 1) * this.pageSize;

    return this.sortedCompanies.slice(
      start,
      start + this.pageSize
    );
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
    this.router.navigate(['/general-setup/company-setup/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onBack(): void {
    this.router.navigate(['/general-setup']);
  }

  onView(row: Company): void {
    this.router.navigate(['/general-setup/company-setup/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: Company): void {
    this.router.navigate(['/general-setup/company-setup/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  onDelete(row: Company): void {

    this.toast.confirm(
      `Are you sure you want to delete "${row.companyName}"?`,
      () => this.executeDelete(row)
    );
  }

  private executeDelete(row: Company): void {

    this.apiService.deleteCompany(row.id).subscribe({

      next: () => {
        this.toast.success('Company deleted successfully.');
        this.companies =
          this.companies.filter(c => c.id !== row.id);
      },

      error: () => {
        this.toast.error(
          'Cannot delete company. Related records exist.'
        );
      }

    });
  }

}