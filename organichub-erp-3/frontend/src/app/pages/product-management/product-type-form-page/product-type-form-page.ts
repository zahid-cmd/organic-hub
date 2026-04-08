import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';
import { ApiService } from '../../../services/api.service';

interface ProductType {
  id: number;
  typeCode: string;
  typeName: string;
  status: string;
  remarks: string | null;

  isPurchasable: boolean;
  isSellable: boolean;
  isProductionItem: boolean;

  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

@Component({
  selector: 'app-product-type-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './product-type-form-page.html',
  styleUrls: ['./product-type-form-page.css']
})
export class ProductTypeFormPageComponent implements OnInit {

  // =====================================================
  // MODE STATE
  // =====================================================

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  productTypeId: number | null = null;

  // =====================================================
  // MODEL
  // =====================================================

  productType: ProductType = this.createEmpty();

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

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

    this.route.queryParams.subscribe(params => {

      this.mode = (params['mode'] as 'add' | 'edit' | 'view') || 'add';
      this.isViewMode = this.mode === 'view';
      this.productTypeId = params['id'] ? +params['id'] : null;

      if (this.productTypeId && this.mode !== 'add') {
        this.loadProductType(this.productTypeId);
      } else {
        if (this.mode === 'add') {
          this.generateCode();
        }
      }
    });
  }

  // =====================================================
  // AUTO CODE GENERATION → PT-001
  // =====================================================

  private generateCode(): void {

    this.apiService.getProductTypes().subscribe({
      next: (data: ProductType[]) => {

        if (!data || data.length === 0) {
          this.productType.typeCode = 'PT-001';
          return;
        }

        const numbers = data
          .map(x => x.typeCode)
          .filter(code => code?.startsWith('PT-'))
          .map(code => parseInt(code.replace('PT-', ''), 10))
          .filter(n => !isNaN(n));

        const max = numbers.length ? Math.max(...numbers) : 0;

        this.productType.typeCode =
          `PT-${(max + 1).toString().padStart(3, '0')}`;
      },
      error: () => {
        this.toast.error('Failed to generate Product Type Code.');
      }
    });
  }

  // =====================================================
  // LOAD
  // =====================================================

  private loadProductType(id: number): void {

    this.apiService.getProductTypeById(id).subscribe({
      next: (data: ProductType) => {
        this.productType = { ...data };
      },
      error: () => {
        this.toast.error('Failed to load Product Type.');
      }
    });
  }

  // =====================================================
  // SAVE / UPDATE
  // =====================================================

  onSave(): void {

    if (this.isViewMode) return;

    if (!this.productType.typeName?.trim()) {
      this.toast.error('Product Type Name is required.');
      return;
    }

    const payload = {
      typeName: this.productType.typeName.trim(),
      status: this.productType.status || 'Active',
      remarks: this.productType.remarks,

      isPurchasable: this.productType.isPurchasable,
      isSellable: this.productType.isSellable,
      isProductionItem: this.productType.isProductionItem
    };

    const request =
      this.mode === 'edit' && this.productTypeId
        ? this.apiService.updateProductType(this.productTypeId, payload)
        : this.apiService.createProductType(payload);

    request.subscribe({
      next: () => {

        this.toast.success(
          this.mode === 'edit'
            ? 'Product Type updated successfully.'
            : 'Product Type created successfully.'
        );

        setTimeout(() => {
          this.router.navigate(['/product-type']);
        }, 1200);
      },
      error: () => {
        this.toast.error('Operation failed.');
      }
    });
  }

  // =====================================================
  // CLEAR
  // =====================================================

  onClear(): void {

    if (this.isViewMode) return;

    this.productType.typeName = '';
    this.productType.status = 'Active';
    this.productType.remarks = null;

    this.productType.isPurchasable = false;
    this.productType.isSellable = false;
    this.productType.isProductionItem = false;
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  onBack(): void {
    this.router.navigate(['/product-type']);
  }

  // =====================================================
  // EMPTY MODEL
  // =====================================================

  private createEmpty(): ProductType {
    return {
      id: 0,
      typeCode: '',
      typeName: '',
      status: 'Active',
      remarks: null,

      isPurchasable: false,
      isSellable: false,
      isProductionItem: false,

      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: ''
    };
  }
}
