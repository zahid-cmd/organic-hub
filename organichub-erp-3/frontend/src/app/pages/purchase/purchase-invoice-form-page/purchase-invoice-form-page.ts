import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';

/* =========================
   INTERFACES
========================= */

interface ConfigurationSetting {
  configurationCode: string;
  isEnabled: boolean;
}

interface Product {
  id: number;
  productCode: string;
  productName: string;
  subCategoryId: number;
  primaryImageUrl?: string;
  currentStock?: number;
}

interface ProductSubCategory {
  id: number;
  subCategoryName: string;
}

interface PurchaseInvoiceItem {
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Supplier {
  id: number;
  supplierName: string;
}

interface Warehouse {
  id: number;
  warehouseName: string;
  status: string;
}

@Component({
  selector: 'app-purchase-invoice-form-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent
  ],
  templateUrl: './purchase-invoice-form-page.html',
  styleUrls: ['./purchase-invoice-form-page.css']
})

export class PurchaseInvoiceFormPage implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public api: ApiService,
    private toast: ToastService
  ) {}

  saving = false;

  mode: 'add' | 'edit' | 'view' = 'add';
  invoiceId: number | null = null;

  get isViewMode(): boolean {
    return this.mode === 'view';
  }

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }

  poLocked = false;

  configurations: ConfigurationSetting[] = [];
  poMandatory = false;

  suppliers: Supplier[] = [];
  products: Product[] = [];
  productSubCategories: ProductSubCategory[] = [];
  purchaseOrders: any[] = [];
  warehouses: Warehouse[] = [];

  shelfSearch = '';
  selectedPurchaseOrderId = 0;

  invoice = {
    invoiceNo: '',
    invoiceDate: '',
    location: '',
    reference: '',
    supplierId: 0,
    purchaseType: 'Finished',

    productValue: 0,

    primaryTransport: null as number | null,
    secondaryTransport: null as number | null,
    discount: null as number | null,

    invoiceValue: 0,

    status: 'Draft',
    notes: ''
  };

  entry = {
    productSubCategoryId: 0,
    productId: 0,
    quantity: null as number | null,
    rate: null as number | null,
    normalLoss: null as number | null
  };

  items: PurchaseInvoiceItem[] = [];
  editingIndex: number | null = null;

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      const id = params['id'];
      const mode = params['mode'];

      if (mode === 'edit' || mode === 'view') {
        this.mode = mode;
      }

      if (id) {
        this.invoiceId = Number(id);
      }

      this.initializePage();

    });

  }


  /* =========================
    PAGE INIT
  ========================= */

  private initializePage(): void {

    this.loadConfigurations();
    this.loadSuppliers();
    this.loadProductSubCategories();
    this.loadWarehouses();

    /* LOAD PURCHASE ORDERS FIRST */
    this.loadPurchaseOrders(() => {

      /* products must load before invoice */
      this.loadProducts();

    });

  }

  /* =========================
     LOADERS
  ========================= */

  private loadConfigurations(): void {

    this.api.getConfigurationSettings().subscribe({

      next: (data: ConfigurationSetting[]) => {

        this.configurations = data ?? [];

        const poRule = this.configurations.find(
          c => c.configurationCode === 'PG-001'
        );

        this.poMandatory = poRule?.isEnabled ?? false;

        if (this.poMandatory) {
          this.poLocked = false;
        } else {
          this.selectedPurchaseOrderId = 0;
          this.poLocked = true;
        }

      }

    });

  }

  private loadSuppliers(): void {

    this.api.getSuppliers().subscribe({
      next: (data: Supplier[]) => this.suppliers = data ?? []
    });

  }

  private loadProducts(): void {

    this.api.getPurchasableProducts().subscribe({

      next: (data: Product[]) => {

        this.products = data ?? [];

        /* IMPORTANT */
        if (this.invoiceId) {
          this.loadInvoice(this.invoiceId);
        } else {
          this.resetInvoice();
        }

      },

      error: () => {
        this.toast.error('Failed to load products.');
      }

    });

  }
  private loadProductSubCategories(): void {

    this.api.getSubCategories().subscribe({
      next: (data: ProductSubCategory[]) =>
        this.productSubCategories = data ?? []
    });

  }

  private loadPurchaseOrders(callback?: () => void): void {

    this.api.getApprovedPurchaseOrders().subscribe({

      next: (data: any[]) => {

        this.purchaseOrders = data ?? [];

        /* AFTER purchase orders load */
        if (callback) {
          callback();
        }

      },

      error: () => {
        this.toast.error('Failed to load purchase orders.');
      }

    });

  }
  private loadWarehouses(): void {

    this.api.getWarehouses().subscribe({

      next: (data: Warehouse[]) => {

        this.warehouses = (data ?? [])
          .filter(w => w.status === 'Active');

      }

    });

  }

  private loadNextInvoiceNumber(): void {

    this.api.getNextPurchaseInvoiceNumber().subscribe({
      next: (number: string) => this.invoice.invoiceNo = number
    });

  }



  /* =========================
   LOAD INVOICE
========================= */

