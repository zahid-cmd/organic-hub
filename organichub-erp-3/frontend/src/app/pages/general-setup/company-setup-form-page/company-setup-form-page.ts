import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';
import { ApiService } from '../../../services/api.service';

interface CompanyModel {
  id: number;
  companyCode: string;
  companyName: string;
  status: string;
  remarks: string | null;

  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  website: string;

  tin: string;
  bin: string;
  vatPaymentCode: string;
  ownershipType: string;

  logoFileName: string | null;   // ✅ MUST match backend

  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

@Component({
  selector: 'app-company-setup-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './company-setup-form-page.html',
  styleUrls: ['./company-setup-form-page.css']
})
export class CompanySetupFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  companyId: number | null = null;

  company: CompanyModel = this.createEmptyModel();
  selectedLogoFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeRoute();
  }

  // =============================================
  // ROUTE INIT
  // =============================================
  private initializeRoute(): void {

    this.route.queryParams.subscribe(params => {

      this.mode = params['mode'] || 'add';
      this.isViewMode = this.mode === 'view';
      this.companyId = params['id'] ? +params['id'] : null;

      if (this.mode === 'add') {
        this.loadNextCode();
      }

      if (this.companyId && this.mode !== 'add') {
        this.loadCompany(this.companyId);
      }

    });
  }

  // =============================================
  // LOAD NEXT CODE
  // =============================================
  private loadNextCode(): void {

    this.apiService.getNextCompanyCode().subscribe({
      next: (code: string) => {
        this.company.companyCode = code;
      },
      error: () => {
        this.toast.error('Failed to generate company code.');
      }
    });

  }

  // =============================================
  // LOAD COMPANY
  // =============================================
  private loadCompany(id: number): void {

    this.apiService.getCompanyById(id).subscribe({
      next: (data: CompanyModel) => {
        this.company = data;   // ✅ No mapping needed
      },
      error: () => {
        this.toast.error('Failed to load company.');
      }
    });

  }

  // =============================================
  // LOGO FILE SELECT
  // =============================================
  onLogoSelect(event: Event): void {

    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedLogoFile = file;

    // Upload immediately in edit mode
    if (this.companyId) {
      this.uploadLogo();
    }
  }

  // =============================================
  // UPLOAD LOGO
  // =============================================
  private uploadLogo(): void {

    if (!this.selectedLogoFile || !this.companyId) return;

    const formData = new FormData();
    formData.append('file', this.selectedLogoFile);

    this.apiService.uploadCompanyLogo(this.companyId, formData)
      .subscribe({
        next: () => {
          this.toast.success('Logo uploaded successfully.');

          // Reload company to refresh logoFileName
          this.loadCompany(this.companyId!);
        },
        error: () => {
          this.toast.error('Logo upload failed.');
        }
      });
  }

  // =============================================
  // SAFE LOGO URL BUILDER (FINAL FIX)
  // =============================================
  getLogoUrl(): string | null {

    if (!this.company.logoFileName) return null;

    // Remove /api from base URL automatically
    const baseUrl = environment.apiUrl.replace('/api', '');

    return `${baseUrl}/uploads/company-logos/${this.company.logoFileName}`;
  }

  // =============================================
  // SAVE COMPANY DATA
  // =============================================
  onSave(): void {

    if (this.isViewMode) return;

    if (!this.company.companyName?.trim()) {
      this.toast.error('Company Name is required.');
      return;
    }

    const payload = {
      companyName: this.company.companyName.trim(),
      status: this.company.status,
      remarks: this.company.remarks,
      primaryPhone: this.company.primaryPhone,
      secondaryPhone: this.company.secondaryPhone,
      email: this.company.email,
      website: this.company.website,
      tin: this.company.tin,
      bin: this.company.bin,
      vatPaymentCode: this.company.vatPaymentCode,
      ownershipType: this.company.ownershipType
    };

    const request =
      this.mode === 'edit' && this.companyId
        ? this.apiService.updateCompany(this.companyId, payload)
        : this.apiService.createCompany(payload);

    request.subscribe({
      next: () => {

        this.toast.success(
          this.mode === 'edit'
            ? 'Company updated successfully.'
            : 'Company created successfully.'
        );

        this.redirect();
      },
      error: () => {
        this.toast.error('Operation failed.');
      }
    });
  }

  // =============================================
  // CLEAR
  // =============================================
  onClear(): void {

    if (this.isViewMode) return;

    this.company = this.createEmptyModel();
    this.loadNextCode();
  }

  // =============================================
  // BACK
  // =============================================
  onBack(): void {
    this.router.navigate(['/general-setup/company-setup']);
  }

  private redirect(): void {
    setTimeout(() => {
      this.router.navigate(['/general-setup/company-setup']);
    }, 1200);
  }

  // =============================================
  // EMPTY MODEL
  // =============================================
  private createEmptyModel(): CompanyModel {

    return {
      id: 0,
      companyCode: '',
      companyName: '',
      status: 'Active',
      remarks: null,
      primaryPhone: '',
      secondaryPhone: '',
      email: '',
      website: '',
      tin: '',
      bin: '',
      vatPaymentCode: '',
      ownershipType: '',
      logoFileName: null,
      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: ''
    };
  }

}