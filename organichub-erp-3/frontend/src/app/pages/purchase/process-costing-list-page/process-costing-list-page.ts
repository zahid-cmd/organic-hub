import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { SearchArea } from '../../../components/search-area/search-area';
import { PaginationComponent } from '../../../components/pagination/pagination';

@Component({
  selector: 'app-process-costing-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PageSubHeaderComponent,
    SearchArea,
    PaginationComponent
  ],
  templateUrl: './process-costing-list-page.html',
  styleUrls: ['./process-costing-list-page.css']
})
export class ProcessCostingListPageComponent {

  searchText = '';
  statusFilter = '';
  statusOptions = ['Completed', 'Draft'];

  pageSize = 10;
  currentPage = 1;
  totalRecords = 0;

  processes = [
    {
      batchNo: 'PC-1001',
      processDate: '2026-01-10',
      finishedProduct: 'Chili Powder',
      totalCost: 18500,
      status: 'Completed'
    },
    {
      batchNo: 'PC-1002',
      processDate: '2026-01-12',
      finishedProduct: 'Mustard Oil',
      totalCost: 22400,
      status: 'Draft'
    }
  ];

  filtered: any[] = [];
  pagedProcesses: any[] = [];

  constructor(private router: Router) {
    this.applyFilters();
  }

  onSearch(value: string): void {
    this.searchText = value.toLowerCase();
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusChange(value: string): void {
    this.statusFilter = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onClear(): void {
    this.searchText = '';
    this.statusFilter = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  serial(i: number): number {
    return (this.currentPage - 1) * this.pageSize + i + 1;
  }

  applyFilters(): void {
    this.filtered = this.processes.filter(p => {
      const matchText =
        !this.searchText ||
        p.batchNo.toLowerCase().includes(this.searchText) ||
        p.finishedProduct.toLowerCase().includes(this.searchText);

      const matchStatus =
        !this.statusFilter || p.status === this.statusFilter;

      return matchText && matchStatus;
    });

    this.totalRecords = this.filtered.length;
    this.applyPaging();
  }

  applyPaging(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedProcesses = this.filtered.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyPaging();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.applyPaging();
  }

  onAdd(): void {
    this.router.navigate(['/purchase/process-costing/form']);
  }

  onBack(): void {
    this.router.navigate(['/purchase']);
  }

  onView(i: number): void {
    this.router.navigate(['/purchase/process-costing/form'], {
      queryParams: { mode: 'view', index: i }
    });
  }

  onEdit(i: number): void {
    this.router.navigate(['/purchase/process-costing/form'], {
      queryParams: { mode: 'edit', index: i }
    });
  }
}
