import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-bank-account-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './bank-account-form-page.html',
  styleUrls: ['./bank-account-form-page.css']
})
export class BankAccountFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  accountId: number | null = null;

  branches: any[] = [];
  banks: any[] = [];

  account: any = {
    accountCode: '',
    branchId: null,

    subCategoryName: 'Cash At Banks',
    subCategoryCode: 'SUB-01-04-001',

    bankSetupId: null,
    shortBankName: '',

    bankBranchName: '',
    bankShortBranchName: '',

    fullAccountTitle: '',
    shortAccountTitle: '',
    fullAccountNumber: '',
    shortAccountNumber: '',
    bankAccountName: '',

    isCollectionAccount: false,
    isPaymentAccount: false,

    status: 'Active',
    remarks: '',

    createdBy: '',
    createdDate: '',
    updatedBy: '',
    updatedDate: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {

    this.loadBranches();
    this.loadBanks();

    this.route.queryParams.subscribe(params => {

      this.mode = params['mode'] || 'add';
      this.isViewMode = this.mode === 'view';
      this.accountId = params['id'] ? +params['id'] : null;

      if (this.accountId && this.mode !== 'add') {
        this.loadAccount(this.accountId);
      }

      if (this.mode === 'add') {
        this.generateCode();
      }
    });
  }

  loadBranches(): void {
    this.apiService.getBranches().subscribe({
      next: data => this.branches = data ?? []
    });
  }

  loadBanks(): void {
    this.apiService.getBankSetups().subscribe({
      next: data => this.banks = data ?? []
    });
  }

  generateCode(): void {
    this.apiService.getNextBankAccountCode().subscribe({
      next: (code: string) => this.account.accountCode = code
    });
  }

  loadAccount(id: number): void {
    this.apiService.getBankAccountById(id).subscribe({
      next: (data: any) => this.account = data,
      error: () => this.toast.error('Failed to load bank account.')
    });
  }

  onBankChange(): void {

    const bank = this.banks.find(
      b => b.id === this.account.bankSetupId
    );

    this.account.shortBankName = bank?.shortName ?? '';

    this.updateBankAccountName();
  }

  // Progressive Auto Builder
  updateBankAccountName(): void {

    const parts = [
      this.account.shortBankName?.trim(),
      this.account.shortAccountTitle?.trim(),
      this.account.shortAccountNumber?.trim(),
      this.account.bankShortBranchName?.trim()
    ].filter(p => p && p.length > 0);

    this.account.bankAccountName = parts.join('-');
  }

  onSave(): void {

    if (this.isViewMode) return;

    if (!this.account.branchId) {
      this.toast.error('Branch is required.');
      return;
    }

    if (!this.account.bankSetupId) {
      this.toast.error('Bank is required.');
      return;
    }

    if (!this.account.bankAccountName) {
      this.toast.error('Bank Account Name cannot be empty.');
      return;
    }

    const payload = { ...this.account };

    const request =
      this.mode === 'edit' && this.accountId
        ? this.apiService.updateBankAccount(this.accountId, payload)
        : this.apiService.createBankAccount(payload);

    request.subscribe({
      next: (res: any) => {
        this.toast.success(res?.message || 'Saved successfully.');
        this.router.navigate(['/bank-account']);
      },
      error: () => this.toast.error('Operation failed.')
    });
  }

  onClear(): void {

    if (this.isViewMode) return;

    this.account = {
      accountCode: '',
      branchId: null,
      subCategoryName: 'Cash At Banks',
      subCategoryCode: 'SUB-01-04-001',
      bankSetupId: null,
      shortBankName: '',
      bankBranchName: '',
      bankShortBranchName: '',
      fullAccountTitle: '',
      shortAccountTitle: '',
      fullAccountNumber: '',
      shortAccountNumber: '',
      bankAccountName: '',
      isCollectionAccount: false,
      isPaymentAccount: false,
      status: 'Active',
      remarks: ''
    };

    this.generateCode();
  }

  onBack(): void {
    this.router.navigate(['/bank-account']);
  }
}