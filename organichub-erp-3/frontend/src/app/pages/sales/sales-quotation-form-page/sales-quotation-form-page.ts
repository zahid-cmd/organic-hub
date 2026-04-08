import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/* shared components */
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';

/* ===============================
   INTERFACES
=============================== */
interface SalesQuotationItem {
  product: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface ShelfProduct {
  name: string;
  stock: number;
  image?: string;
}

@Component({
  selector: 'app-sales-quotation-form-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent
  ],
  templateUrl: './sales-quotation-form-page.html',
  styleUrls: ['./sales-quotation-form-page.css'],
})
export class SalesQuotationFormPage implements OnInit {

  constructor(private router: Router) {}

  /* ===============================
     QUOTATION DATA
  =============================== */
  quotation = {
    quotationNo: '',
    quotationDate: '',
    customer: '',
    reference: '',
    productValue: 0,
    quotationValue: 0,
    discount: 0
  };

  /* ===============================
     PRODUCT ENTRY
  =============================== */
  entry: SalesQuotationItem = {
    product: '',
    quantity: 0,
    rate: 0,
    amount: 0
  };

  /* ===============================
     CART
  =============================== */
  items: SalesQuotationItem[] = [];

  /* ===============================
     PRODUCT SHELF
  =============================== */
  products: ShelfProduct[] = [
    { name: 'Organic Rice', stock: 120 },
    { name: 'Wheat Flour', stock: 85 },
    { name: 'Mustard Oil', stock: 40 },
    { name: 'Sugar', stock: 150 }
  ];

  /* ===============================
     INIT
  =============================== */
  ngOnInit(): void {
    this.resetQuotation();
  }

  /* ===============================
     BACK
  =============================== */
  goBack(): void {
    this.router.navigate(['/sales/quotation']);
  }

  /* ===============================
     RESET
  =============================== */
  resetQuotation(): void {
    const now = new Date();

    this.quotation.quotationNo = `SQ-${now.getTime().toString().slice(-6)}`;
    this.quotation.quotationDate = now.toISOString().substring(0, 10);

    this.quotation.customer = '';
    this.quotation.reference = '';
    this.quotation.productValue = 0;
    this.quotation.quotationValue = 0;
    this.quotation.discount = 0;

    this.resetEntry();
    this.items = [];
  }

  /* ===============================
     RESET ENTRY
  =============================== */
  resetEntry(): void {
    this.entry = {
      product: '',
      quantity: 0,
      rate: 0,
      amount: 0
    };
  }

  /* ===============================
     AUTO CALCULATE ENTRY AMOUNT
     (THIS FIXES YOUR ISSUE)
  =============================== */
  calculateEntryAmount(): void {
    const qty = Number(this.entry.quantity) || 0;
    const rate = Number(this.entry.rate) || 0;
    this.entry.amount = qty * rate;
  }

  /* ===============================
     ADD TO CART
  =============================== */
  addItem(): void {
    if (!this.entry.product || this.entry.quantity <= 0 || this.entry.rate <= 0) {
      return;
    }

    this.items.push({ ...this.entry });
    this.resetEntry();
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
     TOTAL QTY
  =============================== */
  get totalQty(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

/* ===============================
   TOTALS
=============================== */
recalculateTotals(): void {
  this.quotation.productValue = this.items.reduce(
    (sum, i) => sum + i.amount, 0
  );

  this.quotation.quotationValue =
    this.quotation.productValue -
    (Number(this.quotation.discount) || 0);
}

}
