import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/* shared components */
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';

/* ===============================
   INTERFACES
=============================== */
interface PurchaseReturnItem {
  product: string;
  quantity: number;
  rate: number;
  amount: number;
}

@Component({
  selector: 'app-purchase-return-form-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent
  ],
  templateUrl: './purchase-return-form-page.html',
  styleUrls: ['./purchase-return-form-page.css'],
})
export class PurchaseReturnFormPage implements OnInit {

  constructor(private router: Router) {}

  /* ===============================
     RETURN MASTER DATA
  =============================== */
  purchaseReturn = {
    returnNo: '',
    returnDate: '',
    purchaseInvoice: '',
    supplier: '',
    productValue: 0,
    returnValue: 0,
    notes: ''            // ✅ ADDED
  };

  /* ===============================
     PRODUCT ENTRY
  =============================== */
  entry: PurchaseReturnItem = {
    product: '',
    quantity: 0,
    rate: 0,
    amount: 0
  };

  /* ===============================
     RETURN CART
  =============================== */
  items: PurchaseReturnItem[] = [];

  /* ===============================
     INIT
  =============================== */
  ngOnInit(): void {
    this.resetForm();
  }

  /* ===============================
     HEADER ACTIONS
  =============================== */
  onBack(): void {
    this.router.navigate(['/purchase/return']);
  }

  onReset(): void {
    this.resetForm();
  }

  onSave(): void {
    // API integration later
    console.log('Purchase Return Saved', this.purchaseReturn, this.items);
  }

  /* ===============================
     RESET FORM
  =============================== */
  private resetForm(): void {
    const now = new Date();

    this.purchaseReturn = {
      returnNo: `PR-${now.getTime().toString().slice(-6)}`,
      returnDate: now.toISOString().substring(0, 10),
      purchaseInvoice: '',
      supplier: '',
      productValue: 0,
      returnValue: 0,
      notes: ''          // ✅ RESET PROPERLY
    };

    this.entry = {
      product: '',
      quantity: 0,
      rate: 0,
      amount: 0
    };

    this.items = [];
  }

  /* ===============================
     PURCHASE INVOICE CHANGE
     (Supplier will be auto-filled later)
  =============================== */
  onPurchaseInvoiceChange(): void {
    // TEMP mock – later from API
    this.purchaseReturn.supplier = 'Supplier from Invoice';
  }

  /* ===============================
     ADD RETURN ITEM
  =============================== */
  onAdd(): void {
    if (!this.entry.product || this.entry.quantity <= 0) {
      return;
    }

    this.entry.amount = this.entry.quantity * this.entry.rate;

    this.items.push({ ...this.entry });

    this.entry = {
      product: '',
      quantity: 0,
      rate: 0,
      amount: 0
    };

    this.recalculateTotals();
  }

  /* ===============================
     REMOVE ITEM
  =============================== */
  removeItem(index: number): void {
    this.items.splice(index, 1);
    this.recalculateTotals();
  }

  /* ===============================
     TOTAL QTY (FOOTER USE)
  =============================== */
  get totalQty(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  /* ===============================
     TOTAL CALCULATION
  =============================== */
  private recalculateTotals(): void {
    this.purchaseReturn.productValue = this.items.reduce(
      (sum, i) => sum + i.amount,
      0
    );

    this.purchaseReturn.returnValue = this.purchaseReturn.productValue;
  }
}
