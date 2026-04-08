import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';

type PageSize = 'a4' | 'a5' | 'pos';

@Component({
  selector: 'app-purchase-order-print-page',
  standalone: true,
  imports: [
    CommonModule,
    PageSubHeaderComponent
  ],
  templateUrl: './purchase-order-print-page.html',
  styleUrls: ['./purchase-order-print-page.css']
})
export class PurchaseOrderPrintPage implements OnInit {

  /* =========================
     STATE
  ========================== */
  pageSize: PageSize = 'a4';
  orderNo!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /* =========================
     INIT
  ========================== */
  ngOnInit(): void {
    this.orderNo = this.route.snapshot.queryParamMap.get('orderNo') || '';

    // Safety: if opened without order no
    if (!this.orderNo) {
      this.router.navigate(['/purchase/order']);
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
    this.router.navigate(['/purchase/order']);
  }
}
