import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CartUiService } from '../../core/cart-ui';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart-item.model';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-drawer.html',
  styleUrls: ['./cart-drawer.css']
})
export class CartDrawer {

  cartItems: CartItem[] = [];

  constructor(
    public cartUi: CartUiService,
    public cartService: CartService,
    private router: Router
  ) {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items ?? [];
    });
  }

  /* ===============================
     CLOSE DRAWER
  =============================== */
  close(): void {
    this.cartUi.close();
  }

  /* ===============================
     INCREASE QUANTITY
  =============================== */
  increase(item: CartItem): void {
    this.cartService.addToCart(item.product, 1);
  }

  /* ===============================
     DECREASE QUANTITY
  =============================== */
  decrease(item: CartItem): void {

    if (item.quantity > 1) {
      this.cartService.updateQuantity(
        item.product.id,
        item.quantity - 1
      );
    } else {
      this.remove(item.product.id);
    }

  }

  /* ===============================
     REMOVE SINGLE ITEM
  =============================== */
  remove(productId: number): void {
    this.cartService.removeItem(productId);
  }

  /* ===============================
     CLEAR ALL ITEMS
  =============================== */
  clearCart(): void {
    this.cartService.clearCart();
  }

  /* ===============================
     GET TOTAL AMOUNT
  =============================== */
  getTotal(): number {
    return this.cartService.getTotalAmount();
  }

  /* ===============================
     GO TO CHECKOUT
  =============================== */
  goToCheckout(): void {

    if (this.cartItems.length === 0) return;

    this.cartUi.close();

    setTimeout(() => {
      this.router.navigate(['/checkout']);
    }, 200);

  }

}