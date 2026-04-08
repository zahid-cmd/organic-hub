import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';
import { ApiService } from '../../../services/api.service';

interface Supplier {
  id: number;
  supplierCode: string;
  supplierName: string;

  accountSubGroupName: string | null;
  subGroupCode: string | null;

  contactPerson: string | null;
  primaryPhone: string | null;
  phone: string | null;

  email: string | null;
  address: string | null;

  status: string;
  remarks: string | null;

  createdBy: string;
  createdDate: string;
  updatedBy: string | null;
  updatedDate: string | null;
}

@Component({
  selector: 'app-supplier-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './supplier-form-page.html',
  styleUrls: ['./supplier-form-page.css']
})
export class SupplierFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  supplierId: number | null = null;

  loading = false;

  supplier: Supplier = this.createEmptySupplier();

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

      this.mode = (params['mode'] as any) || 'add';
      this.isViewMode = this.mode === 'view';
      this.supplierId = params['id'] ? +params['id'] : null;

      if (this.supplierId && this.mode !== 'add') {
        this.loadSupplier(this.supplierId);
      } else {
        this.initializeAddMode();
      }
    });
  }

  // =====================================================
  // INITIALIZE ADD MODE
  // =====================================================

  private initializeAddMode(): void {
    this.supplier = this.createEmptySupplier();
    this.loadFixedSubGroup();   // 🔥 load subgroup first
    this.loadNextSupplierCode();
  }

  // =====================================================
  // LOAD SUPPLIER (EDIT / VIEW)
  // =====================================================

  private loadSupplier(id: number): void {

    this.loading = true;

    this.apiService.getSupplierById(id).subscribe({
      next: (data: Supplier) => {
        this.supplier = { ...data };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load supplier.');
      }
    });
  }

  // =====================================================
  // LOAD FIXED SUBGROUP
  // =====================================================

  private loadFixedSubGroup(): void {

    this.apiService.getFixedSupplierSubGroup().subscribe({
      next: (data: any) => {
        this.supplier.accountSubGroupName = data.accountSubGroupName;
        this.supplier.subGroupCode = data.subGroupCode;
      },
      error: () => {
        this.toast.error('Failed to load Account Sub Group.');
      }
    });
  }

  // =====================================================
  // LOAD NEXT CODE
  // =====================================================

  private loadNextSupplierCode(): void {

    this.apiService.getNextSupplierCode().subscribe({
      next: (code: string) => {
        this.supplier.supplierCode = code;
      },
      error: () => {
        this.toast.error('Failed to generate supplier code.');
      }
    });
  }

  // =====================================================
  // DISPLAY HELPER
  // =====================================================

  get saveButtonLabel(): string {
    return this.mode === 'edit' ? 'Update' : 'Save';
  }

  get supplierDisplayName(): string {
    const name = this.supplier.supplierName?.trim() || '';
    const phone = this.supplier.primaryPhone?.trim() || '';

    if (!name && !phone) return '';
    if (name && phone) return `${name} - ${phone}`;
    return name || phone;
  }

  // =====================================================
  // SAVE
  // =====================================================

  onSave(): void {

    if (this.isViewMode) return;

    if (!this.supplier.supplierName?.trim()) {
      this.toast.error('Supplier Name is required.');
      return;
    }

    const payload = {
      supplierName: this.supplier.supplierName.trim(),
      contactPerson: this.supplier.contactPerson?.trim() || null,
      primaryPhone: this.supplier.primaryPhone?.trim() || null,
      phone: this.supplier.phone?.trim() || null,
      email: this.supplier.email?.trim() || null,
      address: this.supplier.address?.trim() || null,
      status: this.supplier.status || 'Active',
      remarks: this.supplier.remarks?.trim() || null
    };

    if (this.mode === 'edit' && this.supplierId) {

      this.apiService.updateSupplier(this.supplierId, payload).subscribe({
        next: () => {
          this.toast.success('Supplier updated successfully.');
          this.redirect();
        },
        error: err => {
          this.toast.error(err?.error?.message || 'Update failed.');
        }
      });

    } else {

      this.apiService.createSupplier(payload).subscribe({
        next: () => {
          this.toast.success('Supplier created successfully.');
          this.redirect();
        },
        error: err => {
          this.toast.error(err?.error?.message || 'Creation failed.');
        }
      });

    }
  }

  // =====================================================
  // CLEAR
  // =====================================================

  onClear(): void {

    if (this.isViewMode) return;

    this.initializeAddMode();  // 🔥 reset properly
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  onBack(): void {
    this.router.navigate(['/supplier']);
  }

  private redirect(): void {
    setTimeout(() => {
      this.router.navigate(['/supplier']);
    }, 1200);
  }

  // =====================================================
  // EMPTY OBJECT
  // =====================================================

  private createEmptySupplier(): Supplier {
    return {
      id: 0,
      supplierCode: '',
      supplierName: '',
      accountSubGroupName: null,
      subGroupCode: null,
      contactPerson: null,
      primaryPhone: null,
      phone: null,
      email: null,
      address: null,
      status: 'Active',
      remarks: null,
      createdBy: '',
      createdDate: '',
      updatedBy: null,
      updatedDate: null
    };
  }
}