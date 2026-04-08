import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/* shared components */
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';

/* ===============================
   INTERFACES
=============================== */
interface SalesReturnItem {
  product: string;
  quantity: number;
  rate: number;
  amount: number;
}

@Component({
  selector: 'app-sales-return-form-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent
  ],
  templateUrl: './sales-return-form-page.html',
  styleUrls: ['./sales-return-form-page.css'],
})
export class SalesReturnFormPage implements OnInit {

  constructor(private router: Router) {}

  /* ===============================
     RETURN MASTER DATA
  =============================== */
  salesReturn = {
    returnNo: '',
    returnDate: '',
    salesInvoice: '',
    customer: '',
    productValue: 0,
    returnValue: 0,
    notes: ''          // ✅ ADDED
  };

  /* ===============================
     PRODUCT ENTRY
  =============================== */
  entry: SalesReturnItem = {
    product: '',
    quantity: 0,
    rate: 0,
    amount: 0
  };

  /* ===============================
     RETURN CART
  =============================== */
  items: SalesReturnItem[] = [];

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
    this.router.navigate(['/sales/return']);
  }

  onReset(): void {
    this.resetForm();
  }

  onSave(): void {
    // API integration later
    console.log('Sales Return Saved', this.salesReturn, this.items);
  }

  /* ===============================
     RESET FORM
  =============================== */
  private resetForm(): void {
    const now = new Date();

    this.salesReturn = {
      returnNo: `SR-${now.getTime().toString().slice(-6)}`,
      returnDate: now.toISOString().substring(0, 10),
      salesInvoice: '',
      customer: '',
      productValue: 0,
      returnValue: 0,
      notes: ''        // ✅ RESET PROPERLY
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
     SALES INVOICE CHANGE
     (Customer will be auto-filled later)
  =============================== */
  onSalesInvoiceChange(): void {
    // TEMP mock – later from API
    this.salesReturn.customer = 'Customer from Invoice';
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
    this.salesReturn.productValue = this.items.reduce(
      (sum, i) => sum + i.amount,
      0
    );

    this.salesReturn.returnValue = this.salesReturn.productValue;
  }
}
