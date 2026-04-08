import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-pos-account-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './pos-account-form-page.html',
  styleUrls: ['./pos-account-form-page.css']
})
export class PosAccountFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  accountId: number | null = null;

  branches: any[] = [];
  bankAccounts: any[] = [];

  posAccount: any = this.getEmptyModel();

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
      terminalOrMerchantId: '',
      branchId: null,
      linkedBankAccountId: null,
      isCollectionAccount: true,
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
  // BRANCH CHANGE (FOR ADD MODE)
  // =====================================================
  onBranchChange(): void {

    const branchId = Number(this.posAccount.branchId);

    this.posAccount.linkedBankAccountId = null;
    this.bankAccounts = [];

    if (!branchId) return;

    this.loadBankAccounts(branchId);
  }

  // =====================================================
  // LOAD BANKS BY BRANCH
  // =====================================================
  loadBankAccounts(branchId: number, selectedBankId?: number): void {

    this.apiService.getBankAccounts().subscribe({
      next: (data: any[]) => {

        this.bankAccounts = data.filter(b =>
          Number(b.branchId) === branchId &&
          b.status === 'Active'
        );

        // 🔥 Important for EDIT mode
        if (selectedBankId) {
          this.posAccount.linkedBankAccountId = selectedBankId;
        }
      },
      error: () => this.toast.error('Failed to load bank accounts.')
    });
  }

  // =====================================================
  // AUTO LEDGER
  // =====================================================
  get posLedger(): string {
    const terminal = this.posAccount.terminalOrMerchantId?.trim() || '';
    return terminal ? `POS-${terminal.toUpperCase()}` : '';
  }

  // =====================================================
  // LOAD EXISTING (FIXED)
  // =====================================================
  loadAccount(id: number): void {

    this.apiService.getPosAccountById(id).subscribe({
      next: (data: any) => {

        // Set base fields first
        this.posAccount = {
          ...this.getEmptyModel(),
          ...data
        };

        // Load banks AFTER branch is set
        if (this.posAccount.branchId) {
          this.loadBankAccounts(
            this.posAccount.branchId,
            data.linkedBankAccountId
          );
        }
      },
      error: () => this.toast.error('Failed to load POS account.')
    });
  }

  // =====================================================
  // GENERATE CODE
  // =====================================================
  generateCode(): void {
    this.apiService.getNextPosAccountCode().subscribe({
      next: (code: string) => this.posAccount.accountCode = code,
      error: () => this.toast.error('Failed to generate account code.')
    });
  }

  // =====================================================
  // VALIDATION
  // =====================================================
  validate(): boolean {

    if (!this.posAccount.branchId) {
      this.toast.error('Branch is required.');
      return false;
    }

    if (!this.posAccount.terminalOrMerchantId?.trim()) {
      this.toast.error('Terminal / Merchant ID is required.');
      return false;
    }

    if (!this.posAccount.linkedBankAccountId) {
      this.toast.error('Linked Bank Account is required.');
      return false;
    }

    if (!this.posAccount.isCollectionAccount &&
        !this.posAccount.isPaymentAccount) {
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
      accountCode: this.posAccount.accountCode,
      terminalOrMerchantId: this.posAccount.terminalOrMerchantId,
      branchId: Number(this.posAccount.branchId),
      linkedBankAccountId: this.posAccount.linkedBankAccountId,
      isCollectionAccount: this.posAccount.isCollectionAccount,
      isPaymentAccount: this.posAccount.isPaymentAccount,
      status: this.posAccount.status,
      remarks: this.posAccount.remarks
    };

    const request =
      this.mode === 'edit' && this.accountId
        ? this.apiService.updatePosAccount(this.accountId, payload)
        : this.apiService.createPosAccount(payload);

    request.subscribe({
      next: () => {
        this.toast.success('POS account saved successfully.');
        this.router.navigate(['/pos-account']);
      },
      error: () => this.toast.error('Operation failed.')
    });
  }

  // =====================================================
  // CLEAR
  // =====================================================
  onClear(): void {
    if (this.isViewMode) return;

    this.posAccount = this.getEmptyModel();
    this.bankAccounts = [];
    this.generateCode();
  }

  // =====================================================
  // BACK
  // =====================================================
  onBack(): void {
    this.router.navigate(['/pos-account']);
  }
}