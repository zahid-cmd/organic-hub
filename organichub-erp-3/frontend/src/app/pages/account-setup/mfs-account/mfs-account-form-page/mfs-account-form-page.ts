import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-mfs-account-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './mfs-account-form-page.html',
  styleUrls: ['./mfs-account-form-page.css']
})
export class MfsAccountFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  accountId: number | null = null;

  branches: any[] = [];
  bankAccounts: any[] = [];

  mfsOperators: string[] = [
    'bKash',
    'Nagad',
    'Rocket',
    'Upay',
    'SureCash',
    'Tap'
  ];

  mfsAccount: any = this.getEmptyModel();

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
      mfsOperator: null,
      walletOrMerchantNumber: '',
      mfsLedgerName: '',
      branchId: null,
      linkedBankAccountId: null,
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
  // BRANCH CHANGE (ADD MODE)
  // =====================================================
  onBranchChange(): void {

    const branchId = Number(this.mfsAccount.branchId);

    this.mfsAccount.linkedBankAccountId = null;
    this.bankAccounts = [];

    if (!branchId) return;

    this.loadBankAccounts(branchId);
  }

  // =====================================================
  // LOAD BANKS
  // =====================================================
  loadBankAccounts(branchId: number, selectedBankId?: number): void {

    this.apiService.getBankAccounts().subscribe({
      next: (data: any[]) => {

        this.bankAccounts = data.filter(b => {

          const bankBranchId =
            Number(b.branchId) ||
            Number(b.branch?.id) ||
            Number(b.branch?.branchId);

          return bankBranchId === branchId &&
                 b.status === 'Active';
        });

        // Important for EDIT mode
        if (selectedBankId) {
          this.mfsAccount.linkedBankAccountId = selectedBankId;
        }
      },
      error: () => {
        this.bankAccounts = [];
        this.toast.error('Failed to load bank accounts.');
      }
    });
  }

  // =====================================================
  // AUTO LEDGER
  // =====================================================
  updateLedger(): void {

    const operator = this.mfsAccount.mfsOperator;
    const wallet = (this.mfsAccount.walletOrMerchantNumber || '').trim();

    if (!operator) {
      this.mfsAccount.mfsLedgerName = '';
      return;
    }

    this.mfsAccount.mfsLedgerName =
      wallet ? `${operator} - ${wallet}` : operator;
  }

  // =====================================================
  // LOAD EXISTING (FIXED EDIT MODE)
  // =====================================================
  loadAccount(id: number): void {

    this.apiService.getMfsAccountById(id).subscribe({
      next: (data: any) => {

        const operator =
          data.accountName?.split(' - ')[0] ?? null;

        this.mfsAccount = {
          ...this.getEmptyModel(),
          ...data,
          mfsOperator: operator
        };

        if (this.mfsAccount.branchId) {
          this.loadBankAccounts(
            this.mfsAccount.branchId,
            data.linkedBankAccountId
          );
        }

        this.updateLedger();
      },
      error: () => this.toast.error('Failed to load MFS account.')
    });
  }

  // =====================================================
  // GENERATE CODE
  // =====================================================
  generateCode(): void {
    this.apiService.getNextMfsAccountCode().subscribe({
      next: (code: string) => this.mfsAccount.accountCode = code,
      error: () => this.toast.error('Failed to generate code.')
    });
  }

  // =====================================================
  // VALIDATION
  // =====================================================
  validate(): boolean {

    if (!this.mfsAccount.mfsOperator) {
      this.toast.error('MFS Operator is required.');
      return false;
    }

    if (!this.mfsAccount.walletOrMerchantNumber?.trim()) {
      this.toast.error('Wallet / Merchant Number is required.');
      return false;
    }

    if (!this.mfsAccount.branchId) {
      this.toast.error('Branch is required.');
      return false;
    }

    if (!this.mfsAccount.linkedBankAccountId) {
      this.toast.error('Linked Bank Account is required.');
      return false;
    }

    if (!this.mfsAccount.isCollectionAccount &&
        !this.mfsAccount.isPaymentAccount) {
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
      accountCode: this.mfsAccount.accountCode,
      accountName: this.mfsAccount.mfsLedgerName,
      shortAccountName: this.mfsAccount.mfsOperator,
      walletOrMerchantNumber: this.mfsAccount.walletOrMerchantNumber,
      branchId: Number(this.mfsAccount.branchId),
      linkedBankAccountId: this.mfsAccount.linkedBankAccountId,
      isCollectionAccount: this.mfsAccount.isCollectionAccount,
      isPaymentAccount: this.mfsAccount.isPaymentAccount,
      status: this.mfsAccount.status,
      remarks: this.mfsAccount.remarks
    };

    const request =
      this.mode === 'edit' && this.accountId
        ? this.apiService.updateMfsAccount(this.accountId, payload)
        : this.apiService.createMfsAccount(payload);

    request.subscribe({
      next: (res: any) => {
        this.toast.success(res?.message || 'Saved successfully.');
        this.router.navigate(['/mfs-account']);
      },
      error: () => this.toast.error('Operation failed.')
    });
  }

  // =====================================================
  // CLEAR
  // =====================================================
  onClear(): void {

    if (this.isViewMode) return;

    this.mfsAccount = this.getEmptyModel();
    this.bankAccounts = [];
    this.generateCode();
  }

  // =====================================================
  // BACK
  // =====================================================
  onBack(): void {
    this.router.navigate(['/mfs-account']);
  }
}