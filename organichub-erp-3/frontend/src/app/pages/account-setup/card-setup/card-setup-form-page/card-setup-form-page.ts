import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-card-setup-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './card-setup-form-page.html',
  styleUrls: ['./card-setup-form-page.css']
})
export class CardSetupFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  cardId: number | null = null;

  card: any = this.getEmptyModel();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      this.mode = params['mode'] || 'add';
      this.isViewMode = this.mode === 'view';
      this.cardId = params['id'] ? +params['id'] : null;

      if (this.mode === 'add') {
        this.generateCode();
      }

      if (this.cardId && this.mode !== 'add') {
        this.loadCard(this.cardId);
      }

    });
  }

  // ================= MODEL =================
  getEmptyModel() {
    return {
      cardCode: '',
      cardName: '',
      issuingBank: '',   // ✅ NEW FIELD
      remarks: '',
      status: 'Active',
      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: ''
    };
  }

  // ================= LOAD CARD =================
  loadCard(id: number) {
    this.api.getCardSetupById(id).subscribe({
      next: data => {
        this.card = {
          ...this.getEmptyModel(),
          ...data
        };
      },
      error: () => this.toast.error('Failed to load card.')
    });
  }

  // ================= CODE GENERATE =================
  generateCode() {
    this.api.getNextCardSetupCode().subscribe({
      next: (code: string) => this.card.cardCode = code,
      error: () => this.toast.error('Failed to generate code.')
    });
  }

  // ================= VALIDATION =================
  validate(): boolean {

    if (!this.card.cardName?.trim()) {
      this.toast.error('Card Name is required.');
      return false;
    }

    if (!this.card.issuingBank?.trim()) {
      this.toast.error('Issuing Bank is required.');
      return false;
    }

    return true;
  }

  // ================= SAVE =================
  onSave() {

    if (this.isViewMode) return;
    if (!this.validate()) return;

    const request =
      this.mode === 'edit' && this.cardId
        ? this.api.updateCardSetup(this.cardId, this.card)
        : this.api.createCardSetup(this.card);

    request.subscribe({
      next: (res: any) => {
        this.toast.success(res?.message || 'Saved successfully.');
        this.router.navigate(['/card-setup']);
      },
      error: () => this.toast.error('Operation failed.')
    });
  }

  // ================= CLEAR =================
  onClear() {
    if (this.isViewMode) return;
    this.card = this.getEmptyModel();
    this.generateCode();
  }

  onBack() {
    this.router.navigate(['/card-setup']);
  }
}