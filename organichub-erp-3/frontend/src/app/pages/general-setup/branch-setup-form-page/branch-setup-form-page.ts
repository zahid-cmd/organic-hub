import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';

interface CompanyDropdown {
  id: number;
  companyName: string;
}

interface BranchModel {
  id: number;
  companyId: number | null;

  branchCode: string;
  branchName: string;
  status: string;

  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  location: string;
  address: string;

  bin: string;
  vatPaymentCode: string;
  economicActivity: string;

  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

@Component({
  selector: 'app-branch-setup-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent
  ],
  templateUrl: './branch-setup-form-page.html',
  styleUrls: ['./branch-setup-form-page.css']
})
export class BranchSetupFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  branchId: number | null = null;
  isSaving = false;

  companies: CompanyDropdown[] = [];
  branch: BranchModel = this.createEmptyModel();

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
    this.initializeRoute();
    this.loadCompanies();
  }

  private initializeRoute(): void {

    this.route.queryParams.subscribe(params => {

      this.mode = params['mode'] || 'add';
      this.isViewMode = this.mode === 'view';
      this.branchId = params['id'] ? +params['id'] : null;

      if (this.mode === 'add') {
        this.loadNextCode();
      }

      if (this.branchId && this.mode !== 'add') {
        this.loadBranch(this.branchId);
      }

    });
  }

  // =====================================================
  // LOAD COMPANIES
  // =====================================================
  private loadCompanies(): void {

    this.apiService.getCompanies().subscribe({
      next: (data: any[]) => {

        this.companies = data.map(c => ({
          id: c.id,
          companyName: c.companyName
        }));

        // Auto select first company ONLY in add mode
        if (this.mode === 'add' && this.companies.length > 0) {
          this.branch.companyId = this.companies[0].id;
        }

      },
      error: () => {
        this.toast.error('Failed to load companies.');
      }
    });
  }

  // =====================================================
  // LOAD NEXT CODE
  // =====================================================
  private loadNextCode(): void {

    this.apiService.getNextBranchCode().subscribe({
      next: (code: string) => {
        this.branch.branchCode = code;
      },
      error: () => {
        this.toast.error('Failed to generate branch code.');
      }
    });

  }

  // =====================================================
  // LOAD BRANCH (EDIT / VIEW)
  // =====================================================
  private loadBranch(id: number): void {

    this.apiService.getBranchById(id).subscribe({
      next: (data: BranchModel) => {
        this.branch = data;
      },
      error: () => {
        this.toast.error('Failed to load branch.');
      }
    });

  }

  // =====================================================
  // SAVE
  // =====================================================
  onSave(): void {

    if (this.isViewMode || this.isSaving) return;

    if (!this.branch.branchName?.trim()) {
      this.toast.error('Branch Name is required.');
      return;
    }

    if (!this.branch.primaryPhone?.trim()) {
      this.toast.error('Primary Phone is required.');
      return;
    }

    if (!this.branch.location?.trim()) {
      this.toast.error('Location is required.');
      return;
    }

    if (!this.branch.companyId) {
      this.toast.error('Company is required.');
      return;
    }

    this.isSaving = true;

    const payload = {
      companyId: this.branch.companyId,
      branchName: this.branch.branchName.trim(),
      status: this.branch.status,
      primaryPhone: this.branch.primaryPhone,
      secondaryPhone: this.branch.secondaryPhone,
      email: this.branch.email,
      location: this.branch.location,
      address: this.branch.address,
      bin: this.branch.bin,
      vatPaymentCode: this.branch.vatPaymentCode,
      economicActivity: this.branch.economicActivity
    };

    const request =
      this.mode === 'edit' && this.branchId
        ? this.apiService.updateBranch(this.branchId, payload)
        : this.apiService.createBranch(payload);

    request.subscribe({
      next: () => {
        this.toast.success(
          this.mode === 'edit'
            ? 'Branch updated successfully.'
            : 'Branch created successfully.'
        );
        this.redirect();
      },
      error: () => {
        this.toast.error('Operation failed.');
        this.isSaving = false;
      }
    });
  }

  // =====================================================
  // CLEAR
  // =====================================================
  onClear(): void {

    if (this.isViewMode) return;

    const selectedCompany = this.branch.companyId;

    this.branch = this.createEmptyModel();
    this.branch.companyId = selectedCompany;

    this.loadNextCode();
  }

  // =====================================================
  // BACK
  // =====================================================
  onBack(): void {
    this.router.navigate(['/general-setup/branch-setup']);
  }

  private redirect(): void {
    setTimeout(() => {
      this.router.navigate(['/general-setup/branch-setup']);
    }, 1200);
  }

  // =====================================================
  // EMPTY MODEL
  // =====================================================
  private createEmptyModel(): BranchModel {
    return {
      id: 0,
      companyId: null,
      branchCode: '',
      branchName: '',
      status: 'Active',
      primaryPhone: '',
      secondaryPhone: '',
      email: '',
      location: '',
      address: '',
      bin: '',
      vatPaymentCode: '',
      economicActivity: '',
      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: ''
    };
  }

}