import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class ProductsComponent implements OnInit {

  /* =========================
     STATE
  ========================= */

  isClosing = false;
  isLoading = false;

  searchTerm = '';
  selectedCategory = 'All';

  products: Product[] = [];

  /* =========================
     API
  ========================= */

  private readonly apiUrl =
    'http://localhost:5150/api/Product/website';

  constructor(
    private router: Router,
    private cartService: CartService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.loadProducts();
  }

  /* =========================
     LOAD PRODUCTS
  ========================= */

  private loadProducts(): void {

    this.isLoading = true;

    this.http.get<Product[]>(this.apiUrl)
      .subscribe({
        next: (response) => {

          this.products = response ?? [];
          this.isLoading = false;

          // 🔥 Force UI update immediately
          this.cdr.detectChanges();
        },
        error: (error) => {

          console.error('Failed to load products:', error);

          this.products = [];
          this.isLoading = false;

          this.cdr.detectChanges();
        }
      });
  }

  /* =========================
     CATEGORY LIST
  ========================= */

  get categories(): string[] {

    const uniqueCategories = new Set(
      this.products
        .map(p => p.categoryName)
        .filter(Boolean)
    );

    return ['All', ...Array.from(uniqueCategories)];
  }

  /* =========================
     FILTERED PRODUCTS
  ========================= */

  get filteredProducts(): Product[] {

    const search = this.searchTerm.trim().toLowerCase();

    return this.products.filter(product => {

      const matchesSearch =
        !search ||
        product.productName?.toLowerCase().includes(search) ||
        product.categoryName?.toLowerCase().includes(search) ||
        product.subCategoryName?.toLowerCase().includes(search);

      const matchesCategory =
        this.selectedCategory === 'All' ||
        product.categoryName === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  /* =========================
     CART
  ========================= */

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
  }

  /* =========================
     FILTER RESET
  ========================= */

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'All';
  }

  /* =========================
     NAVIGATION
  ========================= */

  closeProducts(): void {
    this.isClosing = true;
    setTimeout(() => this.router.navigate(['/']), 250);
  }

  goBackToCategories(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.router.navigate(['/'], {
        state: { scrollToCategories: true }
      });
    }, 250);
  }

}