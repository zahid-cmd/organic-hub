import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-card-charges-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './card-charges-form-page.html',
  styleUrls: ['./card-charges-form-page.css']
})
export class CardChargesFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  chargeId: number | null = null;

  posLedgers: any[] = [];
  cardSetups: any[] = [];

  charge: any = this.getEmptyModel();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {

    this.loadDropdowns();

    this.route.queryParams.subscribe(params => {

      this.mode = params['mode'] || 'add';
      this.isViewMode = this.mode === 'view';
      this.chargeId = params['id'] ? +params['id'] : null;

      if (this.chargeId && this.mode !== 'add') {
        this.loadCharge(this.chargeId);
      }

    });
  }

  // ================= EMPTY MODEL =================
  getEmptyModel() {
    return {
      posLedgerId: null,
      cardSetupId: null,
      chargePercent: 0,
      remarks: '',
      status: 'Active',
      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: ''
    };
  }

  // ================= DROPDOWNS =================
  loadDropdowns(): void {

    this.api.getPosAccounts().subscribe({
      next: data => this.posLedgers = data ?? []
    });

    this.api.getCardSetups().subscribe({
      next: data => this.cardSetups = data ?? []
    });
  }

  // ================= LOAD BY ID =================
  loadCharge(id: number): void {

    this.api.getCardChargeById(id).subscribe({
      next: (data: any) => {
        this.charge = {
          ...this.getEmptyModel(),
          ...data
        };
      },
      error: () => {
        this.toast.error('Failed to load card charge.');
      }
    });
  }

  // ================= VALIDATION =================
  validate(): boolean {

    if (!this.charge.posLedgerId) {
      this.toast.error('POS Ledger is required.');
      return false;
    }

    if (!this.charge.cardSetupId) {
      this.toast.error('Card Name is required.');
      return false;
    }

    if (this.charge.chargePercent <= 0) {
      this.toast.error('Charge percent must be greater than 0.');
      return false;
    }

    return true;
  }

  // ================= SAVE =================
  onSave(): void {

    if (this.isViewMode) return;
    if (!this.validate()) return;

    const request =
      this.mode === 'edit' && this.chargeId
        ? this.api.updateCardCharge(this.chargeId, this.charge)
        : this.api.createCardCharge(this.charge);

    request.subscribe({
      next: (res: any) => {
        this.toast.success(res?.message || 'Saved successfully.');
        this.router.navigate(['/card-charges']);
      },
      error: () => {
        this.toast.error('Operation failed.');
      }
    });
  }

  // ================= CLEAR =================
  onClear(): void {
    if (this.isViewMode) return;
    this.charge = this.getEmptyModel();
  }

  // ================= BACK =================
  onBack(): void {
    this.router.navigate(['/card-charges']);
  }
}