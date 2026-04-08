import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-cash-account-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './cash-account-form-page.html',
  styleUrls: ['./cash-account-form-page.css']
})
export class CashAccountFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  accountId: number | null = null;

  branches: any[] = [];

  account: any = this.getEmptyModel();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    private apiService: ApiService
  ) {}

  // =====================================================
  // INIT
  // =====================================================
  ngOnInit(): void {

    this.loadBranches();

    this.route.queryParams.subscribe(params => {

      this.mode = params['mode'] || 'add';
      this.isViewMode = this.mode === 'view';
      this.accountId = params['id'] ? +params['id'] : null;

      if (this.mode === 'add') {
        this.generateCode();
      }

      if (this.accountId && this.mode !== 'add') {
        this.loadAccount(this.accountId);
      }
    });
  }

  // =====================================================
  // EMPTY MODEL
  // =====================================================
  getEmptyModel() {
    return {
      accountCode: '',
      accountName: '',
      cashAccountName: '',
      branchId: null,
      isCollectionAccount: false,
      isPaymentAccount: false,
      status: 'Active',
      remarks: '',
      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: ''
    };
  }

  // =====================================================
  // LOAD BRANCHES
  // =====================================================
  loadBranches(): void {
    this.apiService.getBranches().subscribe({
      next: data => this.branches = data,
      error: () => this.toast.error('Failed to load branches.')
    });
  }

  // =====================================================
  // AUTO GENERATE CASH LEDGER NAME
  // =====================================================
  updateCashAccountName(): void {

    const branch = this.branches.find(
      b => b.id === this.account.branchId
    );

    const baseName = (this.account.accountName || '').trim();

    if (!baseName || !branch) {
      this.account.cashAccountName = '';
      return;
    }

    this.account.cashAccountName =
      `${baseName} - ${branch.branchName}`;
  }

  // =====================================================
  // LOAD EXISTING
  // =====================================================
  loadAccount(id: number): void {

    this.apiService.getCashAccountById(id).subscribe({
      next: (data: any) => {

        this.account = {
          ...this.getEmptyModel(),
          accountCode: data.accountCode,
          accountName: data.accountName,
          cashAccountName: data.cashAccountName,
          branchId: data.branchId,
          isCollectionAccount: data.isCollectionAccount,
          isPaymentAccount: data.isPaymentAccount,
          status: data.status,
          remarks: data.remarks,
          createdBy: data.createdBy,
          createdDate: data.createdDate,
          updatedBy: data.updatedBy,
          updatedDate: data.updatedDate
        };

      },
      error: () => this.toast.error('Failed to load cash account.')
    });
  }

  // =====================================================
  // GENERATE CODE
  // =====================================================
  generateCode(): void {

    this.apiService.getNextCashAccountCode().subscribe({
      next: (code: string) => this.account.accountCode = code,
      error: () => this.toast.error('Failed to generate code.')
    });
  }

  // =====================================================
  // VALIDATION
  // =====================================================
  validate(): boolean {

    if (!this.account.accountName?.trim()) {
      this.toast.error('Account Name is required.');
      return false;
    }

    if (!this.account.branchId) {
      this.toast.error('Branch is required.');
      return false;
    }

    if (!this.account.isCollectionAccount &&
        !this.account.isPaymentAccount) {
      this.toast.error('Select Collection or Payment.');
      return false;
    }

    return true;
  }

  // =====================================================
  // SAVE
  // =====================================================
  onSave(): void {

    if (this.isViewMode) return;
    if (!this.validate()) return;

    const payload = {
      accountCode: this.account.accountCode,
      accountName: this.account.accountName,
      branchId: Number(this.account.branchId),
      isCollectionAccount: this.account.isCollectionAccount,
      isPaymentAccount: this.account.isPaymentAccount,
      status: this.account.status,
      remarks: this.account.remarks
    };

    const request =
      this.mode === 'edit' && this.accountId
        ? this.apiService.updateCashAccount(this.accountId, payload)
        : this.apiService.createCashAccount(payload);

    request.subscribe({
      next: (res: any) => {
        this.toast.success(res?.message || 'Cash account saved successfully.');
        this.router.navigate(['/cash-account']);
      },
      error: () => this.toast.error('Operation failed.')
    });
  }

  // =====================================================
  // CLEAR
  // =====================================================
  onClear(): void {

    if (this.isViewMode) return;

    this.account = this.getEmptyModel();
    this.generateCode();
  }

  // =====================================================
  // BACK
  // =====================================================
  onBack(): void {
    this.router.navigate(['/cash-account']);
  }
}