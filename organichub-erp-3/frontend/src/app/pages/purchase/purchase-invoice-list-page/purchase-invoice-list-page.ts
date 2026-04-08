import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { SearchArea } from '../../../components/search-area/search-area';
import { PaginationComponent } from '../../../components/pagination/pagination';


/* =========================
   INTERFACE
========================= */

interface PurchaseInvoiceList {

  id: number;

  invoiceNo: string;

  invoiceDate: string;

  purchaseOrderNo: string;

  purchaseOrderDate: string;

  supplierName: string;

  productValue: number;

  invoiceValue: number;

  status?: string;   // ✅ IMPORTANT (for filter)

}


/* =========================
   COMPONENT
========================= */

@Component({
  selector: 'app-purchase-invoice-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    SearchArea,
    PaginationComponent
  ],
  templateUrl: './purchase-invoice-list-page.html',
  styleUrls: ['./purchase-invoice-list-page.css'],
})

export class PurchaseInvoiceListPage implements OnInit {

  constructor(
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {}


  /* =========================
     STATE
  ========================== */

  loading = false;

  searchText = '';

  statusFilter = 'ALL';   // ✅ NEW

  pageSize = 10;

  currentPage = 1;

  totalRecords = 0;

  invoices: PurchaseInvoiceList[] = [];

  private filteredInvoices: PurchaseInvoiceList[] = [];

  pagedInvoices: PurchaseInvoiceList[] = [];


  /* =========================
     INIT
  ========================== */

  ngOnInit(): void {

    this.loadInvoices();

  }


  /* =========================
     LOAD DATA
  ========================== */

  private loadInvoices(): void {

    this.loading = true;

    this.api.getPurchaseInvoices().subscribe({

      next: (data: PurchaseInvoiceList[]) => {

        this.invoices = data ?? [];

        this.currentPage = 1;

        this.applyFiltersAndPaging();

        this.loading = false;

      },

      error: (err) => {

        console.error('Failed to load purchase invoices', err);

        this.toast.error('Failed to load purchase invoices.');

        this.loading = false;

      }

    });

  }


  /* =========================
     SEARCH
  ========================== */

  onSearch(value: string): void {

    this.searchText = (value ?? '').toLowerCase();

    this.currentPage = 1;

    this.applyFiltersAndPaging();

  }


  onClear(): void {

    this.searchText = '';

    this.statusFilter = 'ALL';

    this.currentPage = 1;

    this.applyFiltersAndPaging();

  }


  /* =========================
     STATUS FILTER
  ========================== */

  onStatusChange(): void {

    this.currentPage = 1;

    this.applyFiltersAndPaging();

  }


  /* =========================
     PAGINATION
  ========================== */

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


  /* =========================
     FILTER + PAGING
  ========================== */

  private applyFiltersAndPaging(): void {

    const text = this.searchText.trim();

    this.filteredInvoices = this.invoices.filter(i => {

      const textMatch =
        !text ||
        i.invoiceNo?.toLowerCase().includes(text) ||
        i.supplierName?.toLowerCase().includes(text) ||
        i.purchaseOrderNo?.toLowerCase().includes(text);

      const statusMatch =
        this.statusFilter === 'ALL' ||
        (i.status ?? '').toUpperCase() === this.statusFilter;

      return textMatch && statusMatch;

    });

    this.totalRecords = this.filteredInvoices.length;

    this.applyPaging();

  }


  private applyPaging(): void {

    const start = (this.currentPage - 1) * this.pageSize;

    this.pagedInvoices =
      this.filteredInvoices.slice(start, start + this.pageSize);

  }


  /* =========================
     ACTIONS
  ========================== */

  onAdd(): void {

    this.router.navigate(['/purchase/invoice/form']);

  }


  onBack(): void {

    this.router.navigate(['/purchase']);

  }


  onInvoicePrint(index: number): void {

    const invoice = this.pagedInvoices[index];
    if (!invoice) return;

    const url = this.router.serializeUrl(
      this.router.createUrlTree([
        '/print',
        'purchase-invoice',
        invoice.id
      ])
    );

    window.open(url, '_blank');   // ⭐ open in new TAB (not popup)
  }


  onView(invoice: PurchaseInvoiceList): void {

    this.router.navigate(
      ['/purchase/invoice/form'],
      { queryParams: { mode: 'view', id: invoice.id } }
    );

  }


  onEdit(invoice: PurchaseInvoiceList): void {

    /* ⭐ ERP HARD LOCK — POSTED INVOICE */
    if ((invoice.status ?? '').toUpperCase() === 'POSTED') {

      this.toast.error('Posted invoice cannot be edited.');

      /* OPTIONAL — open in VIEW instead (Best ERP UX) */
      this.router.navigate(
        ['/purchase/invoice/form'],
        { queryParams: { mode: 'view', id: invoice.id } }
      );

      return;
    }

    /* ⭐ NORMAL DRAFT EDIT */
    this.router.navigate(
      ['/purchase/invoice/form'],
      { queryParams: { mode: 'edit', id: invoice.id } }
    );

  }

}