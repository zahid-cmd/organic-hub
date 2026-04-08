import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-general-ledger-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './general-ledger-form-page.html',
  styleUrls: ['./general-ledger-form-page.css']
})
export class GeneralLedgerFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  ledgerId: number | null = null;

  accountGroups: any[] = [];
  subGroups: any[] = [];

  ledger: any = {
    ledgerCode: '',
    ledgerName: '',
    groupId: null,
    subGroupId: null,
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

    this.loadAccountGroups();

    this.route.queryParams.subscribe(params => {

      this.mode = params['mode'] || 'add';
      this.isViewMode = this.mode === 'view';
      this.ledgerId = params['id'] ? +params['id'] : null;

      if (this.ledgerId && this.mode !== 'add') {
        this.loadLedger(this.ledgerId);
      }
    });
  }

  // ============================================
  // LOAD GROUPS
  // ============================================
  loadAccountGroups(): void {
    this.apiService.getAccountGroups().subscribe({
      next: data => this.accountGroups = data
    });
  }

  // ============================================
  // GROUP CHANGE → LOAD SUBGROUPS
  // ============================================
  onGroupChange(groupId: number | null): void {

    this.ledger.subGroupId = null;
    this.ledger.ledgerCode = '';
    this.subGroups = [];

    if (!groupId) return;

    const allSubGroups = this.apiService.getAccountSubGroups();

    allSubGroups.subscribe({
      next: (data: any[]) => {
        this.subGroups = data.filter(s => s.groupId === groupId);
      }
    });
  }

  // ============================================
  // SUBGROUP CHANGE → GENERATE CODE
  // ============================================
  onSubGroupChange(subGroupId: number | null): void {

    this.ledger.ledgerCode = '';

    if (!subGroupId) return;

    this.apiService
      .getNextGeneralLedgerCode(subGroupId)
      .subscribe({
        next: (code: string) => {
          this.ledger.ledgerCode = code;
        },
        error: () => {
          this.toast.error('Failed to generate ledger code.');
        }
      });
  }

  // ============================================
  // LOAD EXISTING
  // ============================================
  loadLedger(id: number): void {

    this.apiService.getGeneralLedgerById(id).subscribe({
      next: (data: any) => {

        this.ledger = {
          ledgerCode: data.ledgerCode,
          ledgerName: data.ledgerName,
          groupId: data.accountSubGroup?.accountGroup?.id,
          subGroupId: data.subGroupId,
          status: data.status,
          remarks: data.remarks,
          createdBy: data.createdBy,
          createdDate: data.createdDate,
          updatedBy: data.updatedBy,
          updatedDate: data.updatedDate
        };

        if (this.ledger.groupId) {
          this.onGroupChange(this.ledger.groupId);
        }
      },
      error: () => {
        this.toast.error('Failed to load ledger.');
      }
    });
  }

  // ============================================
  // SAVE
  // ============================================
  onSave(): void {

    if (this.isViewMode) return;

    if (!this.ledger.ledgerName?.trim()) {
      this.toast.error('Ledger Name is required.');
      return;
    }

    if (!this.ledger.subGroupId) {
      this.toast.error('Account SubGroup is required.');
      return;
    }

    if (!this.ledger.ledgerCode) {
      this.toast.error('Ledger Code not generated.');
      return;
    }

    const payload = {
      ledgerCode: this.ledger.ledgerCode,
      ledgerName: this.ledger.ledgerName,
      subGroupId: Number(this.ledger.subGroupId),
      status: this.ledger.status,
      remarks: this.ledger.remarks
    };

    const request =
      this.mode === 'edit' && this.ledgerId
        ? this.apiService.updateGeneralLedger(this.ledgerId, payload)
        : this.apiService.createGeneralLedger(payload);

    request.subscribe({
      next: (res: any) => {
        this.toast.success(res?.message || 'Saved successfully.');
        this.router.navigate(['/general-ledger']);
      },
      error: () => {
        this.toast.error('Operation failed.');
      }
    });
  }

  onClear(): void {
    if (this.isViewMode) return;

    this.ledger = {
      ledgerCode: '',
      ledgerName: '',
      groupId: null,
      subGroupId: null,
      status: 'Active',
      remarks: ''
    };

    this.subGroups = [];
  }

  onBack(): void {
    this.router.navigate(['/general-ledger']);
  }
}