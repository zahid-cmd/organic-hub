import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CartUiService } from '../../core/cart-ui';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {

  totalQty = 0;
  isLoading = false;

  erpLoginUrl = 'http://localhost:4200/login';

  constructor(
    private cartUi: CartUiService,
    private cartService: CartService
  ) {
    this.cartService.cart$.subscribe(() => {
      this.totalQty = this.cartService.getTotalQuantity();
    });
  }

  toggleCart(): void {
    this.cartUi.toggle();
  }

goToErp(button: HTMLButtonElement): void {

  // Add loading class manually
  button.classList.add('loading');

  // Open ERP
  window.open(this.erpLoginUrl, '_blank');

  // Remove loading after 2 seconds
  setTimeout(() => {
    button.classList.remove('loading');
  }, 2000);
}

}