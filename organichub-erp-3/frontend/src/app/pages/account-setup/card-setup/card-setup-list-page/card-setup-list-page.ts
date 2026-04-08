import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SearchArea } from '../../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { PaginationComponent } from '../../../../components/pagination/pagination';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

interface CardSetup {
  id: number;
  cardCode: string;
  cardName: string;
  issuingBank: string;   // ✅ CHANGED
  status: string;
}

@Component({
  selector: 'app-card-setup-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchArea,
    PageSubHeaderComponent,
    PaginationComponent,
    OrganicToast
  ],
  templateUrl: './card-setup-list-page.html',
  styleUrls: ['./card-setup-list-page.css']
})
export class CardSetupListPageComponent implements OnInit {

  cards: CardSetup[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  sortField: keyof CardSetup | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCards();
  }

  // ================= LOAD =================
  loadCards(): void {

    this.loading = true;
    this.error = null;

    this.apiService.getCardSetups().subscribe({
      next: (data: any[]) => {

        this.cards = (data ?? []).map(c => ({
          id: c.id,
          cardCode: c.cardCode,
          cardName: c.cardName,
          issuingBank: c.issuingBank,   // ✅ CHANGED
          status: c.status
        }));

        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load card setups.';
        this.loading = false;
        this.toast.error(this.error);
      }
    });
  }

  // ================= SORT =================
  onSort(field: keyof CardSetup): void {

    if (this.sortField === field) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  get sortedCards(): CardSetup[] {

    if (!this.sortField) return this.filteredCards;

    return [...this.filteredCards].sort((a, b) => {

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
  get filteredCards(): CardSetup[] {

    const search = this.searchText.toLowerCase();

    return this.cards
      .filter(c =>
        (!search ||
          c.cardCode?.toLowerCase().includes(search) ||
          c.cardName?.toLowerCase().includes(search) ||
          c.issuingBank?.toLowerCase().includes(search))   // ✅ CHANGED
      )
      .filter(c =>
        !this.statusFilter || c.status === this.statusFilter
      );
  }

  get totalRecords(): number {
    return this.sortedCards.length;
  }

  get pagedCards(): CardSetup[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedCards.slice(start, start + this.pageSize);
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
    this.router.navigate(['/card-setup/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onView(row: CardSetup): void {
    this.router.navigate(['/card-setup/form'], {
      queryParams: { mode: 'view', id: row.id }
    });
  }

  onEdit(row: CardSetup): void {
    this.router.navigate(['/card-setup/form'], {
      queryParams: { mode: 'edit', id: row.id }
    });
  }

  onDelete(row: CardSetup): void {

    this.toast.confirm(
      `Delete "${row.cardName}"?`,
      () => {

        this.apiService.deleteCardSetup(row.id).subscribe({
          next: () => {
            this.toast.success('Deleted successfully.');
            this.loadCards();
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