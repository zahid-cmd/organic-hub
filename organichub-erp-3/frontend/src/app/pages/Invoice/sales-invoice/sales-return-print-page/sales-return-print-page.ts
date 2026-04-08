import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';

type PageSize = 'a4' | 'a5' | 'pos';

@Component({
  selector: 'app-sales-return-print-page',
  standalone: true,
  imports: [
    CommonModule,
    PageSubHeaderComponent
  ],
  templateUrl: './sales-return-print-page.html',
  styleUrls: ['./sales-return-print-page.css']
})
export class SalesReturnPrintPage implements OnInit {

  /* =========================
     STATE
  ========================== */
  pageSize: PageSize = 'a4';
  returnNo!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /* =========================
     INIT
  ========================== */
  ngOnInit(): void {
    this.returnNo = this.route.snapshot.queryParamMap.get('returnNo') || '';

    // safety guard
    if (!this.returnNo) {
      this.router.navigate(['/sales/return']);
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
    this.router.navigate(['/sales/return']);
  }
}
