import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';


/* =========================================================
   INTERFACES
========================================================= */

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

interface PurchaseOrderItem {
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


/* =========================================================
   COMPONENT
========================================================= */

@Component({
  selector: 'app-purchase-order-form-page-old',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent
  ],
templateUrl: './purchase-order-form-page-old.html',
styleUrls: ['./purchase-order-form-page-old.css']
})

export class PurchaseOrderFormPage implements OnInit {


  /* =========================================================
     CONSTRUCTOR
  ========================================================= */

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private toast: ToastService
  ) {}


  /* =========================================================
     STATE VARIABLES
  ========================================================= */

  loading = false;
  saving = false;

  suppliers: Supplier[] = [];
  products: Product[] = [];
  productSubCategories: ProductSubCategory[] = [];

  shelfSearch = '';
  editingIndex: number | null = null;

  mode: 'add' | 'edit' | 'view' = 'add';
  orderId: number | null = null;


  /* =========================================================
     FORM MODE HELPERS
  ========================================================= */

  get isProcessed(): boolean {
    return this.order.status === 'Processed';
  }

  get isViewMode(): boolean {
    return this.mode === 'view' || this.isProcessed;
  }

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }

  get isAddMode(): boolean {
    return this.mode === 'add';
  }


  /* =========================================================
     ORDER MODEL
  ========================================================= */

  order = {
    orderNo: '',
    orderDate: '',
    supplierId: 0,
    productValue: null as number | null,
    orderValue: null as number | null,
    status: 'Draft',
    notes: ''
  };

  entry = {
    productSubCategoryId: 0,
    productId: 0,
    quantity: 0,
    rate: 0
  };

  items: PurchaseOrderItem[] = [];


  /* =========================================================
     INIT
  ========================================================= */

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      const id = params['id'];
      const mode = params['mode'];

      if (mode) this.mode = mode;
      if (id) this.orderId = Number(id);

      this.initializeForm();

    });

  }


  /* =========================================================
     FORM INITIALIZATION
  ========================================================= */

  private initializeForm(): void {

    this.loadSuppliers();
    this.loadPurchasableProducts();

  }


  /* =========================================================
     LOAD SUPPLIERS
  ========================================================= */

  private loadSuppliers(): void {

    this.api.getSuppliers().subscribe({
      next: data => this.suppliers = data ?? []
    });

  }


  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  private loadPurchasableProducts(): void {

    this.api.getPurchasableProducts().subscribe({

      next: (data: Product[]) => {

        this.products = data ?? [];

        this.loadSubCategories();

        if (this.orderId) {
          this.loadPurchaseOrder(this.orderId);
        } else {
          this.resetOrder();
        }

      }

    });

  }


  /* =========================================================
     DERIVE SUBCATEGORIES
  ========================================================= */

  private loadSubCategories(): void {

    const map = new Map<number, boolean>();

    this.products.forEach(p => map.set(p.subCategoryId, true));

    this.api.getSubCategories().subscribe({

      next: (subs: any[]) => {

        this.productSubCategories = subs
          .filter(sc => map.has(sc.id))
          .map(sc => ({
            id: sc.id,
            subCategoryName: sc.subCategoryName
          }));

      }

    });

  }


  /* =========================================================
     NEXT ORDER NUMBER
  ========================================================= */

  private loadNextOrderNumber(): void {

    if (!this.isAddMode) return;

    this.api.getNextPurchaseOrderNumber().subscribe({
      next: number => this.order.orderNo = number
    });

  }


  /* =========================================================
     LOAD PURCHASE ORDER
  ========================================================= */

  private loadPurchaseOrder(id: number): void {

    this.loading = true;

    this.api.getPurchaseOrderById(id).subscribe({

      next: (data: any) => {

        this.order.orderNo = data.orderNo;
        this.order.orderDate = data.orderDate?.substring(0,10);
        this.order.supplierId = data.supplierId;
        this.order.status = data.status;
        this.order.notes = data.notes ?? '';

        this.items = (data.items ?? []).map((i:any)=>{

          const product = this.products.find(p=>p.id===i.productId);

          return {
            productId: i.productId,
            productName: product?.productName ?? '',
            productCode: product?.productCode ?? '',
            quantity: i.quantity,
            rate: i.rate,
            amount: i.amount
          };

        });

        this.recalculateTotals();
        this.loading = false;

      },

      error: () => {

        this.toast.error('Failed to load purchase order.');
        this.loading = false;

      }

    });

  }


  /* =========================================================
     PRODUCT FILTER
  ========================================================= */

  get filteredProducts(): Product[] {

    if (!this.entry.productSubCategoryId)
      return this.products;

    return this.products.filter(
      p => p.subCategoryId === this.entry.productSubCategoryId
    );

  }


  /* =========================================================
     SHELF FILTER
  ========================================================= */

  get filteredShelfProducts(): Product[] {

    let list = this.products;

    if (this.entry.productSubCategoryId) {
      list = list.filter(p => p.subCategoryId === this.entry.productSubCategoryId);
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


  /* =========================================================
     SHELF SELECT
  ========================================================= */

  selectProductFromShelf(product: Product): void {

    if (this.isViewMode) return;

    this.entry.productId = product.id;
    this.entry.productSubCategoryId = product.subCategoryId ?? 0;

  }


  /* =========================================================
     CALCULATIONS
  ========================================================= */

  get calculatedAmount(): number {

    if (!this.entry.quantity || !this.entry.rate) return 0;

    return Number(this.entry.quantity) * Number(this.entry.rate);

  }

  get totalQty(): number {

    return this.items.reduce((sum,i)=>sum+i.quantity,0);

  }

  get selectedProductStock(): number {

    const product = this.products.find(p => p.id === this.entry.productId);

    return product?.currentStock ?? 0;

  }


  /* =========================================================
     EDIT ITEM
  ========================================================= */

  onEditItem(index: number): void {

    if (this.isViewMode) return;

    const item = this.items[index];

    this.entry = {
      productSubCategoryId: 0,
      productId: item.productId,
      quantity: item.quantity,
      rate: item.rate
    };

    this.editingIndex = index;

  }


  /* =========================================================
     ADD / UPDATE ITEM
  ========================================================= */

  addItem(): void {

    if (this.isViewMode) return;

    const productId = Number(this.entry.productId);
    const qty = Number(this.entry.quantity);
    const rate = Number(this.entry.rate);

    if (!productId) {
      this.toast.error('Select product.');
      return;
    }

    if (qty <= 0 || rate <= 0) {
      this.toast.error('Invalid quantity or rate.');
      return;
    }

    const selected = this.products.find(p=>p.id===productId);
    if (!selected) return;

    const amount = qty * rate;

    if (this.editingIndex !== null){

      this.items[this.editingIndex] = {
        productId:selected.id,
        productName:selected.productName,
        productCode:selected.productCode,
        quantity:qty,
        rate,
        amount
      };

      this.editingIndex = null;

    } else {

      const exists = this.items.some(i=>i.productId===productId);

      if (exists){
        this.toast.error('Product already added.');
        return;
      }

      this.items.push({
        productId:selected.id,
        productName:selected.productName,
        productCode:selected.productCode,
        quantity:qty,
        rate,
        amount
      });

    }

    this.clearEntry();
    this.recalculateTotals();

  }


  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  removeItem(index:number): void {

    if (this.isViewMode) return;

    this.items.splice(index,1);
    this.recalculateTotals();

  }


  /* =========================================================
     TOTAL CALCULATION
  ========================================================= */

  private recalculateTotals(): void {

    const total = this.items.reduce((sum,i)=>sum+i.amount,0);

    this.order.productValue = total || null;
    this.order.orderValue = total || null;

  }


  /* =========================================================
     SAVE ORDER
  ========================================================= */

  onSave(): void {

    if (!this.order.supplierId){
      this.toast.error('Please select supplier.');
      return;
    }

    if (this.items.length === 0){
      this.toast.error('Add at least one product.');
      return;
    }

    const payload = {

      orderDate:this.order.orderDate,
      supplierId:this.order.supplierId,
      status:this.order.status,
      notes:this.order.notes,

      items:this.items.map(i=>({
        productId:i.productId,
        quantity:Number(i.quantity),
        rate:Number(i.rate)
      }))

    };

    this.saving = true;

    this.api.createPurchaseOrder(payload).subscribe({

      next: () => {

        this.toast.success('Purchase order created successfully.');
        this.router.navigate(['/purchase/order']);

      },

      error:()=>{

        this.toast.error('Failed to create purchase order.');
        this.saving = false;

      }

    });

  }


  /* =========================================================
     CLEAR ENTRY
  ========================================================= */

  private clearEntry(): void {

    this.entry = {
      productSubCategoryId:0,
      productId:0,
      quantity:0,
      rate:0
    };

  }


  /* =========================================================
     RESET ORDER
  ========================================================= */

  resetOrder(): void {

    const now = new Date();

    this.order = {
      orderNo:'',
      orderDate: now.toISOString().substring(0,10),
      supplierId:0,
      productValue:null,
      orderValue:null,
      status:'Draft',
      notes:''
    };

    this.items=[];
    this.editingIndex=null;

    this.clearEntry();
    this.loadNextOrderNumber();

  }


  /* =========================================================
     BACK
  ========================================================= */

  goBack(): void {

    this.router.navigate(['/purchase/order']);

  }

}