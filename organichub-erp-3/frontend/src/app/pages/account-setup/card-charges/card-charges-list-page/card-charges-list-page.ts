import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SearchArea } from '../../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

interface CardCharge {
  id: number;
  posLedger: string;
  cardName: string;
  chargePercent: number;
  status: string;
}

@Component({
  selector: 'app-card-charges-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchArea,
    PageSubHeaderComponent,
    PaginationComponent,
    OrganicToast
  ],
  templateUrl: './card-charges-list-page.html',
  styleUrls: ['./card-charges-list-page.css']
})
export class CardChargesListPageComponent implements OnInit {

  charges: CardCharge[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  // ================= SORT =================
  sortField: keyof CardCharge | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCharges();
  }

  // ================= LOAD =================
  loadCharges(): void {

    this.loading = true;
    this.error = null;

    this.api.getCardCharges().subscribe({
      next: (data: any[]) => {

        this.charges = (data ?? []).map(x => ({
          id: x.id,
          posLedger: x.posLedger,
          cardName: x.cardName,
          chargePercent: x.chargePercent,
          status: x.status
        }));

        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load card charges.';
        this.loading = false;
        this.toast.error(this.error);
      }
    });
  }

  // ================= SORTING =================
  onSort(field: keyof CardCharge): void {

    if (this.sortField === field) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  get sortedCharges(): CardCharge[] {

    if (!this.sortField) return this.filteredCharges;

    return [...this.filteredCharges].sort((a, b) => {

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

  // ================= FILTER =================
  get filteredCharges(): CardCharge[] {

    const search = this.searchText.toLowerCase();

    return this.charges
      .filter(c =>
        (!search ||
          c.posLedger?.toLowerCase().includes(search) ||
          c.cardName?.toLowerCase().includes(search))
      )
      .filter(c =>
        !this.statusFilter || c.status === this.statusFilter
      );
  }

  get totalRecords(): number {
    return this.sortedCharges.length;
  }

  get pagedCharges(): CardCharge[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedCharges.slice(start, start + this.pageSize);
  }

  serial(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  // ================= SEARCH =================
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

  // ================= NAVIGATION =================
  onAdd(): void {
    this.router.navigate(['/card-charges/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onView(row: CardCharge): void {
    this.router.navigate(['/card-charges/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: CardCharge): void {
    this.router.navigate(['/card-charges/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  onDelete(row: CardCharge): void {

    this.toast.confirm(
      `Delete charge for "${row.cardName}"?`,
      () => {

        this.api.deleteCardCharge(row.id).subscribe({
          next: () => {
            this.toast.success('Deleted successfully.');
            this.loadCharges();
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

  // ================= PAGINATION =================
  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }
}