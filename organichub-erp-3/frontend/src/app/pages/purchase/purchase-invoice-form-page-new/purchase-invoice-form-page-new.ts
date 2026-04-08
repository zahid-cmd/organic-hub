import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';

import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-purchase-invoice-form-page-new',
  standalone: true,
  imports: [CommonModule, FormsModule, PageSubHeaderComponent, OrganicToast],
  templateUrl: './purchase-invoice-form-page-new.html',
  styleUrls: ['./purchase-invoice-form-page-new.css']

})
export class PurchaseInvoiceFormPageNewComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  status: string = 'Draft';
  invoiceId: number | null = null;
  saving = false;
  documentType: 'DIRECT' | 'PO' = 'DIRECT';

  isPurchaseOrderMandatory = false;
  isEditPoDrivenInvoice = false;
  purchaseTypeLocked = false;

  suppliers: any[] = [];
  warehouses: any[] = [];
  purchaseOrders: any[] = [];
  purchaseTypes: any[] = [];
  products: any[] = [];
  shelfProducts: any[] = [];
  filteredProducts: any[] = [];
  productSubCategories: any[] = [];

  selectedPurchaseTypeId: number | null = null;
  selectedPurchaseOrderId: number | null = null;
  approvedPurchaseOrders: any[] = [];
  lastPurchaseRate: number | null = null;
  
  productSearch = '';

  entry: any = {
    productSubCategoryId: null,
    productId: null,
    quantity: null,
    rate: null,
    normalLoss: null
  };

  selectedProductStock: number | null = null;

  showShelfPopup = false;
  popupProduct: any = null;
  popupQty = 1;
  popupRate = 0;
  popupLoss = 0;

  isPopupEditMode = false;
  popupEditIndex: number | null = null; 

  invoice: any = {
    invoiceNumber: '',
    invoiceDate: '',
    supplierId: null,
    warehouseId: null,
    reference: '',
    productValue: null,
    primaryTransport: null,
    secondaryTransport: null,
    discount: null,
    invoiceValue: null,
    notes: '',
    items: []
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {}

  // ================= GETTERS =================

  get isPoDriven(): boolean {

    /* EDIT / VIEW */
    if (this.mode !== 'add') {
      return this.isEditPoDrivenInvoice;
    }

    /* ADD MODE — SIMPLE LAW */
    return !!this.selectedPurchaseOrderId;

  }

  get isInvoiceEntryLocked(): boolean {
    if (this.mode === 'view') return true;
    if (this.isPoDriven && !this.selectedPurchaseOrderId) return true;
    return false;
  }
  // ================= ENTRY ENGINE =================

  get effectiveNetQty() {

    if (!this.entry.quantity) return null;

    const loss = Number(this.entry.normalLoss || 0);

    return this.entry.quantity - (this.entry.quantity * loss / 100);
  }

  get effectiveAmount() {

    if (!this.effectiveNetQty || !this.entry.rate) return null;

    return this.effectiveNetQty * this.entry.rate;
  }

  get effectiveRate() {

    if (!this.entry.quantity || !this.entry.rate) return null;

    const netQty = this.effectiveNetQty;

    if (!netQty) return this.entry.rate;

    return (this.entry.quantity * this.entry.rate) / netQty;

  }

    get isPurchaseTypeLockedByCart(): boolean {
    return this.documentType === 'DIRECT' && this.invoice.items?.length > 0;
  }

  @ViewChild('qtyInput') qtyInput!: ElementRef;
  @ViewChild('rateInput') rateInput!: ElementRef;
  @ViewChild('lossInput') lossInput!: ElementRef;
  @ViewChild('addBtn') addBtn!: ElementRef;

  focusQty() {
    setTimeout(() => {
      const el = this.qtyInput?.nativeElement;
      el.focus();
      el.select();
    }, 50);
  }

  focusRate() {
    setTimeout(() => {
      const el = this.rateInput?.nativeElement;
      el.focus();
      el.select();
    }, 50);
  }

  focusLoss() {
    setTimeout(() => {
      const el = this.lossInput?.nativeElement;
      el.focus();
      el.select();
    }, 50);
  }

  focusAddBtn() {
    setTimeout(() => {
      const el = this.addBtn?.nativeElement;
      el.focus();
    }, 50);
  }

  @ViewChild('entryQtyInput') entryQtyInput!: ElementRef;
  @ViewChild('entryRateInput') entryRateInput!: ElementRef;
  @ViewChild('entryLossInput') entryLossInput!: ElementRef;
  @ViewChild('entryAddBtn') entryAddBtn!: ElementRef;

  focusEntryQty() {
  setTimeout(() => {
    const el = this.entryQtyInput?.nativeElement;
    el?.focus();
    el?.select();
  }, 50);
  }

  focusEntryRate() {
    setTimeout(() => {
      const el = this.entryRateInput?.nativeElement;
      el?.focus();
      el?.select();
    }, 50);
  }

  focusEntryLoss() {
    setTimeout(() => {
      const el = this.entryLossInput?.nativeElement;
      el?.focus();
      el?.select();
    }, 50);
  }

  focusEntryAddBtn() {
    setTimeout(() => {
      const el = this.entryAddBtn?.nativeElement;
      el?.focus();
    }, 50);
  }

  getLastPurchaseRate(product: any): number | null {

    return Number(
        product?.lastPurchaseRate ??
        product?.lastRate ??
        product?.purchasePrice ??
        0
    ) || null;

  }
  // ================= INIT =================

  ngOnInit() {

    this.route.queryParams.subscribe(p => {

      this.mode = p['mode'] || 'add';
      this.invoiceId = p['id'] ? +p['id'] : null;

      if (this.mode !== 'add' && this.invoiceId) {
        this.preloadInvoiceThenMasters();
      } else {
        this.loadMastersOnly();
      }

    });

  }



  // ================= PRELOAD INVOICE (EDIT / VIEW SAFE) =================

  preloadInvoiceThenMasters() {

    this.api.getPurchaseInvoiceById(this.invoiceId!)
      .subscribe((inv: any) => {

        /* ===== DECIDE DOCUMENT TYPE FIRST ===== */

        this.documentType =
          inv.purchaseOrderId ? 'PO' : 'DIRECT';

        this.isEditPoDrivenInvoice =
          !!inv.purchaseOrderId;

        /* ===== SAFE HEADER PRE-BIND (Before Master Load) ===== */

        this.selectedPurchaseOrderId =
          inv.purchaseOrderId ?? null;

        this.selectedPurchaseTypeId =
          inv.purchaseTypeId ?? null;

        /* ⭐ IMPORTANT
          Do NOT map items here
          Do NOT inject PO list here
          Do NOT call any PO loader here
        */

        /* ===== LOAD ALL MASTERS THEN MAP INVOICE ===== */

        this.loadMastersOnly(true);

      });

  }

  // ================= MASTER LOADER =================

  loadMastersOnly(loadInvoiceAfter = false) {

    forkJoin({
      config: this.api.getConfigurationSettings(),
      suppliers: this.api.getSuppliers(),
      warehouses: this.api.getWarehouses(),
      purchaseTypes: this.api.getProductTypes(),
      purchaseOrders: this.api.getApprovedPurchaseOrders(),
      products: this.api.getPurchasableProducts()
    })
    .subscribe((res: any) => {

      const pg = (res.config || [])
        .find((x: any) => x.configurationCode === 'PG-001');

      this.isPurchaseOrderMandatory = pg?.isEnabled === true;
      /* ⭐⭐⭐ ERP CRITICAL — DEFAULT DOCUMENT TYPE LAW */

      if (this.mode === 'add' && this.isPurchaseOrderMandatory) {
        this.documentType = 'PO';
      }

      this.suppliers = res.suppliers || [];
      this.warehouses = res.warehouses || [];

      this.purchaseTypes =
        (res.purchaseTypes || [])
        .filter((x: any) =>
          x.isPurchasable && x.status === 'Active'
        );

      /* ================= PURCHASE ORDER MASTER ================= */

      this.purchaseOrders = res.purchaseOrders || [];

      /* ⭐ ERP CRITICAL — Inject Saved PO in Edit / View */

      if (this.mode !== 'add' && this.selectedPurchaseOrderId) {

        const exists =
          this.purchaseOrders.some(
            (x: any) => x.id === this.selectedPurchaseOrderId
          );

        if (!exists) {

          this.api
            .getPurchaseOrderById(this.selectedPurchaseOrderId)
            .subscribe((po: any) => {

              if (po) {

                this.purchaseOrders.unshift({
                  id: po.id,
                  orderNo: po.orderNo
                });

              }

            });

        }

      }

      /* ⭐ MASTER PRODUCT LIST */
      this.products = res.products || [];
      // ⭐ VERY IMPORTANT — INITIAL TYPE FILTER TRIGGER
      if (this.selectedPurchaseTypeId) {

        this.loadSubCategoriesByPurchaseType();

        this.applyProductFilters();

        this.filterShelfByPurchaseType();

      }

      /* ⭐ PRODUCT SHELF ENGINE — ALWAYS FULL */
      this.shelfProducts = [...this.products];

      /* ⭐ ADD SECTION FILTER ENGINE */
      this.filteredProducts = [...this.products];



      if (this.mode === 'add') {

        this.loadNextNumber();

        const today = new Date();
        this.invoice.invoiceDate =
          today.toISOString().substring(0, 10);

      }

      if (loadInvoiceAfter && this.invoiceId) {
        this.loadInvoiceFinalMapping();
      }
      /* ⭐ VERY IMPORTANT — APPLY SHELF LOCK STATE ON LOAD */
      this.applyPoShelfLockState();

    });

  }

  applyPoShelfLockState() {

    if (
        this.documentType === 'PO' ||
        this.isEditPoDrivenInvoice ||
        this.isPurchaseOrderMandatory
      ) {

      this.purchaseTypeLocked = true;

    }

  }

  filterShelfProducts() {

    const term =
      (this.productSearch || '').toLowerCase();

    this.shelfProducts =
      this.products.filter(p => {

        const matchSearch =
          p.productName.toLowerCase().includes(term);

        const matchType =
          !this.purchaseTypeLocked ||
          p.purchaseTypeId === this.selectedPurchaseTypeId ||
          p.productTypeId === this.selectedPurchaseTypeId ||
          p.purchaseType?.id === this.selectedPurchaseTypeId;

        return matchSearch && matchType;

      });

  }


  // =====================================================
  // FINAL INVOICE LOAD ENGINE ⭐ ERP SAFE (EDIT / VIEW)
  // =====================================================

  loadInvoiceFinalMapping() {

  this.api.getPurchaseInvoiceById(this.invoiceId!)
  .subscribe((d: any) => {


    /* ⭐⭐⭐ ERP HARD LOCK ENGINE ⭐⭐⭐ */
    if ((d.status ?? '').toUpperCase() === 'POSTED') {

      this.mode = 'view';        // force VIEW mode
      this.status = 'Posted';

      this.toast.error('Posted Purchase Invoice is read-only');

    } else {

      this.status = d.status ?? 'Draft';

    }

    /* ================= HEADER ================= */

    this.invoice.invoiceNumber = d.invoiceNo;

    this.invoice.invoiceDate =
      d.invoiceDate
        ? d.invoiceDate.substring(0, 10)
        : null;

    this.invoice.supplierId = d.supplierId ?? null;
    this.invoice.warehouseId = d.warehouseId ?? null;
    this.invoice.reference = d.reference ?? '';

    this.invoice.primaryTransport = Number(d.primaryTransport ?? 0);
    this.invoice.secondaryTransport = Number(d.secondaryTransport ?? 0);
    this.invoice.discount = Number(d.discount ?? 0);

    this.invoice.notes = d.notes ?? '';

    this.selectedPurchaseOrderId = d.purchaseOrderId ?? null;
    this.selectedPurchaseTypeId = d.purchaseTypeId ?? null;

    /* ================= DOCUMENT TYPE ================= */

    this.documentType =
      d.purchaseOrderId ? 'PO' : 'DIRECT';

    this.isEditPoDrivenInvoice =
      !!d.purchaseOrderId;

    /* ================= ITEMS ================= */

    this.invoice.items =
      (d.items || []).map((i: any) => {

        const commercialQty = Number(i.commercialQty ?? 0);
        const loss = Number(i.normalLossPercent ?? 0);
        const netQty = Number(i.quantity ?? 0);
        const commercialRate = Number(i.commercialRate ?? 0);
        const effectiveRate = Number(i.rate ?? 0);

        return {
          productId: i.productId,
          productName: i.productName,
          commercialQty: commercialQty,
          normalLoss: loss,
          qty: netQty,
          commercialRate: commercialRate,
          rate: effectiveRate
        };

      });

    /* ================= DIRECT TYPE LOCK ================= */

    if (
      this.documentType === 'DIRECT' &&
      this.invoice.items?.length
    ) {

      this.purchaseTypeLocked = true;
      this.filterShelfByPurchaseType();
      this.applyProductFilters();

    }

    /* ================= TOTAL ================= */

    this.calculateTotals();

    /* ================= PO LOCK ================= */

    this.applyPoShelfLockState();

  });


  }

  // ================= HELPERS =================

  buildSubCategories(source: any[]) {

    const map = new Map<number, any>();

    (source || []).forEach(p => {
      if (p.subCategoryId && !map.has(p.subCategoryId)) {
        map.set(p.subCategoryId, {
          id: p.subCategoryId,
          subCategoryName: p.subCategoryName
        });
      }
    });

    this.productSubCategories = Array.from(map.values());

  }

  filterProducts() {

    const term = this.productSearch.toLowerCase();

    this.filteredProducts =
      this.products.filter(p =>
        p.productName.toLowerCase().includes(term)
      );

  }

  loadNextNumber() {
    this.api.getNextPurchaseInvoiceNumber()
      .subscribe(n => this.invoice.invoiceNumber = n);
  }

  onBack() {
    this.router.navigate(['/purchase/invoice']);
  }

  // ================= CALCULATION =================

  calculateTotals() {

    if (!this.invoice.items.length) {
      this.invoice.productValue = null;
      this.invoice.invoiceValue = null;
      return;
    }

    const pv =
      this.invoice.items.reduce((s: number, i: any) =>
        s + (Number(i.qty || 0) * Number(i.rate || 0)), 0);

    this.invoice.productValue = pv;

    const extra =
      Number(this.invoice.primaryTransport || 0)
      + Number(this.invoice.secondaryTransport || 0)
      - Number(this.invoice.discount || 0);

    this.invoice.invoiceValue = pv + extra;

  }
  onExtraCostChange() {
    this.calculateTotals();
  }
  // ================= HEADER ACTIONS =================
  buildPayload() {

    return {
      status: this.status,   // ⭐ VERY IMPORTANT
      id: this.invoiceId ?? 0,

      purchaseOrderId:
        this.documentType === 'PO'
          ? this.selectedPurchaseOrderId
          : null,

      purchaseTypeId: this.selectedPurchaseTypeId,
      supplierId: this.invoice.supplierId,
      warehouseId: this.invoice.warehouseId,
      reference: this.invoice.reference,
      invoiceDate: this.invoice.invoiceDate,

      primaryTransport: Number(this.invoice.primaryTransport || 0),
      secondaryTransport: Number(this.invoice.secondaryTransport || 0),
      discount: Number(this.invoice.discount || 0),
      notes: this.invoice.notes,

      items:
        (this.invoice.items || []).map((x: any) => ({

          productId: Number(x.productId),

          commercialQty: Number(x.commercialQty ?? x.qty),

          normalLossPercent: Number(x.normalLoss ?? 0),

          quantity: Number(x.qty),

          commercialRate: Number(x.commercialRate ?? x.rate),

          rate: Number(x.rate),

          amount: Number(x.qty) * Number(x.rate)

        }))

      };

  }

  validateBeforeSave(): boolean {

    if (!this.invoice.supplierId) {
      this.toast.error('Select Supplier');
      return false;
    }

    if (!this.invoice.items.length) {
      this.toast.error('Add at least one product');
      return false;
    }

    return true;

  }

  onSaveDraft() {
  this.status = 'Draft';
  this.saveInternal();
  }

  onPost() {

    if (this.saving) return;

    if (this.status === 'Posted') {
      this.toast.error('Invoice already posted');
      return;
    }

    this.status = 'Posted';
    this.saveInternal();

  }

  saveInternal() {

  if (this.saving) return;

  /* ================= BASIC VALIDATION ================= */

  if (!this.invoice.invoiceDate) {
  this.toast.error('Invoice Date required');
  return;
  }

  if (!this.invoice.warehouseId) {
  this.toast.error('Select Location');
  return;
  }

  if (!this.invoice.reference || !this.invoice.reference.trim()) {
  this.toast.error('Enter Bill / Memo / Mushok Number');
  return;
  }

  if (!this.invoice.supplierId) {
  this.toast.error('Select Supplier');
  return;
  }

  if (!this.selectedPurchaseTypeId) {
  this.toast.error('Select Purchase Type');
  return;
  }

  if (!this.invoice.items || !this.invoice.items.length) {
  this.toast.error('Add Product to Cart');
  return;
  }

  if (this.documentType === 'PO' && !this.selectedPurchaseOrderId) {
  this.toast.error('Select Purchase Order');
  return;
  }

  /* ================= BUILD PAYLOAD ================= */

  const payload = {
  ...this.buildPayload(),
  status: this.status,
  warehouseId: this.invoice.warehouseId
  };

  console.log('PI SAVE PAYLOAD >>>', payload);

  this.saving = true;

  const request$ =
  this.mode === 'edit'
  ? this.api.updatePurchaseInvoice(this.invoiceId!, payload)
  : this.api.createPurchaseInvoice(payload);

  request$.subscribe({
  next: () => {


    this.toast.success(
      this.status === 'Posted'
        ? 'Purchase Invoice Posted Successfully'
        : 'Draft Saved Successfully'
    );

    this.router.navigate(['/purchase/invoice']);

  },
  error: (err) => {

    console.error('PI SAVE ERROR >>>', err);

    this.toast.error(
      err?.error?.message ||
      'Server rejected Purchase Invoice'
    );

    this.saving = false;

  }

  });

  }


  onReset() {

    /* ⭐ PO Driven → No Reset Allowed */
    if (this.documentType === 'PO') return;

    /* ================= HEADER RESET ================= */

    this.invoice.supplierId = null;
    this.selectedPurchaseTypeId = null;

    this.invoice.location = null;
    this.invoice.reference = '';

    this.invoice.primaryTransport = null;
    this.invoice.secondaryTransport = null;
    this.invoice.discount = null;

    this.invoice.notes = '';

    /* ================= CART RESET ⭐ VERY IMPORTANT ================= */

    this.invoice.items = [];

    /* ================= PURCHASE TYPE LOCK RELEASE ================= */

    this.purchaseTypeLocked = false;
    this.productSubCategories = [];

    /* ================= ENTRY RESET ================= */

    this.entry = {
      productSubCategoryId: null,
      productId: null,
      quantity: null,
      rate: null,
      normalLoss: null
    };

    this.selectedProductStock = null;

    /* ================= SHELF RESET ================= */

    this.productSearch = '';

    this.filteredProducts = [...this.products];
    this.shelfProducts = [...this.products];

    /* ================= TOTAL RESET ================= */

    this.invoice.productValue = null;
    this.invoice.invoiceValue = null;

  }

  // ================= DOCUMENT TYPE CHANGE =================

  onPurchaseOrderChange() {

    /* ⭐⭐⭐ VERY IMPORTANT — DO NOTHING IN EDIT / VIEW ⭐⭐⭐ */

    if (this.mode !== 'add') {
      return;
    }

    /* ================= NO PO SELECTED ================= */

    if (!this.selectedPurchaseOrderId) {

      this.documentType =
        this.isPurchaseOrderMandatory ? 'PO' : 'DIRECT';

      this.invoice.supplierId = null;
      this.selectedPurchaseTypeId = null;
      this.invoice.location = null;
      this.invoice.reference = '';

      this.invoice.items = [];
      this.calculateTotals();

      return;
    }

    /* ================= PO SELECTED (ADD MODE ONLY) ================= */

    this.documentType = 'PO';

    this.api.getPurchaseOrderById(this.selectedPurchaseOrderId)
      .subscribe((po: any) => {

        this.invoice.supplierId = po.supplierId;

        this.selectedPurchaseTypeId =
          po.purchaseTypeId ?? null;

        this.invoice.location =
          po.location ?? null;

        this.invoice.reference =
          po.reference ?? '';

        /* ⭐ ERP SAFE PO → PI CART MAP */

        this.invoice.items =
          (po.items || []).map((i: any) => {

            const product =
              this.products.find(p => p.id === i.productId);

            const commercialQty =
              Number(i.remainingQty ?? i.quantity ?? 0);

            const commercialRate =
              Number(i.rate ?? 0);

            const normalLoss = 0;

            const netQty =
              commercialQty - (commercialQty * normalLoss / 100);

            const effectiveRate =
              netQty > 0
                ? (commercialQty * commercialRate) / netQty
                : commercialRate;

            return {

              productId: i.productId,
              productName: product?.productName ?? i.productName,

              commercialQty: commercialQty,
              normalLoss: normalLoss,

              qty: netQty,

              commercialRate: commercialRate,
              rate: effectiveRate

            };

          });

        this.calculateTotals();

      });

  }
  onPurchaseTypeChange() {

    this.entry.productSubCategoryId = null;
    this.entry.productId = null;

    this.loadSubCategoriesByPurchaseType();

    this.applyProductFilters();

    this.filterShelfByPurchaseType();

  }

  loadSubCategoriesByPurchaseType() {

    if (!this.selectedPurchaseTypeId) {
      this.productSubCategories = [];
      return;
    }

    this.api
      .getSubCategoriesByProductType(this.selectedPurchaseTypeId)
      .subscribe({

        next: (list: any[]) => {

          this.productSubCategories =
            (list || []).map(x => ({
              id: x.id,
              subCategoryName:
                x.subCategoryName ??
                x.name ??
                x.categoryName ??
                ('SubCat ' + x.id)
            }));

        },

        error: () => {
          this.productSubCategories = [];
        }

      });

  }

  onSubCategoryChange() {

    if (!this.entry.productSubCategoryId) {

      if (!this.purchaseTypeLocked) {
        this.selectedPurchaseTypeId = null;
      }

      this.applyProductFilters();
      return;
    }

    const productsOfSub =
      this.products.filter(p =>
        p.subCategoryId === this.entry.productSubCategoryId);

    const uniqueTypes =
      [...new Set(productsOfSub.map(p =>
        Number(p.purchaseTypeId ?? p.productTypeId)))];

    if (uniqueTypes.length === 1 && !this.purchaseTypeLocked) {
      this.selectedPurchaseTypeId = uniqueTypes[0];
    }

    this.applyProductFilters();

  }

  onProductChange() {

    if (!this.entry.productId) {

      this.entry.productSubCategoryId = null;
      this.selectedPurchaseTypeId = null;
      this.loadSubCategoriesByPurchaseType();
      this.applyProductFilters();
      this.filterShelfByPurchaseType();
      this.selectedProductStock = null;

      this.entry.rate = null;
      this.entry.quantity = null;
      this.entry.normalLoss = null;

      return;
    }

    const product =
      this.products.find(p => p.id === this.entry.productId);

    if (!product) return;

    /* ⭐ Bind Purchase Type FIRST */
    this.selectedPurchaseTypeId =
      Number(
        product.purchaseTypeId ??
        product.productTypeId ??
        product.purchaseType?.id ??
        0
      ) || null;

    /* ⭐ Load SubCategory list */
    this.loadSubCategoriesByPurchaseType();

    /* ⭐ Bind SubCategory */
    this.entry.productSubCategoryId =
      product.subCategoryId ?? null;

    /* ⭐ Reset Entry Inputs */
    this.entry.quantity = null;
    this.entry.normalLoss = null;
    this.entry.rate = null;

    /* ⭐ Bind Stock */
    this.selectedProductStock =
      product.stock ?? product.stockQty ?? 0;

    /* ⭐ Load Last Purchase Rate (Async Safe) */
    this.api.getLastPurchaseRate(product.id)
      .subscribe({
        next: (rate: number) => {

          const safeRate = Number(rate || 0);

          this.entry.rate =
            safeRate > 0 ? safeRate : null;

        },
        error: () => {
          this.entry.rate = null;
        }
      });

    /* ⭐ VERY IMPORTANT — Focus Qty AFTER UI Stable */
    setTimeout(() => this.focusEntryQty(), 150);

  }

  applyProductFilters() {

    this.filteredProducts = this.products.filter(p => {

      const type =
        Number(
          p.purchaseTypeId ??
          p.productTypeId ??
          p.purchaseType?.id
        );

      const matchType =
        !this.selectedPurchaseTypeId ||
        type === Number(this.selectedPurchaseTypeId);

      const matchSub =
        !this.entry.productSubCategoryId ||
        p.subCategoryId === this.entry.productSubCategoryId;

      return matchType && matchSub;

    });

  }


  /* =====================================================
  ADD PRODUCT ENGINE ⭐ FINAL — TYPE LOCK SAFE
  ===================================================== */

  addItem() {

    if (!this.entry.productId) {
      this.toast.error('Select Product');
      return;
    }

    const commercialQty = Number(this.entry.quantity || 0);
    const loss = Number(this.entry.normalLoss || 0);
    const commercialRate = Number(this.entry.rate || 0);

    if (!commercialQty || commercialQty <= 0) {
      this.toast.error('Enter Quantity');
      return;
    }

    if (!commercialRate || commercialRate <= 0) {
      this.toast.error('Enter Rate');
      return;
    }

    /* ⭐⭐⭐ DUPLICATE PRODUCT BLOCK ⭐⭐⭐ */

    const exists =
      this.invoice.items.some(
        (x: any) => x.productId === this.entry.productId
      );

    if (exists) {
      this.toast.error('Product already added');
      return;
    }

    const product =
      this.products.find(p => p.id === this.entry.productId);

    /* ⭐ DIRECT PURCHASE TYPE LOCK */

    if (this.documentType === 'DIRECT' && !this.purchaseTypeLocked) {

      const type =
        Number(
          product?.purchaseTypeId ??
          product?.productTypeId ??
          product?.purchaseType?.id ??
          0
        ) || null;

      this.selectedPurchaseTypeId = type;

      this.purchaseTypeLocked = true;

      this.filterShelfByPurchaseType();
      this.applyProductFilters();
    }

    /* ⭐ ERP CALCULATION LAW */

    const netQty =
      commercialQty - (commercialQty * loss / 100);

    const effectiveRate =
      netQty > 0
        ? (commercialQty * commercialRate) / netQty
        : commercialRate;

    this.invoice.items.push({

      productId: this.entry.productId,
      productName: product?.productName,

      commercialQty: commercialQty,
      normalLoss: loss,

      qty: netQty,

      commercialRate: commercialRate,
      rate: effectiveRate

    });

    /* ⭐ RESET INPUTS */

    this.entry.quantity = null;
    this.entry.rate = null;
    this.entry.normalLoss = null;

    this.calculateTotals();

    this.focusProductSelect();

  }



    @ViewChild('productSelect') productSelect!: ElementRef;

    focusProductSelect(){
      setTimeout(()=>{
        const el = this.productSelect?.nativeElement;
        el.focus();
        el.click();
      },60);
    }

  /* =====================================================
  CART POPUP LOAD ENGINE ⭐ FINAL — MASTER SAFE
  ===================================================== */

  openCartEditPopup(item: any, i: number) {

    if (this.mode === 'view') return;

    /* ⭐ SAFE PRODUCT OBJECT */
    this.popupProduct = {
      id: item.productId,
      productName: item.productName,
      stock: item.stock ?? null
    };

    /* ⭐⭐⭐ FINAL SAFE VALUE EXTRACTION ⭐⭐⭐ */

    const commQty =
      Number(item?.commercialQty);

    const loss =
      Number(item?.normalLoss);

    const commRate =
      Number(item?.commercialRate);

    const netQty =
      Number(item?.qty);

    const effRate =
      Number(item?.rate);

    /* ⭐ Qty Priority */
    if (!isNaN(commQty) && commQty > 0) {
      this.popupQty = commQty;
    }
    else if (!isNaN(netQty) && netQty > 0) {
      this.popupQty = netQty;
    }
    else {
      this.popupQty = 0;
    }

    /* ⭐ Loss */
    this.popupLoss =
      !isNaN(loss) ? loss : 0;

    /* ⭐ Rate Priority */
    if (!isNaN(commRate) && commRate > 0) {
      this.popupRate = commRate;
    }
    else if (!isNaN(effRate) && effRate > 0) {
      this.popupRate = effRate;
    }
    else {
      this.popupRate = 0;
    }

    /* ⭐ STATE */
    this.isPopupEditMode = true;
    this.popupEditIndex = i;

    this.showShelfPopup = true;

    setTimeout(() => this.focusQty(), 120);

  }

  /* =====================================================
  CART COST ENGINE ⭐ FINAL ERP SAFE
  ===================================================== */

  recalculateRowValues(item: any) {

    const comm =
      Number(item.commercialQty ?? item.qty ?? 0);

    const loss =
      Number(item.normalLoss ?? 0);

    const commRate =
      Number(item.commercialRate ?? item.rate ?? 0);

    const net =
      comm - (comm * loss / 100);

    const effectiveRate =
      net > 0
        ? (comm * commRate) / net
        : commRate;

    item.commercialQty = comm;
    item.normalLoss = loss;
    item.commercialRate = commRate;

    item.qty = net;
    item.rate = effectiveRate;

  }

  /* =====================================================
  QTY +
  ===================================================== */

  increaseQty(item: any) {

    if (this.mode === 'view') return;

    const base =
      Number(item.commercialQty ?? item.qty ?? 0);

    item.commercialQty = base + 1;

    this.recalculateRowValues(item);

    this.calculateTotals();

  }

  /* =====================================================
  QTY -
  ===================================================== */

  decreaseQty(item: any) {

    if (this.mode === 'view') return;

    const base =
      Number(item.commercialQty ?? item.qty ?? 0);

    if (base <= 1) return;

    item.commercialQty = base - 1;

    this.recalculateRowValues(item);

    this.calculateTotals();

  }

  /* =====================================================
  ROW MANUAL RECALC (Popup / Edit Safe)
  ===================================================== */

  recalculateRow(item: any) {

    this.recalculateRowValues(item);

    this.calculateTotals();

  }

  /* =====================================================
  REMOVE ITEM
  ===================================================== */

  removeItem(i: number) {

    this.invoice.items.splice(i, 1);

    if (!this.invoice.items.length) {

      this.purchaseTypeLocked = false;

      if (this.documentType === 'DIRECT') {
        this.selectedPurchaseTypeId = null;
      }

      this.productSearch = '';

      this.shelfProducts = [...this.products];
      this.applyProductFilters();

    }

    this.calculateTotals();

  }

  // ================= TOTAL GETTERS =================

  get totalQty() {

    if (!this.invoice.items.length) return null;

    return this.invoice.items.reduce(
      (s: number, i: any) => s + Number(i.qty || 0), 0
    );
  }

  get totalAmount() {

    if (!this.invoice.items.length) return null;

    return this.invoice.items.reduce(
      (s: number, i: any) =>
        s + (Number(i.qty || 0) * Number(i.rate || 0)), 0
    );
  }


  // ================= PRODUCT SHELF =================

  openShelfPopup(p: any) {

    /* ⭐⭐⭐ FINAL ERP LAW — PO DRIVEN → SHELF DEAD */
    if (this.isPoDriven || this.documentType === 'PO') {
      return;
    }

    /* ⭐ VIEW MODE */
    if (this.mode === 'view') return;

    this.popupProduct = p;

    this.popupQty = 1;
    this.popupLoss = 0;
    this.popupRate = 0;

    this.showShelfPopup = true;

    setTimeout(() => this.focusQty(), 120);

    this.api.getLastPurchaseRate(p.id)
      .subscribe({
        next: (rate: number) => {
          this.popupRate = Number(rate || 0);
        },
        error: () => {
          this.popupRate = 0;
        }
      });

  }

  closeShelfPopup() {

    this.showShelfPopup = false;
    this.popupProduct = null;

    this.isPopupEditMode = false;
    this.popupEditIndex = null;

  }


  /* =====================================================
  POPUP UPDATE ENGINE ⭐ FINAL ERP SAFE
  ===================================================== */

  addFromPopup() {

    /* ⭐ HARD LOCK — PO DRIVEN */
    if (this.isPoDriven) return;

    if (!this.popupProduct) return;

    const commercialQty = Number(this.popupQty || 0);
    const loss = Number(this.popupLoss || 0);
    const commercialRate = Number(this.popupRate || 0);

    if (!commercialQty || commercialQty <= 0) {
      this.toast.error('Invalid Quantity');
      return;
    }

    if (!commercialRate || commercialRate <= 0) {
      this.toast.error('Invalid Rate');
      return;
    }

    const netQty =
      commercialQty - (commercialQty * loss / 100);

    const effectiveRate =
      netQty > 0
        ? (commercialQty * commercialRate) / netQty
        : commercialRate;

    /* ================= EDIT MODE ================= */

    if (this.isPopupEditMode && this.popupEditIndex !== null) {

      const item = this.invoice.items[this.popupEditIndex];

      if (!item) return;

      item.commercialQty = commercialQty;
      item.normalLoss = loss;
      item.commercialRate = commercialRate;

      item.qty = netQty;
      item.rate = effectiveRate;

    }

    /* ================= ADD MODE ================= */

    else {

      /* ⭐ DUPLICATE BLOCK */
      const exists =
        this.invoice.items.some(
          (x: any) => x.productId === this.popupProduct.id
        );

      if (exists) {
        this.toast.error('Product already added');
        return;
      }

      /* ⭐ DIRECT PURCHASE TYPE LOCK */
      if (this.documentType === 'DIRECT' && !this.purchaseTypeLocked) {

        const masterProduct =
          this.products.find(p => p.id === this.popupProduct.id);

        if (masterProduct) {

          const type =
            Number(
              masterProduct.purchaseTypeId ??
              masterProduct.productTypeId ??
              masterProduct.purchaseType?.id ??
              0
            ) || null;

          this.selectedPurchaseTypeId = type;

          this.purchaseTypeLocked = true;

          this.filterShelfByPurchaseType();
          this.applyProductFilters();
        }

      }

      this.invoice.items.push({

        productId: this.popupProduct.id,
        productName: this.popupProduct.productName,

        commercialQty: commercialQty,
        normalLoss: loss,

        qty: netQty,

        commercialRate: commercialRate,
        rate: effectiveRate

      });

    }

    /* ================= TOTAL ================= */

    this.calculateTotals();

    /* ================= CLEANUP ================= */

    this.closeShelfPopup();

    this.isPopupEditMode = false;
    this.popupEditIndex = null;

  }

  /* =====================================================
  DIRECT PURCHASE TYPE CONTROL ENGINE ⭐ FINAL
  ===================================================== */

  detectAndLockPurchaseType(product: any) {

    if (this.documentType !== 'DIRECT') return;

    const type =
      Number(
        product?.purchaseTypeId ??
        product?.productTypeId ??
        product?.purchaseType?.id ??
        0
      ) || null;

    if (!this.purchaseTypeLocked) {

      this.selectedPurchaseTypeId = type;

      this.purchaseTypeLocked = true;

      this.filterShelfByPurchaseType();   // ⭐ VERY IMPORTANT
      this.applyProductFilters();

    }

  }

  /* =====================================================
  SHELF FILTER ENGINE ⭐ FINAL
  ===================================================== */

  filterShelfByPurchaseType() {

    if (!this.selectedPurchaseTypeId) {
      this.shelfProducts = [...this.products];
      return;
    }

    this.shelfProducts = this.products.filter(p => {

      const type =
        Number(
          p.purchaseTypeId ??
          p.productTypeId ??
          p.purchaseType?.id
        );

      return type === Number(this.selectedPurchaseTypeId);

    });

  }
  // ================= POPUP CALC =================

  get popupNetQty() {

    const loss = Number(this.popupLoss || 0);
    return this.popupQty - (this.popupQty * loss / 100);
  }

  get popupAmount() {

    if (!this.popupQty || !this.popupRate) return 0;

    return this.popupQty * this.popupRate;

  }

  get popupEffectiveRate() {

    const netQty = this.popupNetQty;

    if (!this.popupQty || !this.popupRate || !netQty) return null;

    return this.popupRate * (this.popupQty / netQty);

  }

  trackByPoId(index: number, item: any) {
    return item?.id;
  }

 

}