import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-bank-setup-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './bank-setup-form-page.html',
  styleUrls: ['./bank-setup-form-page.css']
})
export class BankSetupFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  bankId: number | null = null;

  bank: any = {
    bankCode: '',
    bankName: '',
    shortName: '',
    routingNumber: '',
    swiftCode: '',
    status: 'Active',
    createdBy: '',
    createdDate: '',
    updatedBy: '',
    updatedDate: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    private api: ApiService
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.mode = params['mode'] || 'add';
      this.isViewMode = this.mode === 'view';
      this.bankId = params['id'] ? +params['id'] : null;

      if (this.mode === 'add') {
        this.generateCode();
      }

      if (this.bankId && this.mode !== 'add') {
        this.loadBank(this.bankId);
      }
    });
  }

  generateCode(): void {
    this.api.getNextBankSetupCode().subscribe({
      next: (code: string) => this.bank.bankCode = code
    });
  }

  loadBank(id: number): void {
    this.api.getBankSetupById(id).subscribe({
      next: (data: any) => this.bank = data,
      error: () => this.toast.error('Failed to load bank.')
    });
  }

  onSave(): void {

    if (this.isViewMode) return;

    if (!this.bank.bankName?.trim()) {
      this.toast.error('Bank Name is required.');
      return;
    }

    if (!this.bank.shortName?.trim()) {
      this.toast.error('Short Name is required.');
      return;
    }

    const request =
      this.mode === 'edit' && this.bankId
        ? this.api.updateBankSetup(this.bankId, this.bank)
        : this.api.createBankSetup(this.bank);

    request.subscribe({
      next: (res: any) => {
        this.toast.success(res?.message || 'Saved successfully.');
        this.router.navigate(['/bank-setup']);
      },
      error: () => this.toast.error('Operation failed.')
    });
  }

  onClear(): void {
    if (this.isViewMode) return;

    this.bank = {
      bankCode: '',
      bankName: '',
      shortName: '',
      routingNumber: '',
      swiftCode: '',
      status: 'Active'
    };

    this.generateCode();
  }

  onBack(): void {
    this.router.navigate(['/bank-setup']);
  }
}