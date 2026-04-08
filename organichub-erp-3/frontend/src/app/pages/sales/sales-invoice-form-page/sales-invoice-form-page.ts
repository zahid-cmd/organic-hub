import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/* shared components */
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';

/* ===============================
   INTERFACES
=============================== */
interface SalesInvoiceItem {
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

/* PAYMENT */
interface PaymentEntry {
  mode: 'Cash' | 'Bank' | 'Card' | 'MFS';
  account: string;
  reference: string;
  amount: number;
}

@Component({
  selector: 'app-sales-invoice-form-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent
  ],
  templateUrl: './sales-invoice-form-page.html',
  styleUrls: ['./sales-invoice-form-page.css'],
})
export class SalesInvoiceFormPage implements OnInit {

  constructor(private router: Router) {}

  /* ===============================
     VIEW MODE
  =============================== */
  mode: 'product' | 'payment' = 'product';

  /* ===============================
     INVOICE DATA
  =============================== */
  invoice = {
    invoiceNo: '',
    invoiceDate: '',
    customer: '',
    location: '',
    reference: '',
    productValue: 0,
    invoiceValue: 0,
    transportation: 0,
    discount: 0
  };

  /* ===============================
     PRODUCT ENTRY
  =============================== */
  entry: SalesInvoiceItem = {
    product: '',
    quantity: 0,
    rate: 0,
    amount: 0
  };

  items: SalesInvoiceItem[] = [];

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
     PAYMENT ENTRY
  =============================== */
  paymentEntry: PaymentEntry = {
    mode: 'Cash',
    account: '',
    reference: '',
    amount: 0
  };

  payments: PaymentEntry[] = [];

  paymentModes: PaymentEntry['mode'][] = ['Cash', 'Bank', 'Card', 'MFS'];

  /* ===============================
     INIT
  =============================== */
  ngOnInit(): void {
    this.resetInvoice();
  }

  /* ===============================
     NAVIGATION
  =============================== */
  goBack(): void {
    this.router.navigate(['/sales/invoice']);
  }

  /* ===============================
     MODE SWITCHING
  =============================== */
  goToCheckout(): void {
    this.mode = 'payment';
  }

  backToProducts(): void {
    this.mode = 'product';
  }

  /* ===============================
     RESET
  =============================== */
  resetInvoice(): void {
    const now = new Date();

    this.invoice.invoiceNo = `SINV-${now.getTime().toString().slice(-6)}`;
    this.invoice.invoiceDate = now.toISOString().substring(0, 10);

    this.invoice.customer = '';
    this.invoice.location = '';
    this.invoice.reference = '';
    this.invoice.transportation = 0;
    this.invoice.discount = 0;
    this.invoice.productValue = 0;
    this.invoice.invoiceValue = 0;

    this.entry = {
      product: '',
      quantity: 0,
      rate: 0,
      amount: 0
    };

    this.items = [];
    this.payments = [];
    this.mode = 'product';
  }

  /* ===============================
     PRODUCT CART
  =============================== */
  removeItem(index: number): void {
    this.items.splice(index, 1);
    this.recalculateTotals();
  }

  get totalQty(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  private recalculateTotals(): void {
    this.invoice.productValue = this.items.reduce(
      (sum, i) => sum + i.amount, 0
    );

    this.invoice.invoiceValue =
      this.invoice.productValue +
      (Number(this.invoice.transportation) || 0) -
      (Number(this.invoice.discount) || 0);
  }

  /* ===============================
     PAYMENT CART
  =============================== */
  addPayment(): void {
    if (!this.paymentEntry.amount) return;

    this.payments.push({ ...this.paymentEntry });

    this.paymentEntry = {
      mode: 'Cash',
      account: '',
      reference: '',
      amount: 0
    };
  }

  removePayment(index: number): void {
    this.payments.splice(index, 1);
  }
}
