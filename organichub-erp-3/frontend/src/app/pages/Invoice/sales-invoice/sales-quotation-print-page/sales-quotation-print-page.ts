import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';

type PageSize = 'a4' | 'a5' | 'pos';

@Component({
  selector: 'app-sales-quotation-print-page',
  standalone: true,
  imports: [
    CommonModule,
    PageSubHeaderComponent
  ],
  templateUrl: './sales-quotation-print-page.html',
  styleUrls: ['./sales-quotation-print-page.css']
})
export class SalesQuotationPrintPage implements OnInit {

  pageSize: PageSize = 'a4';
  quotationNo!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.quotationNo =
      this.route.snapshot.queryParamMap.get('quotationNo') || '';

    if (!this.quotationNo) {
      this.router.navigate(['/sales/quotation']);
    }
  }

  onPageSizeChange(event: Event): void {
    this.pageSize =
      (event.target as HTMLSelectElement).value as PageSize;
  }

  onPrint(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/sales/quotation']);
  }
}
