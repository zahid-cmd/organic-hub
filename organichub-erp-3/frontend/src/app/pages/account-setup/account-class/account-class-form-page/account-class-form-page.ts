import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

interface AccountClass {
  id: number;
  classCode: string;
  className: string;
  classMode: string;
  status: string;
  remarks: string | null;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

@Component({
  selector: 'app-account-class-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './account-class-form-page.html',
  styleUrls: ['./account-class-form-page.css']
})
export class AccountClassFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  classId: number | null = null;

  accountClass: AccountClass = this.createEmptyModel();
  loading = false;

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
    this.route.queryParams.subscribe(params => {

      this.mode = (params['mode'] || 'add') as any;
      this.isViewMode = this.mode === 'view';
      this.classId = params['id'] ? +params['id'] : null;

      if (this.mode === 'add') {
        this.loadNextCode();
      }

      if (this.classId && this.mode !== 'add') {
        this.loadClass(this.classId);
      }
    });
  }

  // =====================================================
  // LOAD NEXT CODE
  // =====================================================

  private loadNextCode(): void {
    this.apiService.getNextAccountClassCode()
      .subscribe({
        next: (code: string) => {
          this.accountClass.classCode = code;
        },
        error: () => {
          this.toast.error('Failed to generate class code.');
        }
      });
  }

  // =====================================================
  // LOAD EXISTING DATA
  // =====================================================

  private loadClass(id: number): void {
    this.loading = true;

    this.apiService.getAccountClassById(id)
      .subscribe({
        next: (data: any) => {
          this.accountClass = data;
          this.loading = false;
        },
        error: () => {
          this.toast.error('Failed to load account class.');
          this.loading = false;
        }
      });
  }

  // =====================================================
  // SAVE (CREATE / UPDATE)
  // =====================================================

  onSave(): void {

    if (this.isViewMode) return;

    if (!this.accountClass.className?.trim()) {
      this.toast.error('Class Name is required.');
      return;
    }

    if (!this.accountClass.classMode) {
      this.toast.error('Class Mode is required.');
      return;
    }

    const payload = {
      className: this.accountClass.className.trim(),
      classMode: this.accountClass.classMode,
      status: this.accountClass.status,
      remarks: this.accountClass.remarks
    };

    const request = this.mode === 'edit' && this.classId
      ? this.apiService.updateAccountClass(this.classId, payload)
      : this.apiService.createAccountClass(payload);

    request.subscribe({
      next: (res: any) => {

        const message =
          res?.message ||
          (this.mode === 'edit'
            ? 'Account Class updated successfully.'
            : 'Account Class created successfully.');

        this.toast.success(message);
        this.redirect();
      },
      error: (err: any) => {
        const message =
          err?.error?.message ||
          'Operation failed.';
        this.toast.error(message);
      }
    });
  }

  // =====================================================
  // UTIL
  // =====================================================

  onClear(): void {
    if (this.isViewMode) return;
    this.accountClass = this.createEmptyModel();
    this.loadNextCode();
  }

  onBack(): void {
    this.router.navigate(['/account-class']);
  }

  private redirect(): void {
    setTimeout(() => {
      this.router.navigate(['/account-class']);
    }, 1000);
  }

  private createEmptyModel(): AccountClass {
    return {
      id: 0,
      classCode: '',
      className: '',
      classMode: '',
      status: 'Active',
      remarks: null,
      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: ''
    };
  }
}