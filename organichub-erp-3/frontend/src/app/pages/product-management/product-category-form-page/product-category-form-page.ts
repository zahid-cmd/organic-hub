import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';
import { ApiService } from '../../../services/api.service';

interface ProductCategory {
  id: number;
  categoryCode: string;
  categoryName: string;
  productTypeId: number;
  productTypeName?: string;
  status: string;
  remarks: string | null;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

@Component({
  selector: 'app-product-category-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './product-category-form-page.html',
  styleUrls: ['./product-category-form-page.css']
})
export class ProductCategoryFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  categoryId: number | null = null;
  loading = false;

  productTypes: any[] = [];

  category: ProductCategory = this.createEmptyCategory();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  // ==============================
  // INIT
  // ==============================

  ngOnInit(): void {

    this.loadProductTypes();

    this.route.queryParams.subscribe(params => {

      this.mode = (params['mode'] as 'add' | 'edit' | 'view') || 'add';
      this.isViewMode = this.mode === 'view';
      this.categoryId = params['id'] ? +params['id'] : null;

      if (this.categoryId && this.mode !== 'add') {
        this.loadCategory(this.categoryId);
      } else {
        this.category = this.createEmptyCategory();
      }
    });
  }

  private loadProductTypes(): void {
    this.apiService.getProductTypes().subscribe({
      next: (data) => this.productTypes = data,
      error: () => this.toast.error('Failed to load Product Types.')
    });
  }

  // ==============================
  // SAVE LABEL
  // ==============================

  get saveButtonLabel(): string {
    return this.mode === 'edit' ? 'Update' : 'Save';
  }

  // ==============================
  // PRODUCT TYPE CHANGE
  // ==============================

  onProductTypeChange(): void {

    if (this.mode !== 'add') return;

    if (!this.category.productTypeId) {
      this.category.categoryCode = '';
      return;
    }

    this.apiService
      .getNextCategoryCode(this.category.productTypeId)
      .subscribe({
        next: (code: string) => {
          this.category.categoryCode = code;
        },
        error: () => {
          this.toast.error('Failed to generate category code.');
        }
      });
  }

  // ==============================
  // LOAD CATEGORY
  // ==============================

  private loadCategory(id: number): void {

    this.loading = true;

    this.apiService.getCategoryById(id).subscribe({
      next: (data: ProductCategory) => {
        this.category = { ...data };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load category.');
      }
    });
  }

  // ==============================
  // SAVE / UPDATE
  // ==============================

  onSave(): void {

    if (this.isViewMode) return;

    if (!this.category.productTypeId) {
      this.toast.error('Product Type is required.');
      return;
    }

    if (!this.category.categoryName?.trim()) {
      this.toast.error('Category Name is required.');
      return;
    }

    const payload = {
      categoryName: this.category.categoryName.trim(),
      productTypeId: this.category.productTypeId,
      status: this.category.status || 'Active',
      remarks: this.category.remarks?.trim() || null
    };

    if (this.mode === 'edit' && this.categoryId) {
      this.updateCategory(payload);
    } else {
      this.createCategory(payload);
    }
  }

  private createCategory(payload: any): void {

    this.apiService.createCategory(payload).subscribe({
      next: () => {
        this.toast.success('Category created successfully.');
        this.redirectAfterDelay();
      },
      error: (err) => {
        this.toast.error(err?.error || 'Creation failed.');
      }
    });
  }

  private updateCategory(payload: any): void {

    if (!this.categoryId) return;

    this.apiService.updateCategory(this.categoryId, payload).subscribe({
      next: () => {
        this.toast.success('Category updated successfully.');
        this.redirectAfterDelay();
      },
      error: (err) => {
        this.toast.error(err?.error || 'Update failed.');
      }
    });
  }

  // ==============================
  // CLEAR
  // ==============================

  onClear(): void {
    if (this.isViewMode) return;
    this.category = this.createEmptyCategory();
  }

  // ==============================
  // NAVIGATION
  // ==============================

  onBack(): void {
    this.router.navigate(['/product-category']);
  }

  private redirectAfterDelay(): void {
    setTimeout(() => {
      this.router.navigate(['/product-category']);
    }, 1200);
  }

  // ==============================
  // EMPTY MODEL
  // ==============================

  private createEmptyCategory(): ProductCategory {
    return {
      id: 0,
      categoryCode: '',
      categoryName: '',
      productTypeId: 0,
      status: 'Active',
      remarks: null,
      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: ''
    };
  }
}
