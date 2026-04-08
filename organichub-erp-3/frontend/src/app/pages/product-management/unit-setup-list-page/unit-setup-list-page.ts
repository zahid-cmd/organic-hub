import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { SearchArea } from '../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';

interface UnitModel {
  id: number;
  unitCode: string;
  unitName: string;
  status: string;
  remarks?: string | null;
}

@Component({
  selector: 'app-unit-setup-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    SearchArea,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './unit-setup-list-page.html',
  styleUrls: ['./unit-setup-list-page.css']
})
export class UnitSetupListPageComponent implements OnInit {

  units: UnitModel[] = [];

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  loading = false;
  error: string | null = null;

  sortColumn: keyof UnitModel = 'unitCode';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUnits();
  }

  loadUnits(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getUnits().subscribe({
      next: (data: UnitModel[]) => {
        this.units = data ?? [];
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load units.';
        this.toast.error('Failed to load units.');
        this.loading = false;
      }
    });
  }

  get filteredUnits(): UnitModel[] {
    const search = this.searchText.trim().toLowerCase();

    return this.units
      .filter(u =>
        (!search ||
          u.unitCode?.toLowerCase().includes(search) ||
          u.unitName?.toLowerCase().includes(search))
      )
      .filter(u =>
        !this.statusFilter || u.status === this.statusFilter
      );
  }

  onSort(column: keyof UnitModel): void {

    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
  }

  get sortedUnits(): UnitModel[] {

    return [...this.filteredUnits].sort((a, b) => {

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
    return this.filteredUnits.length;
  }

  get pagedUnits(): UnitModel[] {

    const start = (this.currentPage - 1) * this.pageSize;

    return this.sortedUnits.slice(
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
    this.router.navigate(['/product/unit-setup/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onBack(): void {
    this.router.navigate(['/product']);
  }

  onView(unit: UnitModel): void {
    this.router.navigate(['/product/unit-setup/form'], {
      queryParams: { mode: 'view', id: unit.id }
    });
  }

  onEdit(unit: UnitModel): void {
    this.router.navigate(['/product/unit-setup/form'], {
      queryParams: { mode: 'edit', id: unit.id }
    });
  }

  onDelete(unit: UnitModel): void {

    this.toast.confirm(
      `Delete "${unit.unitName}"?`,
      () => this.confirmDelete(unit.id)
    );
  }

  private confirmDelete(id: number): void {

    this.apiService.deleteUnit(id).subscribe({
      next: () => {
        this.units = this.units.filter(u => u.id !== id);

        if (this.currentPage > 1 && this.pagedUnits.length === 0) {
          this.currentPage--;
        }

        this.toast.success('Unit deleted successfully.');
      },
      error: () => {
        this.toast.error('Failed to delete unit.');
      }
    });
  }
}
