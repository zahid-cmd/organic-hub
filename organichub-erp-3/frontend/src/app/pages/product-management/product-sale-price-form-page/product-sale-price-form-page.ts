import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';

@Component({
  selector: 'app-product-sale-price-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './product-sale-price-form-page.html',
  styleUrls: ['./product-sale-price-form-page.css']
})
export class ProductSalePriceFormPage implements OnInit {

  isEditMode = false;
  productIdFromQuery: number = 0;

  // 🔥 NEW STATE FLAGS
  isExistingPrice = false;

  subCategories: any[] = [];
  products: any[] = [];

  form: any = {
    subCategoryId: 0,
    productId: 0,
    oldPrice: 0,
    newPrice: 0,
    status: 'Active',
    remarks: ''
  };

  createdBy: string | null = null;
  createdAt: string | null = null;
  updatedBy: string | null = null;
  updatedAt: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.productIdFromQuery = Number(params['productId'] ?? 0);
      this.isEditMode = params['mode'] === 'edit';

      this.loadSubCategories();
    });
  }

  // ================= LOAD SUB CATEGORY =================

  loadSubCategories(): void {

    this.api.getSaleableSubCategories()
      .subscribe({
        next: res => {
          this.subCategories = res ?? [];

          if (this.isEditMode && this.productIdFromQuery) {
            this.loadProductForEdit();
          }
        },
        error: () => {
          this.toast.error('Failed to load sub categories.');
        }
      });
  }

  // ================= LOAD PRODUCT IN EDIT =================

  private loadProductForEdit(): void {

    this.api.getProducts().subscribe({
      next: res => {

        const allProducts = res ?? [];

        const product = allProducts.find(
          (p: any) => p.id === this.productIdFromQuery
        );

        if (!product) return;

        this.form.subCategoryId = product.subCategoryId;

        this.products = allProducts.filter(
          (p: any) => p.subCategoryId === product.subCategoryId
        );

        this.form.productId = product.id;

        this.onProductChange();
      }
    });
  }

  // ================= SUB CATEGORY CHANGE =================

  onSubCategoryChange(): void {

    this.resetPricingState();

    const selectedId = Number(this.form.subCategoryId);

    if (!selectedId) {
      this.products = [];
      this.form.productId = 0;
      return;
    }

    this.api.getProducts().subscribe({
      next: res => {
        const allProducts = res ?? [];

        this.products = allProducts.filter(
          (p: any) => p.subCategoryId === selectedId
        );
      }
    });

    this.form.productId = 0;
  }

  // ================= PRODUCT CHANGE =================

  onProductChange(): void {

    this.resetPricingState();

    const productId = Number(this.form.productId);
    if (!productId) return;

    this.api.getCurrentProductSalePrice(productId)
      .subscribe({
        next: (res: any) => {

          if (!res) {
            // 🔥 NEW PRICE MODE
            this.isExistingPrice = false;
            this.form.oldPrice = 0;
            this.form.newPrice = 0;
            return;
          }

          // 🔥 UPDATE MODE
          this.isExistingPrice = true;

          this.form.oldPrice = res.price ?? 0;
          this.form.newPrice = res.price ?? 0;
          this.form.status = res.status ?? 'Active';

          this.createdBy = res.createdBy ?? null;
          this.createdAt = res.createdAt ?? null;
          this.updatedBy = res.updatedBy ?? null;
          this.updatedAt = res.updatedAt ?? null;
        },
        error: () => {
          this.isExistingPrice = false;
        }
      });
  }

  // ================= SAVE / UPDATE =================

  onSave(): void {

    const productId = Number(this.form.productId);
    const newPrice = Number(this.form.newPrice);
    const oldPrice = Number(this.form.oldPrice);

    if (!productId) {
      this.toast.error('Please select product.');
      return;
    }

    if (!newPrice || newPrice <= 0) {
      this.toast.error('Please enter valid price.');
      return;
    }

    if (this.isExistingPrice && newPrice === oldPrice) {
      this.toast.error('New price must be different from current price.');
      return;
    }

    const payload = {
      productId: productId,
      price: newPrice,
      status: this.form.status,
      remarks: this.form.remarks
    };

    this.api.setProductSalePrice(payload)
      .subscribe({
        next: () => {
          this.toast.success(
            this.isExistingPrice
              ? 'Price updated successfully.'
              : 'Price saved successfully.'
          );
          this.router.navigate(['/product/sale-price']);
        },
        error: (err) => {
          this.toast.error(err.error ?? 'Operation failed.');
        }
      });
  }

  // ================= RESET =================

  private resetPricingState(): void {
    this.isExistingPrice = false;
    this.form.oldPrice = 0;
    this.form.newPrice = 0;
    this.createdBy = null;
    this.createdAt = null;
    this.updatedBy = null;
    this.updatedAt = null;
  }

  onClear(): void {
    this.router.navigate(['/product/sale-price/form']);
  }

  onCancel(): void {
    this.router.navigate(['/product/sale-price']);
  }
}