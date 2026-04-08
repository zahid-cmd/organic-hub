import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';

type PageSize = 'a4' | 'a5' | 'pos';

@Component({
  selector: 'app-purchase-return-print-page',
  standalone: true,
  imports: [
    CommonModule,
    PageSubHeaderComponent
  ],
  templateUrl: './purchase-return-print-page.html',
  styleUrls: ['./purchase-return-print-page.css']
})
export class PurchaseReturnPrintPage implements OnInit {

  pageSize: PageSize = 'a4';
  returnNo!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnNo =
      this.route.snapshot.queryParamMap.get('returnNo') || '';

    if (!this.returnNo) {
      this.router.navigate(['/purchase/return']);
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
    this.router.navigate(['/purchase/return']);
  }
}
