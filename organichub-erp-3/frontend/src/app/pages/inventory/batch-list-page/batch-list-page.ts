import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { SearchArea } from '../../../components/search-area/search-area';
import { PaginationComponent } from '../../../components/pagination/pagination';

interface InventoryBatchList {

  batchId: number;
  productId: number;

  batchNo: string;

  productName: string;
  warehouseName: string;

  unitCost: number;

  qtyIn: number;
  qtyOut: number;
  qtyBalance: number;

  batchDate: string;
  batchStatus: number;
  sourceNo: string;
}

@Component({
  selector: 'app-batch-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    SearchArea,
    PaginationComponent
  ],
  templateUrl: './batch-list-page.html',
  styleUrls: ['./batch-list-page.css']
})
export class BatchListPageComponent implements OnInit {

  constructor(
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {}

  loading = false;

  searchText = '';

  pageSize = 10;
  currentPage = 1;
  totalRecords = 0;

  batches: InventoryBatchList[] = [];
  private filteredBatches: InventoryBatchList[] = [];
  pagedBatches: InventoryBatchList[] = [];

  ngOnInit(): void {
    this.loadBatches();
  }

  private loadBatches(): void {

    this.loading = true;

    this.api.getBatches().subscribe({

      next: (data: InventoryBatchList[]) => {

        this.batches = data ?? [];
        this.currentPage = 1;
        this.applyFilters();
        this.loading = false;

      },

      error: err => {

        console.error(err);
        this.toast.error('Failed to load batches');
        this.loading = false;

      }

    });

  }

  onSearch(text: string): void {

    this.searchText = (text ?? '').toLowerCase();
    this.currentPage = 1;
    this.applyFilters();

  }

  private applyFilters(): void {

    const text = this.searchText.trim();

    this.filteredBatches = this.batches.filter(b =>

      !text ||
      b.batchNo?.toLowerCase().includes(text) ||
      b.productName?.toLowerCase().includes(text) ||
      b.warehouseName?.toLowerCase().includes(text) ||
      b.sourceNo?.toLowerCase().includes(text)

    );

    this.totalRecords = this.filteredBatches.length;
    this.applyPaging();

  }

  private applyPaging(): void {

    const start = (this.currentPage - 1) * this.pageSize;

    this.pagedBatches =
      this.filteredBatches.slice(start, start + this.pageSize);

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

  serial(i: number): number {
    return (this.currentPage - 1) * this.pageSize + i + 1;
  }

  onRefresh(): void {
    this.loadBatches();
  }

  onBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // =====================================================
  // ✅ NEW — BATCH MOVEMENT NAVIGATION
  // =====================================================
  openBatchMovement(batchId: number, productId: number): void {

    if (!batchId || !productId) {
      this.toast.error('Invalid batch/product');
      return;
    }

    this.router.navigate(
      ['/store-management/batch-movement'],
      {
        queryParams: {
          batchId: batchId,
          productId: productId
        }
      }
    );
  }

}