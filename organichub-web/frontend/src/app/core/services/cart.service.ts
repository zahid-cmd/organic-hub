import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private storageKey = 'organic_hub_cart';

  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  /* =========================
     LOAD + SAVE
  ========================= */

  private loadCart(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.cartItems = JSON.parse(stored);
      this.cartSubject.next(this.cartItems);
    }
  }

  private saveCart(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cartItems));
    this.cartSubject.next([...this.cartItems]);
  }

  /* =========================
     CRUD OPERATIONS
  ========================= */

  addToCart(product: Product, quantity: number = 1): void {

    const existing = this.cartItems.find(
      i => i.product.id === product.id
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cartItems.push({ product, quantity });
    }

    this.saveCart();
  }

  updateQuantity(productId: number, quantity: number): void {
    const item = this.cartItems.find(
      i => i.product.id === productId
    );

    if (item) {
      item.quantity = quantity;
      this.saveCart();
    }
  }

  removeItem(productId: number): void {
    this.cartItems = this.cartItems.filter(
      i => i.product.id !== productId
    );

    this.saveCart();
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
  }

  /* =========================
     GETTERS
  ========================= */

  getItems(): CartItem[] {
    return [...this.cartItems];
  }

  getTotalQuantity(): number {
    return this.cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  getTotalAmount(): number {
    return this.cartItems.reduce(
      (total, item) =>
        total + (item.product.salePrice ?? 0) * item.quantity,
      0
    );
  }

}