import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';

/* ============================================
   INTERFACES
============================================ */

interface Company {
  id: number;
  companyName: string;
}

interface Branch {
  id: number;
  branchName: string;
  companyId: number;
}

/* ============================================
   COMPONENT
============================================ */

@Component({
  selector: 'app-warehouse-setup-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './warehouse-setup-form-page.html',
  styleUrls: ['./warehouse-setup-form-page.css']
})
export class WarehouseSetupFormPageComponent implements OnInit {

  /* ============================================
     MODE STATE
  ============================================ */

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  warehouseId: number | null = null;
  isSaving = false;

  /* ============================================
     DROPDOWN DATA
  ============================================ */

  companies: Company[] = [];
  branches: Branch[] = [];
  filteredBranches: Branch[] = [];

  /* ============================================
     FORM MODEL
  ============================================ */

  warehouse = {
    companyId: null as number | null,
    branchId: null as number | null,

    warehouseCode: '',
    warehouseName: '',
    isDefault: false,
    status: 'Active',

    primaryPhone: '',
    secondaryPhone: '',
    email: '',
    location: '',
    address: '',

    createdBy: '',
    createdDate: '',
    updatedBy: '',
    updatedDate: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {}

  /* ============================================
     INIT
  ============================================ */

  ngOnInit(): void {
    this.initializeRoute();
    this.loadCompanies();
    this.loadBranches();
  }

  private initializeRoute(): void {
    this.route.queryParams.subscribe(params => {

      this.mode = params['mode'] || 'add';
      this.isViewMode = this.mode === 'view';
      this.warehouseId = params['id'] ? +params['id'] : null;

      if (this.mode === 'add') {
        this.loadNextCode();
      }

      if (this.warehouseId && this.mode !== 'add') {
        this.loadWarehouse(this.warehouseId);
      }

    });
  }

  /* ============================================
     LOAD DATA
  ============================================ */

  private loadCompanies(): void {
    this.api.getCompanies().subscribe({
      next: (data) => this.companies = data,
      error: () => this.toast.error('Failed to load companies.')
    });
  }

  private loadBranches(): void {
    this.api.getBranches().subscribe({
      next: (data) => this.branches = data,
      error: () => this.toast.error('Failed to load branches.')
    });
  }

  private loadNextCode(): void {
    this.api.getNextWarehouseCode().subscribe({
      next: (code) => this.warehouse.warehouseCode = code,
      error: () => this.toast.error('Failed to generate warehouse code.')
    });
  }

  private loadWarehouse(id: number): void {
    this.api.getWarehouseById(id).subscribe({
      next: (data) => {
        this.warehouse = data;
        this.onCompanyChange();
      },
      error: () => this.toast.error('Failed to load warehouse.')
    });
  }

  /* ============================================
     COMPANY → BRANCH FILTER
  ============================================ */

  onCompanyChange(): void {

    if (!this.warehouse.companyId) {
      this.filteredBranches = [];
      this.warehouse.branchId = null;
      return;
    }

    this.filteredBranches = this.branches.filter(
      b => b.companyId === this.warehouse.companyId
    );

    this.warehouse.branchId = null;
  }

  /* ============================================
     SAVE
  ============================================ */

  onSave(): void {

    if (this.isViewMode || this.isSaving) return;

    if (!this.warehouse.companyId) {
      this.toast.error('Company is required.');
      return;
    }

    if (!this.warehouse.branchId) {
      this.toast.error('Branch is required.');
      return;
    }

    if (!this.warehouse.warehouseName?.trim()) {
      this.toast.error('Warehouse Name is required.');
      return;
    }

    if (!this.warehouse.status) {
      this.toast.error('Status is required.');
      return;
    }

    this.isSaving = true;

    const payload = {
      companyId: this.warehouse.companyId,
      branchId: this.warehouse.branchId,
      warehouseName: this.warehouse.warehouseName.trim(),
      isDefault: this.warehouse.isDefault,
      status: this.warehouse.status,
      primaryPhone: this.warehouse.primaryPhone,
      secondaryPhone: this.warehouse.secondaryPhone,
      email: this.warehouse.email,
      location: this.warehouse.location,
      address: this.warehouse.address
    };

    const request =
      this.mode === 'edit' && this.warehouseId
        ? this.api.updateWarehouse(this.warehouseId, payload)
        : this.api.createWarehouse(payload);

    request.subscribe({
      next: () => {
        this.toast.success(
          this.mode === 'edit'
            ? 'Warehouse updated successfully.'
            : 'Warehouse created successfully.'
        );
        this.onBack();
      },
      error: () => {
        this.toast.error('Operation failed.');
        this.isSaving = false;
      }
    });
  }

  /* ============================================
     CLEAR
  ============================================ */

  onClear(): void {

    if (this.isViewMode) return;

    const selectedCompany = this.warehouse.companyId;

    this.warehouse = {
      companyId: selectedCompany,
      branchId: null,
      warehouseCode: '',
      warehouseName: '',
      isDefault: false,
      status: 'Active',

      primaryPhone: '',
      secondaryPhone: '',
      email: '',
      location: '',
      address: '',

      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: ''
    };

    this.onCompanyChange();
    this.loadNextCode();
  }

  /* ============================================
     NAVIGATION
  ============================================ */

  onBack(): void {
    this.router.navigate(['/general-setup/warehouse-setup']);
  }

}