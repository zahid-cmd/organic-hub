import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';

/* ===============================
   INTERFACES
================================ */

interface OnlineOrderItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface OnlineOrder {
  id: number;
  orderNo: string;
  orderDate: string;
  customerName: string;
  phone: string;
  address?: string;
  subTotal: number;
  deliveryCharge: number;
  totalAmount: number;
  status: string;
  isConverted: boolean;
  items: OnlineOrderItem[];
}

/* ===============================
   COMPONENT
================================ */

@Component({
  selector: 'app-online-orders-view-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent
  ],
  templateUrl: './online-orders-view-page.html',
  styleUrls: ['./online-orders-view-page.css']
})
export class OnlineOrdersViewPageComponent implements OnInit {

  order: OnlineOrder = {
    id: 0,
    orderNo: '',
    orderDate: '',
    customerName: '',
    phone: '',
    address: '',
    subTotal: 0,
    deliveryCharge: 0,
    totalAmount: 0,
    status: '',
    isConverted: false,
    items: []
  };

  products: any[] = [];
  loading = false;

  editIndex: number | null = null;

  entry = {
    productId: 0,
    quantity: 1,
    rate: 0,
    amount: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  /* ===============================
     INIT
  ================================= */

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.toast.error('Invalid order ID.');
      return;
    }

    this.loadProducts();
    this.loadOrder(id);
  }

  /* ===============================
     LOAD DATA
  ================================= */

  loadProducts(): void {
    this.apiService.getProducts().subscribe(res => {
      this.products = res ?? [];
    });
  }

  loadOrder(id: number): void {

    this.loading = true;

    this.apiService.getOnlineOrderById(id).subscribe({
      next: (data: OnlineOrder) => {
        this.order = data;
        this.recalculateTotals();
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load order.');
        this.loading = false;
      }
    });
  }

  /* ===============================
     PRODUCT SELECTION
  ================================= */

  onProductSelect(): void {

    if (!this.entry.productId) return;

    this.apiService
      .getCurrentProductSalePrice(this.entry.productId)
      .subscribe(priceData => {

        if (priceData?.newPrice) {
          this.entry.rate = priceData.newPrice;
          this.entry.amount = this.entry.quantity * this.entry.rate;
        }
      });
  }

  onQtyChange(): void {
    this.entry.amount = this.entry.quantity * this.entry.rate;
  }

  /* ===============================
     ADD / UPDATE ITEM
  ================================= */

  onAddOrUpdate(): void {

    if (!this.entry.productId || this.entry.quantity <= 0) {
      this.toast.error('Select product and valid quantity.');
      return;
    }

    const selected = this.products.find(p => p.id == this.entry.productId);
    if (!selected) return;

    const item: OnlineOrderItem = {
      productId: selected.id,
      productName: selected.productName,
      quantity: this.entry.quantity,
      unitPrice: this.entry.rate,
      lineTotal: this.entry.amount
    };

    if (this.editIndex === null) {
      this.order.items.push(item);
      this.toast.success('Item added.');
    } else {
      this.order.items[this.editIndex] = item;
      this.toast.success('Item updated.');
    }

    this.editIndex = null;
    this.resetEntry();
    this.recalculateTotals();
  }

  editRow(index: number): void {

    const item = this.order.items[index];

    this.entry.productId = item.productId;
    this.entry.quantity = item.quantity;
    this.entry.rate = item.unitPrice;
    this.entry.amount = item.lineTotal;

    this.editIndex = index;

    this.toast.success('Item loaded for editing.');
  }

  removeRow(index: number): void {

    this.order.items.splice(index, 1);

    if (this.editIndex === index) {
      this.cancelEdit();
    }

    this.recalculateTotals();
    this.toast.success('Item removed.');
  }

  cancelEdit(): void {
    this.editIndex = null;
    this.resetEntry();
  }

  private resetEntry(): void {
    this.entry = {
      productId: 0,
      quantity: 1,
      rate: 0,
      amount: 0
    };
  }

  /* ===============================
     TOTAL CALCULATION
  ================================= */

  recalculateTotals(): void {

    const subTotal = this.order.items.reduce(
      (sum, i) => sum + i.lineTotal,
      0
    );

    this.order.subTotal = subTotal;
    this.order.totalAmount =
      subTotal + Number(this.order.deliveryCharge || 0);
  }

  get totalQty(): number {
    return this.order.items.reduce(
      (sum, i) => sum + i.quantity,
      0
    );
  }

  /* ===============================
     SAVE ORDER
  ================================= */

  onSave(): void {

    this.apiService
      .updateOnlineOrder(this.order.id, this.order)
      .subscribe({
        next: () => {

          this.toast.success('Order updated successfully.');

          setTimeout(() => {
            this.router.navigate(['/sales/online-orders']);
          }, 500);
        },
        error: () => {
          this.toast.error('Failed to update order.');
        }
      });
  }

  onReset(): void {
    this.loadOrder(this.order.id);
    this.cancelEdit();
  }

  onBack(): void {
    this.router.navigate(['/sales/online-orders']);
  }

  /* ===============================
     STATUS HELPERS
  ================================= */

  get canCreateInvoice(): boolean {
    return (
      this.order.status === 'Confirmed' &&
      this.order.isConverted === false
    );
  }

  get isReadOnly(): boolean {
    return this.order.isConverted === true;
  }

  /* ===============================
     CREATE SALE INVOICE (UI ONLY)
  ================================= */

  onCreateSaleInvoice(): void {
    this.toast.success('Sale Invoice creation will be implemented later.');
  }
}