import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart-item.model';
import {
  OrderService,
  CreateOnlineOrderRequest
} from '../../core/services/order.service';

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  message: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  cartItems: CartItem[] = [];
  isSubmitting = false;
  private cartSub?: Subscription;

  customer: CustomerInfo = {
    name: '',
    phone: '',
    address: '',
    message: ''
  };

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // Do NOT redirect when cart becomes empty
    this.cartSub = this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  getTotal(): number {
    return this.cartService.getTotalAmount();
  }

  private validatePhone(phone: string): boolean {
    return /^01[3-9]\d{8}$/.test(phone);
  }

  submitOrder(): void {

    if (this.isSubmitting) return;

    const name = this.customer.name.trim();
    const phone = this.customer.phone.trim();
    const address = this.customer.address.trim();

    if (!name || !phone || !address) {
      alert('Please fill all required fields.');
      return;
    }

    if (!this.validatePhone(phone)) {
      alert('Please enter a valid phone number (01XXXXXXXXX).');
      return;
    }

    if (this.cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    this.isSubmitting = true;

    const payload: CreateOnlineOrderRequest = {
      customerName: name,
      phone: phone,
      address: address,
      items: this.cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    this.orderService.createOrder(payload).subscribe({
      next: (response) => {

        console.log('Order API Response:', response);

        this.cartService.clearCart();

        this.router.navigate(
          ['/order-success', response.orderNo]
        );
      },
      error: (error) => {

        console.error('Order failed:', error);
        alert('Failed to place order. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    window.history.back();
  }
}