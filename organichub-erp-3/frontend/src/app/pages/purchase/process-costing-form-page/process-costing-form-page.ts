import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';

@Component({
  selector: 'app-process-costing-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageSubHeaderComponent],
  templateUrl: './process-costing-form-page.html',
  styleUrls: ['./process-costing-form-page.css']
})
export class ProcessCostingFormPageComponent {

  constructor(private router: Router) {}

  /* ===============================
     PROCESS HEADER
  =============================== */
  process = {
    batchNo: 'BATCH-' + Date.now().toString().slice(-5),
    processDate: new Date().toISOString().substring(0, 10)
  };

  /* ===============================
     INVOICE MASTER
  =============================== */
  invoices = [
    {
      invoiceNo: 'PINV-1001',
      materials: [
        { name: 'Chili Raw', qty: 100, rate: 120 },
        { name: 'Packaging', qty: 50, rate: 40 }
      ]
    }
  ];

  products = [
    { name: 'Chili Powder 100gm', packSize: 100 },
    { name: 'Chili Powder 200gm', packSize: 200 }
  ];

  selectedInvoiceNo = '';
  invoiceMaterials: any[] = [];

  /* ===============================
     ENTRY ROW MODEL
  =============================== */
  entry: any = this.getEmptyEntry();

  /* ===============================
     CONSUMPTION TABLE
  =============================== */
  materials: any[] = [];

  /* ===============================
     INVOICE CHANGE
  =============================== */
  onInvoiceChange(): void {
    const inv = this.invoices.find(i => i.invoiceNo === this.selectedInvoiceNo);
    this.invoiceMaterials = inv ? inv.materials : [];
    this.resetEntry();
  }

  /* ===============================
     RAW MATERIAL SELECT
  =============================== */
  onMaterialChange(): void {
    const m = this.invoiceMaterials.find(x => x.name === this.entry.material);
    if (!m) return;

    this.entry.invoiceQty = m.qty;
    this.entry.invoiceRate = m.rate;
    this.entry.invoiceAmount = m.qty * m.rate;
    this.entry.lossGain = 0;

    this.recalculateRow1();
  }

  /* ===============================
     ROW 1 CALCULATION
  =============================== */
  recalculateRow1(): void {
    const qty = Number(this.entry.invoiceQty) || 0;
    const lg  = Number(this.entry.lossGain) || 0;

    if (qty <= 0) return;

    this.entry.netQty = +(qty + (qty * lg / 100)).toFixed(4);

    if (this.entry.netQty > 0) {
      this.entry.effectiveRate =
        +(this.entry.invoiceAmount / this.entry.netQty).toFixed(4);
    } else {
      this.entry.effectiveRate = 0;
    }

    this.recalculateRow2();
  }

  /* ===============================
     PRODUCT SELECT
  =============================== */
  onProductChange(): void {
    const p = this.products.find(x => x.name === this.entry.product);
    if (!p) return;

    this.entry.packSize = p.packSize;
    this.recalculateRow2();
  }

  /* ===============================
     ROW 2 CALCULATION
  =============================== */
  recalculateRow2(): void {
    if (!this.entry.packSize || !this.entry.netQty) return;

    this.entry.unitQty =
      +(this.entry.netQty / this.entry.packSize).toFixed(4);

    this.entry.effectiveRatePerUnit =
      +(this.entry.effectiveRate * this.entry.packSize).toFixed(4);

    const units = Number(this.entry.unitInput) || 0;

    this.entry.amount =
      +(units * this.entry.effectiveRatePerUnit).toFixed(2);
  }

  /* ===============================
     ADD TO TABLE
  =============================== */
  addMaterial(): void {
    if (
      !this.entry.material ||
      !this.entry.product ||
      this.entry.amount <= 0
    ) return;

    this.materials.push({
      invoiceNo: this.selectedInvoiceNo,
      material: this.entry.material,
      netQty: this.entry.netQty,
      effectiveRate: this.entry.effectiveRate,
      amount: this.entry.amount,
      product: this.entry.product,
      unitQty: this.entry.unitQty
    });

    this.resetEntry();
  }

  /* ===============================
     TOTALS (SINGLE SOURCE)
  =============================== */
  get materialCost(): number {
    return this.materials.reduce((sum, r) => sum + (r.amount || 0), 0);
  }

  get totalNetQty(): number {
    return this.materials.reduce((sum, r) => sum + (r.netQty || 0), 0);
  }

  get totalUnitQty(): number {
    return this.materials.reduce((sum, r) => sum + (r.unitQty || 0), 0);
  }
/* ===============================
   TABLE TOTALS
=============================== */
get totalAmount(): number {
  return this.materials.reduce(
    (sum, r) => sum + (Number(r.amount) || 0),
    0
  );
}

  /* ===============================
     RESET ENTRY ONLY
  =============================== */
  resetEntry(): void {
    this.entry = this.getEmptyEntry();
  }

  private getEmptyEntry() {
    return {
      material: '',
      invoiceQty: 0,
      lossGain: 0,
      netQty: 0,
      invoiceRate: 0,
      invoiceAmount: 0,

      product: '',
      packSize: 0,
      unitQty: 0,
      unitInput: 0,

      effectiveRate: 0,
      effectiveRatePerUnit: 0,
      amount: 0
    };
  }

  /* ===============================
     PAGE ACTIONS
  =============================== */
  onSave(): void {
    console.log('Process Costing Saved', {
      process: this.process,
      materials: this.materials,
      materialCost: this.materialCost
    });
  }

  onReset(): void {
    this.materials = [];
    this.resetEntry();
  }

  goBack(): void {
    this.router.navigate(['/purchase/process-costing']);
  }
}
