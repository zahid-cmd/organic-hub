import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  OrderService,
  OrderSummaryResponse
} from '../../core/services/order.service';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-success.html',
  styleUrls: ['./order-success.css']
})
export class OrderSuccessComponent implements OnInit {

  order: OrderSummaryResponse | null = null;
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const orderNo = this.route.snapshot.paramMap.get('orderNo');

    if (!orderNo) {
      this.errorMessage = 'Invalid order number.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadOrder(orderNo);
  }

  private loadOrder(orderNo: string): void {

    this.loading = true;
    this.errorMessage = null;

    this.orderService
      .getOrderByOrderNo(orderNo)
      .subscribe({
        next: (res: OrderSummaryResponse) => {
          this.order = res;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Unable to load order details.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  backToHome(): void {
    this.router.navigate(['/']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}