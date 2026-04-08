import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../components/organic-toast/toast.service';

/* =========================
   TYPES
========================= */

interface Product {
  id: number;
  productName: string;
  categoryId?: number;
  subCategoryId?: number;
}

interface LedgerRow {
  date: string;
  particulars: string;
  reference: string;
  unitRate: number;
  receipt: number;
  issue: number;
  balance: number;
  remarks: string;
}

/* =========================
   COMPONENT
========================= */

@Component({
  selector: 'app-product-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-ledger.html',
  styleUrls: ['./product-ledger.css']
})
export class ProductLedgerComponent implements OnInit {

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  /* =========================
     FILTER STATE
  ========================== */

  productCategoryId: number | null = null;
  productSubCategoryId: number | null = null;
  productLedgerId: number | null = null;

  fromDate: string = '';
  toDate: string = '';

  /* =========================
     MASTER DATA
  ========================== */

  categories: any[] = [];
  subCategories: any[] = [];
  products: Product[] = [];

  filteredProducts: Product[] = [];

  selectedProductName: string = '';
  openingBalance: number = 0;

  /* =========================
     LEDGER DATA
  ========================== */

  ledger: LedgerRow[] = [];
  loading = false;

  /* =========================
     INIT
  ========================== */

  ngOnInit(): void {
    this.setDefaultDateRange();
    this.loadCategories();
    this.loadProducts();

    this.route.params.subscribe(params => {
      const id = +params['productId'];

      if (id) {
        this.productLedgerId = id;

        setTimeout(() => {
          this.setSelectedProductName();
          this.loadLedger();
        }, 200);
      }
    });
  }

  /* =========================
     DATE
  ========================== */

  setDefaultDateRange(): void {
    const today = new Date();

    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.fromDate = this.formatDate(firstDay);
    this.toDate = this.formatDate(lastDay);
  }

  formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    return `${y}-${m}-${d}`;
  }

  /* =========================
     LOAD MASTER
  ========================== */

  loadCategories(): void {
    this.api.getProductCategories().subscribe({
      next: (res: any) => {
        this.categories = res ?? [];
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  loadSubCategories(categoryId: number): void {
    this.api.getProductSubCategories(categoryId).subscribe({
      next: (res: any) => {
        this.subCategories = res ?? [];
      },
      error: () => {
        this.subCategories = [];
      }
    });
  }

  loadProducts(): void {
    this.api.getProducts().subscribe({
      next: (res: any) => {
        this.products = res ?? [];
        this.filteredProducts = [...this.products];
      },
      error: () => {
        this.products = [];
        this.filteredProducts = [];
      }
    });
  }

  /* =========================
     FILTER CHAIN
  ========================== */

  onCategoryChange(): void {
    this.productSubCategoryId = null;
    this.productLedgerId = null;

    if (this.productCategoryId) {
      this.loadSubCategories(this.productCategoryId);
    } else {
      this.subCategories = [];
    }

    this.applyProductFilter();
  }

  onSubCategoryChange(): void {
    this.productLedgerId = null;
    this.applyProductFilter();
  }

  applyProductFilter(): void {
    this.filteredProducts = this.products.filter(p => {
      return (
        (!this.productCategoryId || p.categoryId === this.productCategoryId) &&
        (!this.productSubCategoryId || p.subCategoryId === this.productSubCategoryId)
      );
    });
  }

  /* =========================
     ACTIONS
  ========================== */

  submit(): void {
    if (!this.productLedgerId) {
      this.toast.error('Please select product');
      return;
    }

    this.setSelectedProductName();
    this.loadLedger();
  }

  resetFilters(): void {

    this.productCategoryId = null;
    this.productSubCategoryId = null;
    this.productLedgerId = null;

    this.subCategories = [];
    this.filteredProducts = [...this.products];

    this.setDefaultDateRange();

    this.ledger = [];
    this.openingBalance = 0;

    this.toast.success('Filters reset');
  }

  setSelectedProductName(): void {
    const selected = this.products.find(x => x.id === this.productLedgerId);
    this.selectedProductName = selected?.productName || '';
  }



  /* =========================
    LEDGER API (FINAL FIXED)
  ========================== */

  loadLedger(): void {

    // ✅ VALIDATION
    if (!this.productLedgerId) {
      this.toast.error('Please select product');
      return;
    }

    this.loading = true;

    // ✅ RESET BEFORE LOAD (important)
    this.ledger = [];
    this.openingBalance = 0;

    this.api.getProductLedger(
      Number(this.productLedgerId),   // 🔥 FIX: ensure number
      this.fromDate,
      this.toDate
    ).subscribe({
      next: (res: any) => {

        console.log('LEDGER RESPONSE:', res);
        console.log('FIRST ROW:', res?.data?.[0]);

        // ✅ SAFE EXTRACTION
        const rows = res?.data ?? [];

        // ✅ STRICT MAPPING (aligned with backend)
        this.ledger = rows.map((x: any) => ({
          date: x.date,
          particulars: x.particulars,
          reference: x.reference,
          unitRate: x.unitRate,
          receipt: x.receipt,
          issue: x.issue,
          balance: x.balance,
          remarks: x.remarks || ''
        }));

        // ✅ OPENING BALANCE
        this.openingBalance = res?.openingBalance ?? 0;

        this.loading = false;
      },

      error: (err) => {
        console.error('LEDGER ERROR:', err);
        this.loading = false;

        this.toast.error('Failed to load ledger');
      }
    });
  }

  onProductChange(): void {
    this.setSelectedProductName();
    this.loadLedger();
  }
  /* =========================
     CALCULATIONS
  ========================== */

  get totalIn(): number {
    return this.ledger.reduce((sum, x) => sum + (x.receipt || 0), 0);
  }

  get totalOut(): number {
    return this.ledger.reduce((sum, x) => sum + (x.issue || 0), 0);
  }

  get closingBalance(): number {
    if (this.ledger.length === 0) return this.openingBalance;
    return this.ledger[this.ledger.length - 1].balance;
  }
  /* =========================
    REPORT
  ========================= */

  printLedger(): void {

    if (!this.productLedgerId) {
      this.toast.error('Please select product');
      return;
    }

    const url =
      `/reports/product-ledger/ledger.html` +
      `?productCategory=${this.productCategoryId ?? ''}` +
      `&productSubCategory=${this.productSubCategoryId ?? ''}` +
      `&productLedger=${this.productLedgerId ?? ''}` +
      `&from=${this.fromDate}` +
      `&to=${this.toDate}`;

    window.open(url, '_blank');
  }

  /* =========================
     NAV
  ========================== */

  goBack(): void {
    window.history.back();
  }
}