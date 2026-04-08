import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';
import { ApiService } from '../../../services/api.service';
import { environment } from '../../../../environments/environment';

/* =====================================================
   MODELS
===================================================== */

interface ProductModel {
  id: number;
  productCode: string;
  productName: string;
  sku: string | null;
  barcode: string | null;
  productTypeId: number | null;
  categoryId: number | null;
  subCategoryId: number | null;
  unitId: number | null;
  status: string;
  remarks: string | null;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

interface ProductImage {
  id?: number;
  imageUrl: string;
  isPrimary: boolean;
  isPreview?: boolean;
  file?: File;
}

/* =====================================================
   COMPONENT
===================================================== */

@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './product-form-page.html',
  styleUrls: ['./product-form-page.css']
})
export class ProductFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  productId: number | null = null;

  productTypes: any[] = [];
  categories: any[] = [];
  subCategories: any[] = [];
  units: any[] = [];

  isEditMode = false;


  product: ProductModel = this.createEmptyModel();
  images: ProductImage[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

/* =====================================================
   INIT ⭐ FINAL ERP SAFE MODE CONTROL
===================================================== */

ngOnInit(): void {

  this.loadProductTypes();
  this.loadUnits();

  this.route.queryParams.subscribe(params => {

    this.mode = (params['mode'] || 'add').toLowerCase();

    this.isViewMode = this.mode === 'view';
    this.isEditMode = this.mode === 'edit';

    this.productId = params['id'] ? +params['id'] : null;

    if (this.productId && this.mode !== 'add') {
      this.loadProduct(this.productId);
      this.loadImages(this.productId);
    }

  });
}

  /* =====================================================
     BASE DATA
  ===================================================== */

  private loadProductTypes(): void {
    this.apiService.getProductTypes().subscribe({
      next: data => this.productTypes = data,
      error: () => this.toast.error('Failed to load product types.')
    });
  }

  private loadUnits(): void {
    this.apiService.getUnits().subscribe({
      next: data => this.units = data,
      error: () => this.toast.error('Failed to load units.')
    });
  }

  /* =====================================================
     LOAD PRODUCT
  ===================================================== */

  private loadProduct(id: number): void {

    this.apiService.getProductById(id).subscribe({
      next: (data: any) => {

        this.product = {
          id: data.id,
          productCode: data.productCode,
          productName: data.productName,
          sku: data.sku,
          barcode: data.barcode,
          productTypeId: data.productTypeId,
          categoryId: data.categoryId,
          subCategoryId: data.subCategoryId,
          unitId: data.unitId,
          status: data.status,
          remarks: data.remarks,
          createdBy: data.createdBy,
          createdDate: data.createdDate,
          updatedBy: data.updatedBy,
          updatedDate: data.updatedDate
        };

        if (this.product.productTypeId) {
          this.loadCategoriesByType(this.product.productTypeId);
        }

        if (this.product.categoryId) {
          this.loadSubCategoriesByCategory(this.product.categoryId);
        }
      },
      error: () => this.toast.error('Failed to load product.')
    });
  }

  /* =====================================================
     IMAGE SECTION
  ===================================================== */

  private loadImages(productId: number): void {
    this.apiService.getProductImages(productId).subscribe({
      next: data => this.images = data,
      error: () => this.toast.error('Failed to load product images.')
    });
  }

  getImageUrl(path: string): string {
    if (path.startsWith('data:')) return path;
    const base = environment.apiUrl.replace('/api', '');
    return `${base}/${path}`;
  }

  onImageSelected(event: any): void {

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

      const preview: ProductImage = {
        imageUrl: reader.result as string,
        isPrimary: this.images.length === 0,
        isPreview: true,
        file: file
      };

      this.images.push(preview);

      if (this.productId) {
        this.uploadPreviewImage(preview);
      }
    };

    reader.readAsDataURL(file);
  }

  private uploadPreviewImage(image: ProductImage): void {

    if (!this.productId || !image.file) return;

    const formData = new FormData();
    formData.append('file', image.file);

    this.apiService.uploadProductImage(this.productId, formData)
      .subscribe({
        next: () => this.loadImages(this.productId!),
        error: () => this.toast.error('Image upload failed.')
      });
  }

  setPrimary(imageId: number): void {
    this.apiService.setPrimaryProductImage(imageId).subscribe({
      next: () => this.loadImages(this.productId!),
      error: () => this.toast.error('Failed to set primary image.')
    });
  }

  deleteImage(imageId: number): void {
    this.apiService.deleteProductImage(imageId).subscribe({
      next: () => this.loadImages(this.productId!),
      error: () => this.toast.error('Failed to delete image.')
    });
  }

  /* =====================================================
     CASCADE DROPDOWNS
  ===================================================== */

  onProductTypeChange(): void {
    this.product.categoryId = null;
    this.product.subCategoryId = null;
    this.product.productCode = '';
    this.categories = [];
    this.subCategories = [];

    if (this.product.productTypeId) {
      this.loadCategoriesByType(this.product.productTypeId);
    }
  }

  onCategoryChange(): void {
    this.product.subCategoryId = null;
    this.product.productCode = '';
    this.subCategories = [];

    if (this.product.categoryId) {
      this.loadSubCategoriesByCategory(this.product.categoryId);
    }
  }

  onSubCategoryChange(): void {

    if (this.mode !== 'add') return;
    this.product.productCode = '';   // ⭐ ADD THIS LINE
    const subCategoryId = Number(this.product.subCategoryId);

    if (!subCategoryId || isNaN(subCategoryId) || subCategoryId <= 0) {
      this.product.productCode = '';
      return;
    }

    this.apiService
      .getNextProductCode(subCategoryId)
      .subscribe({
        next: (code: string) => {
          this.product.productCode = code;
        },
        error: (err) => {
          console.error('Next Code Error:', err);
          this.product.productCode = '';
          this.toast.error('Failed to generate product code.');
        }
      });
  }

  private loadCategoriesByType(productTypeId: number): void {
    this.apiService.getCategories().subscribe({
      next: data => {
        this.categories = data.filter(
          (x: any) => x.productTypeId === productTypeId
        );
      }
    });
  }

  private loadSubCategoriesByCategory(categoryId: number): void {

    this.apiService.getSubCategoriesByCategory(categoryId)
      .subscribe({
        next: data => {

          this.subCategories = data
            .sort((a:any,b:any)=>
              a.subCategoryCode.localeCompare(b.subCategoryCode)
            );

        }
      });

  }

  /* =====================================================
     SAVE
  ===================================================== */
  onSave(): void {

    if (this.isViewMode) return;

    if (!this.product.productTypeId ||
        !this.product.categoryId ||
        !this.product.subCategoryId ||
        !this.product.unitId ||
        !this.product.productName?.trim()) {

      this.toast.error('Please fill all required fields.');
      return;
    }

    const payload = {
      productCode: this.product.productCode,   // ⭐ VERY IMPORTANT FIX
      productName: this.product.productName.trim(),
      sku: this.product.sku,
      barcode: this.product.barcode,
      productTypeId: this.product.productTypeId,
      categoryId: this.product.categoryId,
      subCategoryId: this.product.subCategoryId,
      unitId: this.product.unitId,
      status: this.product.status,
      remarks: this.product.remarks
    };

    console.log('SAVE PAYLOAD', payload);

    const request = this.mode === 'edit' && this.productId
      ? this.apiService.updateProduct(this.productId, payload)
      : this.apiService.createProduct(payload);

    request.subscribe({
      next: (res: any) => {

        console.log('SAVE SUCCESS', res);

        if (this.mode === 'add') {

          const newProductId = res?.id;

          if (!newProductId) {
            this.toast.error('Product created but ID missing.');
            return;
          }

          const previewImages = this.images.filter(x => x.isPreview);

          if (previewImages.length === 0) {
            this.toast.success('Product created successfully.');
            this.router.navigate(['/product']);
            return;
          }

          const uploadCalls = previewImages.map(img => {
            const formData = new FormData();
            formData.append('file', img.file!);
            return this.apiService.uploadProductImage(newProductId, formData);
          });

          forkJoin(uploadCalls).subscribe({
            next: () => {
              this.toast.success('Product created successfully.');
              this.router.navigate(['/product']);
            },
            error: (err) => {
              console.error(err);
              this.toast.error('Image upload failed.');
            }
          });

          return;
        }

        this.toast.success('Product updated successfully.');
        this.router.navigate(['/product']);
      },
      error: (err) => {

        console.error('SAVE ERROR FULL', err);

        if (err?.error) {
          this.toast.error(err.error);
        } else {
          this.toast.error('Operation failed.');
        }
      }
    });
  }

  /* =====================================================
     CLEAR / BACK
  ===================================================== */

  onClear(): void {

    if (this.isViewMode) return;

    if (this.mode === 'edit') {

      this.product.productName = '';
      this.product.sku = null;
      this.product.status = 'Active';
      this.product.remarks = null;
      this.images = [];
      return;
    }

    this.product = this.createEmptyModel();
    this.categories = [];
    this.subCategories = [];
    this.images = [];
  }

  onBack(): void {
    this.router.navigate(['/product']);
  }

  /* =====================================================
     EMPTY MODEL
  ===================================================== */

  private createEmptyModel(): ProductModel {
    return {
      id: 0,
      productCode: '',
      productName: '',
      sku: null,
      barcode: null,
      productTypeId: null,
      categoryId: null,
      subCategoryId: null,
      unitId: null,
      status: 'Active',
      remarks: null,
      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: ''
    };
  }
}