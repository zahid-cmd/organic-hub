import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';
import { ApiService } from '../../../services/api.service';

interface ProductSubCategory {
  id: number;
  subCategoryCode: string;
  subCategoryName: string;
  parentCategoryId: number | null;
  status: string;
  remarks: string | null;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

@Component({
  selector: 'app-product-sub-category-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './product-sub-category-form-page.html',
  styleUrls: ['./product-sub-category-form-page.css']
})
export class ProductSubCategoryFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  subCategoryId: number | null = null;

  categories: any[] = [];
  subCategory: ProductSubCategory = this.createEmptyModel();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.loadCategories();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    this.route.queryParams.subscribe(params => {

      this.mode = (params['mode'] || 'add') as 'add' | 'edit' | 'view';
      this.isViewMode = this.mode === 'view';
      this.subCategoryId = params['id'] ? +params['id'] : null;

      if (this.subCategoryId && this.mode !== 'add') {
        this.loadSubCategory(this.subCategoryId);
      }
    });
  }

  private loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (data: any[]) => this.categories = data ?? [],
      error: () => this.toast.error('Failed to load categories.')
    });
  }

  private loadSubCategory(id: number): void {
    this.apiService.getSubCategoryById(id).subscribe({
      next: (data: any) => {
        this.subCategory = {
          id: data.id,
          subCategoryCode: data.subCategoryCode,
          subCategoryName: data.subCategoryName,
          parentCategoryId: data.categoryId,
          status: data.status,
          remarks: data.remarks,
          createdBy: data.createdBy,
          createdDate: data.createdDate,
          updatedBy: data.updatedBy,
          updatedDate: data.updatedDate
        };
      },
      error: () => this.toast.error('Failed to load sub category.')
    });
  }

  // =====================================================
  // CATEGORY CHANGE → CALL BACKEND FOR CODE
  // =====================================================

  onCategoryChange(): void {

    if (this.mode !== 'add') return;

    if (!this.subCategory.parentCategoryId) {
      this.subCategory.subCategoryCode = '';
      return;
    }

    this.apiService
      .getNextSubCategoryCode(this.subCategory.parentCategoryId)
      .subscribe({
        next: (code: string) => {
          this.subCategory.subCategoryCode = code;
        },
        error: () => {
          this.toast.error('Failed to generate sub category code.');
        }
      });
  }

  // =====================================================
  // SAVE
  // =====================================================

  onSave(): void {

    if (this.isViewMode) return;

    if (!this.subCategory.parentCategoryId) {
      this.toast.error('Sub Category must be under a Category.');
      return;
    }

    if (!this.subCategory.subCategoryName?.trim()) {
      this.toast.error('Sub Category Name is required.');
      return;
    }

    const payload = {
      SubCategoryName: this.subCategory.subCategoryName.trim(),
      CategoryId: this.subCategory.parentCategoryId,
      Status: this.subCategory.status,
      Remarks: this.subCategory.remarks
    };

    const request = this.mode === 'edit' && this.subCategoryId
      ? this.apiService.updateSubCategory(this.subCategoryId, payload)
      : this.apiService.createSubCategory(payload);

    request.subscribe({
      next: () => {
        this.toast.success(
          this.mode === 'edit'
            ? 'Sub Category updated successfully.'
            : 'Sub Category created successfully.'
        );
        this.redirect();
      },
      error: (err) => {
        const message =
          err?.error?.message ||
          err?.error ||
          'Operation failed.';
        this.toast.error(message);
      }
    });
  }

  // =====================================================
  // UTIL
  // =====================================================

  onClear(): void {
    if (this.isViewMode) return;
    this.subCategory = this.createEmptyModel();
  }

  onBack(): void {
    this.router.navigate(['/product/sub-category']);
  }

  private redirect(): void {
    setTimeout(() => {
      this.router.navigate(['/product/sub-category']);
    }, 1200);
  }

  private createEmptyModel(): ProductSubCategory {
    return {
      id: 0,
      subCategoryCode: '',
      subCategoryName: '',
      parentCategoryId: null,
      status: 'Active',
      remarks: null,
      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: ''
    };
  }
}
