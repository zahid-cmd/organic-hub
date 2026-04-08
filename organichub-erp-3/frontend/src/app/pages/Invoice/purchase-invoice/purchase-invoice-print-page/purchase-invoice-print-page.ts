import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';

type PageSize = 'a4' | 'a5' | 'pos';

@Component({
  selector: 'app-purchase-invoice-print-page',
  standalone: true,
  imports: [
    CommonModule,
    PageSubHeaderComponent
  ],
  templateUrl: './purchase-invoice-print-page.html',
  styleUrls: ['./purchase-invoice-print-page.css']
})
export class PurchaseInvoicePrintPage implements OnInit {

  /* =========================
     STATE
  ========================== */
  pageSize: PageSize = 'a4';
  invoiceNo!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /* =========================
     INIT
  ========================== */
  ngOnInit(): void {
    this.invoiceNo = this.route.snapshot.queryParamMap.get('invoiceNo') || '';

    // Safety: if opened without invoice no
    if (!this.invoiceNo) {
      this.router.navigate(['/purchase/invoice']);
    }
  }

  /* =========================
     PAGE SIZE
  ========================== */
  onPageSizeChange(event: Event): void {
    this.pageSize = (event.target as HTMLSelectElement).value as PageSize;
  }

  /* =========================
     PRINT
  ========================== */
  onPrint(): void {
    window.print();
  }

  /* =========================
     BACK
  ========================== */
  goBack(): void {
    this.router.navigate(['/purchase/invoice']);
  }
}
