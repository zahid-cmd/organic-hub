import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../../components/organic-toast/toast.service';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-account-group-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './account-group-form-page.html',
  styleUrls: ['./account-group-form-page.css']
})
export class AccountGroupFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  groupId: number | null = null;

  accountClasses: any[] = [];

  accountGroup: any = {
    groupCode: '',
    groupName: '',
    accountClassId: null,
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

    this.loadAccountClasses();

    this.route.queryParams.subscribe(params => {

      this.mode = params['mode'] || 'add';
      this.isViewMode = this.mode === 'view';
      this.groupId = params['id'] ? +params['id'] : null;

      if (this.groupId && this.mode !== 'add') {
        this.loadGroup(this.groupId);
      }
    });
  }

  // =============================================
  // LOAD CLASSES
  // =============================================
  loadAccountClasses(): void {
    this.apiService.getAccountClasses().subscribe({
      next: data => this.accountClasses = data
    });
  }

  // =============================================
  // CLASS CHANGE → LOAD GROUP CODE
  // =============================================
  onClassChange(classId: number | null): void {

    if (!classId) {
      this.accountGroup.groupCode = '';
      return;
    }

    this.apiService
      .getNextAccountGroupCode(classId)
      .subscribe({
        next: (code: string) => {
          this.accountGroup.groupCode = code;
        },
        error: () => {
          this.toast.error('Failed to generate group code.');
        }
      });
  }

  // =============================================
  // LOAD EXISTING GROUP
  // =============================================
  loadGroup(id: number): void {

    this.apiService.getAccountGroupById(id).subscribe({
      next: (data: any) => {

        this.accountGroup = {
          groupCode: data.groupCode,
          groupName: data.groupName,
          accountClassId: data.accountClassId, // IMPORTANT
          status: data.status,
          remarks: data.remarks,
          createdBy: data.createdBy,
          createdDate: data.createdDate,
          updatedBy: data.updatedBy,
          updatedDate: data.updatedDate
        };

      },
      error: () => {
        this.toast.error('Failed to load account group.');
      }
    });
  }

  // =============================================
  // SAVE
  // =============================================
  onSave(): void {

    if (this.isViewMode) return;

    if (!this.accountGroup.groupName?.trim()) {
      this.toast.error('Group Name is required.');
      return;
    }

    if (!this.accountGroup.accountClassId) {
      this.toast.error('Account Class is required.');
      return;
    }

    const payload = {
      groupName: this.accountGroup.groupName,
      accountClassId: this.accountGroup.accountClassId,
      status: this.accountGroup.status,
      remarks: this.accountGroup.remarks
    };

    const request =
      this.mode === 'edit' && this.groupId
        ? this.apiService.updateAccountGroup(this.groupId, payload)
        : this.apiService.createAccountGroup(payload);

    request.subscribe({
      next: (res: any) => {
        this.toast.success(res?.message || 'Saved successfully.');
        this.router.navigate(['/account-group']);
      },
      error: () => {
        this.toast.error('Operation failed.');
      }
    });
  }

  // =============================================
  // CLEAR
  // =============================================
  onClear(): void {
    if (this.isViewMode) return;

    this.accountGroup = {
      groupCode: '',
      groupName: '',
      accountClassId: null,
      status: 'Active',
      remarks: ''
    };
  }

  onBack(): void {
    this.router.navigate(['/account-group']);
  }
}