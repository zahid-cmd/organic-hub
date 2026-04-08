import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';

@Component({
selector: 'app-purchase-order-form-page-new',
standalone: true,
imports: [CommonModule,FormsModule,PageSubHeaderComponent,OrganicToast],
templateUrl: './purchase-order-form-page-new.html',
styleUrls: ['./purchase-order-form-page-new.css']
})
  export class PurchaseOrderFormPageNewComponent implements OnInit {

  /* ================= MODE ================= */

  mode:'add'|'edit'|'view'='add';
  orderId:number|null=null;

  get isLocked():boolean{
  return this.mode==='view';
  }

  /* ================= MASTER ================= */

  suppliers:any[]=[];
  purchaseTypes:any[]=[];
  products:any[]=[];
  allProducts:any[]=[];
  filteredProducts:any[]=[];
  subCategories:any[]=[];

  /* ================= ADD SECTION ================= */

  selectedPurchaseTypeId:number|null=null;
  selectedSubCategoryId:number|null=null;
  selectedProductId:number|null=null;

  addQty:number|null=null;
  addRate:number|null=null;

  editingIndex:number|null=null;

  /* ================= SHELF ================= */

  productSearch='';
  showShelfPopup=false;
  popupProduct:any=null;
  popupQty:number|null=null;
  popupRate:number|null=null;
  poPurchaseTypeLocked:boolean=false;
  

  /* ================= ORDER ================= */

  order:any={
  orderNumber:'',
  orderDate:'',
  supplierId:null,
  status:'Draft',
  notes:'',
  items:[]
  };

  constructor(
  private route:ActivatedRoute,
  private router:Router,
  private api:ApiService,
  private toast:ToastService
  ){}

  @ViewChild('qtyInput') qtyInput!:ElementRef;
  @ViewChild('rateInput') rateInput!:ElementRef;
  @ViewChild('addBtn') addBtn!:ElementRef;

  focusQtyInput(){
    setTimeout(()=>{
      const el = this.qtyInput?.nativeElement;
      el?.focus();
      el?.select();
    },50);
  }

  focusRateInput(){
    setTimeout(()=>{
      const el = this.rateInput?.nativeElement;
      if(el){
        el.focus();
        el.select();
      }
    },40);
  }

  focusAddBtn(){
    setTimeout(()=>{
      const el = this.addBtn?.nativeElement;
      if(el){
        el.focus();
      }
    },40);
  }

  @ViewChild('productSelect') productSelect!:ElementRef;

  focusProductSelect(){
    setTimeout(()=>{
      const el = this.productSelect?.nativeElement;
      el?.focus();
      el?.click();
    },60);
  }


  @ViewChild('popupQtyInput') popupQtyInput!: ElementRef;
  @ViewChild('popupRateInput') popupRateInput!: ElementRef;
  @ViewChild('popupAddBtn') popupAddBtn!: ElementRef;

  focusPopupQty(){
    setTimeout(()=>{
      const el = this.popupQtyInput?.nativeElement;
      el?.focus();
      el?.select();
    },80);
  }

  focusPopupRate(){
    setTimeout(()=>{
      const el = this.popupRateInput?.nativeElement;
      el?.focus();
      el?.select();
    },60);
  }

  focusPopupAdd(){
    setTimeout(()=>{
      const el = this.popupAddBtn?.nativeElement;
      el?.focus();
    },60);
  }

  isPurchaseTypeLocked(): boolean {

    if(this.mode === 'view') return true;

    /* ⭐ If any item exists → lock */
    if(this.order?.items?.length > 0) return true;

    /* ⭐ If auto locked by shelf detection */
    if(this.poPurchaseTypeLocked) return true;

    return false;
  }
  /* ================= INIT ================= */

  ngOnInit():void{

  this.route.queryParams.subscribe(p=>{

  this.mode=p['mode']||'add';
  this.orderId=p['id']?+p['id']:null;

  forkJoin({
  suppliers:this.api.getSuppliers(),
  types:this.api.getProductTypes(),
  products:this.api.getPurchasableProducts()
  }).subscribe(res=>{

  this.suppliers=res.suppliers||[];

  this.purchaseTypes=(res.types||[])
  .filter((x:any)=>x.isPurchasable===true && x.status==='Active');

  this.products=res.products||[];
  this.allProducts=res.products||[];
  this.filteredProducts=[...this.products];

  if(this.mode==='add'){
  this.loadNextNumber();
  const today=new Date();
  this.order.orderDate=today.toISOString().substring(0,10);
  }

  if(this.mode!=='add' && this.orderId){
  this.loadOrder();
  }

  });

  });

  }

  /* ================= CASCADE ================= */

  onPurchaseTypeChange():void{

  this.selectedSubCategoryId=null;
  this.selectedProductId=null;
  this.subCategories=[];
  this.addQty=null;
  this.addRate=null;

  if(!this.selectedPurchaseTypeId){

  this.products=[...this.allProducts];
  this.filteredProducts=[...this.allProducts];
  return;

  }

  this.products=this.allProducts
  .filter(p=>Number(p.productTypeId)===Number(this.selectedPurchaseTypeId));

  this.filteredProducts=[...this.products];

  this.api
  .getSubCategoriesByProductType(this.selectedPurchaseTypeId)
  .subscribe((d:any[])=>{
  this.subCategories=d||[];
  });

  }

  /* ================= SUB CATEGORY ================= */

  onSubCategoryChange():void{

  this.selectedProductId=null;
  this.addQty=null;
  this.addRate=null;

  if(!this.selectedSubCategoryId){
  this.filteredProducts=[...this.products];
  return;
  }

  this.filteredProducts=this.products
  .filter(p=>Number(p.subCategoryId)===Number(this.selectedSubCategoryId));

  }

  /* ================= SEARCH ================= */

  filterProducts():void{

    const term = (this.productSearch || '').toLowerCase().trim();

    let source = this.allProducts;

    /* ⭐ STRICT TYPE FILTER */
    if(this.selectedPurchaseTypeId){
      source = source.filter(p =>
        Number(p.productTypeId) === Number(this.selectedPurchaseTypeId)
      );
    }

    if(!term){
      this.filteredProducts = [...source];
      return;
    }

    this.filteredProducts = source
      .filter(p =>
        (p.productName || '').toLowerCase().includes(term)
      );

  }

  /* ================= STOCK ================= */

  getSelectedProductStock():number|null{

  if(!this.selectedProductId) return null;

  const p=this.allProducts.find(x=>x.id===this.selectedProductId);

  return p?.stock ?? p?.stockQty ?? null;

  }


  /* ================= AUTO LAST RATE ================= */

  onProductChange(): void {

    if(!this.selectedProductId){
      this.addQty  = null;
      this.addRate = null;
      return;
    }

    /* ⭐ RESET ENTRY */
    this.addQty = null;

    /* ⭐ LOAD LAST RATE */
    this.api.getLastPurchaseRate(this.selectedProductId)
      .subscribe({

        next:(rate:number)=>{

          this.addRate =
            (rate && rate > 0)
              ? rate
              : null;

          /* ⭐ VERY IMPORTANT */
          this.focusQtyInput();

        },

        error:()=>{

          this.addRate = null;

          /* ⭐ STILL FOCUS */
          this.focusQtyInput();

        }

      });

  }

  /* ================= ADD PRODUCT ================= */

  addProductToCart(){

    if(this.isLocked) return;

    if(!this.selectedProductId){
      this.toast.error('Select Product');
      return;
    }

    const product =
      this.allProducts.find(
        p => Number(p.id) === Number(this.selectedProductId)
      );

    if(!product){
      this.toast.error('Product not found');
      return;
    }

    const qty  = Number(this.addQty || 0);
    const rate = Number(this.addRate || 0);

    if(qty <= 0){
      this.toast.error('Enter Quantity');
      return;
    }

    if(rate <= 0){
      this.toast.error('Enter Rate');
      return;
    }

    /* ⭐ DETECT TYPE FROM PRODUCT */

    const detectedType =
      product.productTypeId ?? null;

    /* ⭐ FIRST PRODUCT ADD → LOCK TYPE */

    if(!this.selectedPurchaseTypeId && detectedType){

      this.selectedPurchaseTypeId = detectedType;
      this.poPurchaseTypeLocked = true;
      this.filterProducts();

      this.onPurchaseTypeChange();   // filter engines

    }

    /* ⭐ BLOCK DIFFERENT TYPE */

    if(this.selectedPurchaseTypeId &&
      detectedType !== this.selectedPurchaseTypeId){

      this.toast.error('Different Purchase Type not allowed in same PO');
      return;
    }

    /* ⭐ DUPLICATE BLOCK */

    const exists =
      this.order.items.some(
        (x:any)=>x.productId === product.id
      );

    if(exists){
      this.toast.error('Product already added');
      return;
    }

    /* ⭐ PUSH ITEM */

    this.order.items.push({
      productId: product.id,
      productName: product.productName,
      qty: qty,
      rate: rate
    });

    this.order.items = [...this.order.items];

    /* ⭐ RESET ENTRY */

    this.selectedProductId = null;
    this.addQty  = null;
    this.addRate = null;

    /* ⭐ REOPEN PRODUCT DROPDOWN */

    setTimeout(()=>{
      this.focusProductSelect();
    },80);

  }
  /* ================= CART ================= */

  increaseQty(i:any){

  if(this.isLocked) return;

  i.qty=Number(i.qty||0)+1;
  this.order.items=[...this.order.items];

  }

  decreaseQty(i:any){

  if(this.isLocked) return;

  if(Number(i.qty||0)<=1) return;

  i.qty=Number(i.qty||0)-1;
  this.order.items=[...this.order.items];

  }

  removeItem(index:number){

    if(this.isLocked) return;

    this.order.items.splice(index,1);
    this.order.items=[...this.order.items];

    /* ⭐ IF CART EMPTY → UNLOCK TYPE */

    if(!this.order.items.length){

      this.poPurchaseTypeLocked=false;
      this.selectedPurchaseTypeId=null;

      this.products=[...this.allProducts];
      this.filteredProducts=[...this.allProducts];

    }

  }

  /* ================= TOTAL ================= */

  get totalQty():number|null{

  if(!this.order?.items?.length) return null;

  return this.order.items
  .reduce((s:number,i:any)=>s+(Number(i.qty)||0),0);

  }

  get totalAmount():number|null{

  if(!this.order?.items?.length) return null;

  return this.order.items
  .reduce((s:number,i:any)=>s+((Number(i.qty)||0)*(Number(i.rate)||0)),0);

  }

  popupKeydown(e:KeyboardEvent, field:'qty'|'rate'|'add'){

    if(e.key === 'Enter'){

      e.preventDefault();

      if(field === 'qty'){
        this.focusPopupRate();
        return;
      }

      if(field === 'rate'){
        this.focusPopupAdd();
        return;
      }

      if(field === 'add'){
        this.addFromPopup();
        return;
      }

    }

    if(e.key === 'Escape'){
      this.closeShelfPopup();
    }

  }
  /* ================= POPUP ================= */

  openShelfPopup(product:any){

    if(this.isLocked) return;

    /* ⭐ STRICT PURCHASE TYPE SAFETY */

    const detectedType =
      Number(product.productTypeId || 0) || null;

    /* ⭐ FIRST SHELF ADD → AUTO LOCK TYPE */

    if(!this.selectedPurchaseTypeId && detectedType){

      this.selectedPurchaseTypeId = detectedType;
      this.poPurchaseTypeLocked = true;

      this.onPurchaseTypeChange();   // ⭐ shelf filter refresh

    }

    /* ⭐ BLOCK DIFFERENT TYPE */

    if(this.selectedPurchaseTypeId &&
      detectedType !== this.selectedPurchaseTypeId){

      this.toast.error('Different Purchase Type not allowed in same PO');
      return;
    }

    /* ⭐ OPEN POPUP */

    this.popupProduct = {
      ...product,
      stock:
        product.stock ??
        product.stockQty ??
        product.availableStock ??
        product.currentStock ??
        0
    };

    this.popupQty = 1;
    this.popupRate = null;
    this.editingIndex = null;

    this.showShelfPopup = true;

    setTimeout(()=> this.focusPopupQty(),120);

    /* ⭐ LOAD LAST RATE */

    this.api.getLastPurchaseRate(product.id)
      .subscribe(r=>{
        this.popupRate = r || null;
      });

  }



  openCartEditPopup(item:any,index:number){

    if(this.isLocked) return;

    const prod =
      this.allProducts.find(p=>p.id===item.productId);

    this.popupProduct = {
      id:item.productId,
      productName:item.productName,
      stock:prod?.stock ?? prod?.stockQty ?? 0
    };

    this.popupQty = item.qty;
    this.popupRate = item.rate;
    this.editingIndex = index;

    this.showShelfPopup = true;

    setTimeout(()=> this.focusPopupQty(),120);

  }



  closeShelfPopup(){

    this.showShelfPopup = false;
    this.popupProduct = null;
    this.editingIndex = null;

  }



  addFromPopup(){

    if(!this.popupProduct) return;

    const qty  = Number(this.popupQty || 0);
    const rate = Number(this.popupRate || 0);

    if(qty <= 0 || rate <= 0){
      this.toast.error('Invalid values');
      return;
    }

    /* ⭐ EDIT MODE */

    if(this.editingIndex !== null){

      this.order.items[this.editingIndex] = {
        productId:this.popupProduct.id,
        productName:this.popupProduct.productName,
        qty:qty,
        rate:rate
      };

      this.editingIndex = null;

    }
    else{

      const exists =
        this.order.items.some(
          (x:any)=>x.productId === this.popupProduct.id
        );

      if(exists){
        this.toast.error('Product already added');
        return;
      }

      this.order.items.push({
        productId:this.popupProduct.id,
        productName:this.popupProduct.productName,
        qty:qty,
        rate:rate
      });

    }

    this.order.items = [...this.order.items];

    this.closeShelfPopup();

  }


  get popupAmount():number|null{

  const q=Number(this.popupQty)||0;
  const r=Number(this.popupRate)||0;

  if(!q||!r) return null;

  return q*r;

  }

  /* ================= LOAD ================= */

  loadNextNumber(){
  this.api.getNextPurchaseOrderNumber()
  .subscribe(n=>this.order.orderNumber=n);
  }

  loadOrder(){

  this.api.getPurchaseOrderById(this.orderId!)
  .subscribe((d:any)=>{

  if(!d) return;

  this.order.orderNumber=d.orderNo||'';

  this.order.orderDate=
  d.orderDate
  ? new Date(d.orderDate).toISOString().substring(0,10)
  : '';

  this.order.supplierId=d.supplierId;
  this.order.status=d.status;
  this.order.notes=d.notes;

  this.selectedPurchaseTypeId = d.purchaseTypeId ?? null;

  if(this.selectedPurchaseTypeId){

    /* ⭐ LOCK TYPE FOR EXISTING PO */
    this.poPurchaseTypeLocked = true;

    this.onPurchaseTypeChange();   // filter engines
  }

  this.order.items=(d.items||[]).map((x:any)=>({

  productId:x.productId,
  productName:
  this.allProducts.find(p=>p.id===x.productId)?.productName||'',
  qty:Number(x.quantity||0),
  rate:Number(x.rate||0)

  }));

  this.order.items=[...this.order.items];

  });

  }

  /* ================= SAVE ================= */

  onSave(){

  if(this.isLocked) return;

  if(!this.order.supplierId){
  this.toast.error('Select supplier');
  return;
  }

  if(!this.selectedPurchaseTypeId){
  this.toast.error('Select Purchase Type');
  return;
  }

  if(!this.order.items.length){
  this.toast.error('Add product');
  return;
  }

  const payload={

  orderNumber:this.order.orderNumber,
  orderDate:this.order.orderDate,
  supplierId:this.order.supplierId,
  purchaseTypeId:this.selectedPurchaseTypeId,
  status:this.order.status,
  notes:this.order.notes,

  items:this.order.items.map((x:any)=>({
  productId:x.productId,
  quantity:Number(x.qty),
  rate:Number(x.rate)
  }))

  };

  const req=
  this.mode==='add'
  ? this.api.createPurchaseOrder(payload)
  : this.api.updatePurchaseOrder(this.orderId!,payload);

  req.subscribe({

  next:()=>{
  this.toast.success(
  this.mode==='add'
  ? 'Purchase Order Created'
  : 'Purchase Order Updated'
  );
  this.router.navigate(['/purchase/order']);
  },

  error:()=>{
  this.toast.error('Failed to save purchase order');
  }

  });

  }

  /* ================= RESET ================= */

  onReset(){

  if(this.isLocked) return;

  this.order.items=[];
  this.order.notes='';
  this.productSearch='';

  this.selectedPurchaseTypeId=null;
  this.selectedSubCategoryId=null;
  this.selectedProductId=null;

  this.products=[...this.allProducts];
  this.filteredProducts=[...this.allProducts];

  }

  /* ================= BACK ================= */

  onBack(){
  this.router.navigate(['/purchase/order']);
  }

}