private loadInvoice(id: number): void {

  this.api.getPurchaseInvoiceById(id).subscribe({

    next: (data: any) => {

      /* BASIC INFO */
      this.invoice.invoiceNo = data.invoiceNo;
      this.invoice.invoiceDate = data.invoiceDate?.substring(0,10);
      this.invoice.reference = data.reference;
      this.invoice.supplierId = data.supplierId;
      this.invoice.purchaseType = data.purchaseType;
      this.invoice.notes = data.notes ?? '';

      /* EXTRA COSTS */
      this.invoice.primaryTransport = data.primaryTransport ?? null;
      this.invoice.secondaryTransport = data.secondaryTransport ?? null;
      this.invoice.discount = data.discount ?? null;

      /* RESET DROPDOWN VALUES FIRST */
      this.invoice.location = '';
      this.selectedPurchaseOrderId = 0;

      /* APPLY VALUES AFTER UI OPTIONS LOAD */
      setTimeout(() => {

        this.invoice.location = data.location ?? '';
        this.selectedPurchaseOrderId = Number(data.purchaseOrderId ?? 0);

        if (this.selectedPurchaseOrderId > 0) {
          this.poLocked = true;
        }

      });

      /* LOAD ITEMS */
      this.items = (data.items ?? []).map((i:any)=>{

        const product = this.products.find(
          p => p.id === i.productId
        );

        return {
          productId: i.productId,
          productName: product?.productName ?? '',
          productCode: product?.productCode ?? '',
          quantity: i.quantity,
          rate: i.rate,
          amount: i.amount
        };

      });

      /* RECALCULATE */
      this.recalculateTotals();

    },

    error: () => {

      this.toast.error('Failed to load purchase invoice.');

    }

  });

}

  /* =========================
     PURCHASE ORDER SELECT
  ========================= */

  onPurchaseOrderChange(): void {

    if (!this.selectedPurchaseOrderId) {

      this.items = [];
      this.invoice.supplierId = 0;
      this.poLocked = false;

      this.recalculateTotals();
      return;
    }

    this.api.getPurchaseOrderById(this.selectedPurchaseOrderId)
      .subscribe({

        next: (data: any) => {

          this.invoice.supplierId = data.supplierId;

          this.items = (data.items ?? []).map((i:any)=>{

            const product = this.products.find(p => p.id === i.productId);

            return {
              productId: i.productId,
              productName: product?.productName ?? '',
              productCode: product?.productCode ?? '',
              quantity: i.quantity,
              rate: i.rate,
              amount: i.quantity * i.rate
            };

          });

          this.poLocked = true;

          this.recalculateTotals();

        },

        error: () => {
          this.toast.error('Failed to load purchase order.');
        }

      });

  }

  /* =========================
     FILTERS
  ========================= */

  get filteredProducts(): Product[] {

    if (!this.entry.productSubCategoryId)
      return this.products;

    return this.products.filter(p =>
      p.subCategoryId === this.entry.productSubCategoryId
    );

  }

  get filteredShelfProducts(): Product[] {

    let list = this.products;

    if (this.entry.productSubCategoryId) {
      list = list.filter(p =>
        p.subCategoryId === this.entry.productSubCategoryId
      );
    }

    if (this.shelfSearch.trim()) {

      const search = this.shelfSearch.toLowerCase();

      list = list.filter(p =>
        p.productName.toLowerCase().includes(search) ||
        p.productCode.toLowerCase().includes(search)
      );

    }

    return list;

  }

  /* =========================
     CALCULATIONS
  ========================= */

  get calculatedNetQty(): number {

    const qty = Number(this.entry.quantity ?? 0);
    const lossPercent = Number(this.entry.normalLoss ?? 0);

    const lossQty = qty * (lossPercent / 100);

    return qty - lossQty;

  }

  get calculatedAmount(): number {

    const rate = Number(this.entry.rate ?? 0);

    return this.calculatedNetQty * rate;

  }

  get totalQty(): number {

    return this.items.reduce((sum, i) => sum + i.quantity, 0);

  }

  private recalculateTotals(): void {

    const productValue =
      this.items.reduce((sum, i) => sum + i.amount, 0);

    this.invoice.productValue = productValue;

    const primary = Number(this.invoice.primaryTransport ?? 0);
    const secondary = Number(this.invoice.secondaryTransport ?? 0);
    const discount = Number(this.invoice.discount ?? 0);

    this.invoice.invoiceValue =
      productValue + primary + secondary - discount;

  }

  onExtraCostChange(): void {
    this.recalculateTotals();
  }

  get selectedProductStock(): number {

    const product = this.products.find(p => p.id === this.entry.productId);

    return product?.currentStock ?? 0;

  }

  /* =========================
     ADD ITEM
  ========================= */

  addItem(): void {

    const productId = Number(this.entry.productId);
    const rate = Number(this.entry.rate ?? 0);
    const netQty = this.calculatedNetQty;
    const amount = this.calculatedAmount;

    if (!productId) {
      this.toast.error('Select product.');
      return;
    }

    if (netQty <= 0) {
      this.toast.error('Invalid quantity.');
      return;
    }

    if (rate <= 0) {
      this.toast.error('Invalid rate.');
      return;
    }

    const selected = this.products.find(p => p.id === productId);
    if (!selected) return;

    if (this.editingIndex !== null) {

      this.items[this.editingIndex] = {
        productId: selected.id,
        productName: selected.productName,
        productCode: selected.productCode,
        quantity: netQty,
        rate,
        amount
      };

      this.editingIndex = null;

    } else {

      const existing = this.items.find(i => i.productId === productId);

      if (existing) {

        existing.quantity += netQty;
        existing.amount = existing.quantity * existing.rate;

      } else {

        this.items.push({
          productId: selected.id,
          productName: selected.productName,
          productCode: selected.productCode,
          quantity: netQty,
          rate,
          amount
        });

      }

    }

    this.clearEntry();
    this.recalculateTotals();

  }

  editItem(index: number): void {

    const item = this.items[index];

    this.editingIndex = index;

    this.entry.productId = item.productId;

    const product = this.products.find(p => p.id === item.productId);

    if (product) {
      this.entry.productSubCategoryId = product.subCategoryId;
    }

    this.entry.quantity = item.quantity;
    this.entry.rate = item.rate;
    this.entry.normalLoss = 0;

  }

  removeItem(index: number): void {

    this.items.splice(index, 1);
    this.recalculateTotals();

  }

  private clearEntry(): void {

    this.entry = {
      productSubCategoryId: 0,
      productId: 0,
      quantity: null,
      rate: null,
      normalLoss: null
    };

    this.editingIndex = null;

  }

  /* =========================
     SAVE
  ========================= */

  onSave(): void {

    if (this.poMandatory && !this.selectedPurchaseOrderId) {
      this.toast.error('Purchase Order is mandatory.');
      return;
    }

    if (!this.invoice.supplierId) {
      this.toast.error('Please select supplier.');
      return;
    }

    if (!this.invoice.location) {
      this.toast.error('Please select location.');
      return;
    }

    if (this.items.length === 0) {
      this.toast.error('Add at least one product.');
      return;
    }

    const payload = {

      purchaseOrderId: this.selectedPurchaseOrderId || null,

      invoiceDate: this.invoice.invoiceDate,
      supplierId: this.invoice.supplierId,
      location: this.invoice.location,
      reference: this.invoice.reference,
      purchaseType: this.invoice.purchaseType,

      primaryTransport: this.invoice.primaryTransport ?? 0,
      secondaryTransport: this.invoice.secondaryTransport ?? 0,
      discount: this.invoice.discount ?? 0,

      notes: this.invoice.notes,

      items: this.items.map(i => ({
        productId: i.productId,
        quantity: Number(i.quantity),
        rate: Number(i.rate)
      }))

    };

    this.saving = true;

    if (this.isEditMode && this.invoiceId) {

      this.api.updatePurchaseInvoice(this.invoiceId, payload).subscribe({

        next: () => {
          this.toast.success('Purchase invoice updated successfully.');
          this.router.navigate(['/purchase/invoice']);
        },

        error: () => {
          this.toast.error('Failed to update purchase invoice.');
          this.saving = false;
        }

      });

    } else {

      this.api.createPurchaseInvoice(payload).subscribe({

        next: () => {
          this.toast.success('Purchase invoice created successfully.');
          this.resetInvoice();
          this.saving = false;
        },

        error: () => {
          this.toast.error('Failed to create purchase invoice.');
          this.saving = false;
        }

      });

    }

  }

  /* =========================
     RESET
  ========================= */

  resetInvoice(): void {

    const now = new Date();

    this.invoice = {
      invoiceNo: '',
      invoiceDate: now.toISOString().substring(0, 10),
      location: '',
      reference: '',
      supplierId: 0,
      purchaseType: 'Finished',

      productValue: 0,

      primaryTransport: null,
      secondaryTransport: null,
      discount: null,

      invoiceValue: 0,

      status: 'Draft',
      notes: ''
    };

    this.items = [];
    this.selectedPurchaseOrderId = 0;
    this.poLocked = false;

    this.clearEntry();

    this.loadNextInvoiceNumber();

  }

  goBack(): void {
    this.router.navigate(['/purchase/invoice']);
  }

  selectProductFromShelf(p: Product): void {

    this.entry.productId = p.id;
    this.entry.productSubCategoryId = p.subCategoryId;

  }

  formatNumber(value: number | null): string {

    if (value === null || value === undefined) return '';

    return new Intl.NumberFormat('en-US').format(value);

  }

  parseNumber(value: string): number {

    if (!value) return 0;

    return Number(value.replace(/,/g, ''));

  }

}