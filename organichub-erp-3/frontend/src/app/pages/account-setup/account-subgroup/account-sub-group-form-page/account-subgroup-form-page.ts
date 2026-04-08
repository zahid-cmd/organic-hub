import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-account-subgroup-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './account-subgroup-form-page.html',
  styleUrls: ['./account-subgroup-form-page.css']
})
export class AccountSubgroupFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  subGroupId: number | null = null;

  accountGroups: any[] = [];

  subGroup: any = {
    subGroupCode: '',
    subGroupName: '',
    groupId: null,
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
      this.subGroupId = params['id'] ? +params['id'] : null;

      if (this.subGroupId && this.mode !== 'add') {
        this.loadSubGroup(this.subGroupId);
      }
    });
  }

  /* ============================================
     LOAD GROUPS
  ============================================ */
  loadAccountGroups(): void {
    this.apiService.getAccountGroups().subscribe({
      next: data => this.accountGroups = data
    });
  }

  /* ============================================
     GROUP CHANGE → LOAD SUBGROUP CODE
  ============================================ */
  onGroupChange(groupId: number | null): void {

    if (!groupId) {
      this.subGroup.subGroupCode = '';
      return;
    }

    this.apiService
      .getNextAccountSubGroupCode(groupId)
      .subscribe({
        next: (code: string) => {
          this.subGroup.subGroupCode = code;
        },
        error: () => {
          this.toast.error('Failed to generate sub-group code.');
        }
      });
  }

  /* ============================================
     LOAD EXISTING
  ============================================ */
  loadSubGroup(id: number): void {

    this.apiService.getAccountSubGroupById(id).subscribe({
      next: (data: any) => {

        this.subGroup = {
          subGroupCode: data.subGroupCode,
          subGroupName: data.subGroupName,
          groupId: data.groupId,
          status: data.status,
          remarks: data.remarks,
          createdBy: data.createdBy,
          createdDate: data.createdDate,
          updatedBy: data.updatedBy,
          updatedDate: data.updatedDate
        };

      },
      error: () => {
        this.toast.error('Failed to load sub-group.');
      }
    });
  }

  /* ============================================
     SAVE
  ============================================ */
  onSave(): void {

    if (this.isViewMode) return;

    if (!this.subGroup.subGroupName?.trim()) {
      this.toast.error('Sub-Group Name is required.');
      return;
    }

    if (!this.subGroup.groupId) {
      this.toast.error('Account Group is required.');
      return;
    }

    if (!this.subGroup.subGroupCode) {
      this.toast.error('Sub-Group Code not generated.');
      return;
    }

    const payload = {
      subGroupCode: this.subGroup.subGroupCode,   // 🔥 REQUIRED
      subGroupName: this.subGroup.subGroupName,
      groupId: Number(this.subGroup.groupId),     // ensure number
      status: this.subGroup.status,
      remarks: this.subGroup.remarks
    };

    const request =
      this.mode === 'edit' && this.subGroupId
        ? this.apiService.updateAccountSubGroup(this.subGroupId, payload)
        : this.apiService.createAccountSubGroup(payload);

    request.subscribe({
      next: (res: any) => {
        this.toast.success(res?.message || 'Saved successfully.');
        this.router.navigate(['/account-subgroup']);
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Operation failed.');
      }
    });
  }

  /* ============================================
     CLEAR
  ============================================ */
  onClear(): void {

    if (this.isViewMode) return;

    this.subGroup = {
      subGroupCode: '',
      subGroupName: '',
      groupId: null,
      status: 'Active',
      remarks: ''
    };
  }

  onBack(): void {
    this.router.navigate(['/account-subgroup']);
  }
}