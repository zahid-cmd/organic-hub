import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface InventoryRow {
  productName: string;
  productCode: string;

  openingQty: number;
  openingAmount: number;

  purchaseQty: number;
  purchaseAmount: number;

  saleQty: number;
  saleAmount: number;

  closingQty: number;
  closingAmount: number;
}

@Component({
  selector: 'app-inventory-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-details.html',
  styleUrls: ['./inventory-details.css']
})
export class InventoryDetailsComponent implements OnInit {

  fromDate = '2026-01-01';
  toDate   = '2026-01-31';

  pageSize = 10;
  currentPage = 1;

  rows: InventoryRow[] = [];

  total = {
    openingQty: 0,
    openingAmount: 0,
    purchaseQty: 0,
    purchaseAmount: 0,
    saleQty: 0,
    saleAmount: 0,
    closingQty: 0,
    closingAmount: 0
  };

  ngOnInit(): void {
    this.rows = Array.from({ length: 40 }, (_, i) => ({
      productName: i % 2 === 0 ? 'Organic Rice – Miniket' : 'Organic Oil – Mustard',
      productCode: i % 2 === 0 ? 'RICE-001' : 'OIL-014',
      openingQty: 100,
      openingAmount: 5000,
      purchaseQty: 50,
      purchaseAmount: 2600,
      saleQty: 30,
      saleAmount: 1950,
      closingQty: 120,
      closingAmount: 5650
    }));

    this.calculateTotal();
  }

  get totalRecords() {
    return this.rows.length;
  }

  get pagedRows() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.rows.slice(start, start + this.pageSize);
  }

  serial(i: number) {
    return (this.currentPage - 1) * this.pageSize + i + 1;
  }

  calculateTotal(): void {
    Object.keys(this.total).forEach(k => (this.total as any)[k] = 0);

    this.rows.forEach(r => {
      this.total.openingQty += r.openingQty;
      this.total.openingAmount += r.openingAmount;
      this.total.purchaseQty += r.purchaseQty;
      this.total.purchaseAmount += r.purchaseAmount;
      this.total.saleQty += r.saleQty;
      this.total.saleAmount += r.saleAmount;
      this.total.closingQty += r.closingQty;
      this.total.closingAmount += r.closingAmount;
    });
  }

  submit(): void {
    console.log('Inventory Details Submit', this.fromDate, this.toDate);
  }

  printPage(): void {
    window.open(
      `/reports/inventory-details/print.html?from=${this.fromDate}&to=${this.toDate}`,
      '_blank'
    );
  }

  goBack(): void {
    window.history.back();
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }
}
