import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';
import { ApiService } from '../../../services/api.service';

interface Customer {
  id: number;
  customerCode: string;
  customerName: string;

  accountSubGroupName: string | null;
  subGroupCode: string | null;

  primaryPhone: string | null;
  secondaryPhone: string | null;

  email: string | null;
  address: string | null;
  remarks: string | null;

  status: string;

  createdBy: string;
  createdDate: string;
  updatedBy: string | null;
  updatedDate: string | null;
}

@Component({
  selector: 'app-customer-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PageSubHeaderComponent, OrganicToast],
  templateUrl: './customer-form-page.html',
  styleUrls: ['./customer-form-page.css']
})
export class CustomerFormPageComponent implements OnInit {

  // =====================================================
  // STATE
  // =====================================================

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  customerId: number | null = null;

  loading = false;

  customer: Customer = this.createEmptyCustomer();

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

    this.route.queryParams.subscribe(params => {

      this.mode = (params['mode'] as any) || 'add';
      this.isViewMode = this.mode === 'view';
      this.customerId = params['id'] ? +params['id'] : null;

      if (this.customerId && this.mode !== 'add') {
        this.loadCustomer(this.customerId);
      } else {
        this.initializeAddMode();
      }

    });
  }

  // =====================================================
  // ADD MODE INITIALIZATION
  // =====================================================

  private initializeAddMode(): void {

    this.customer = this.createEmptyCustomer();

    this.loading = true;

    this.loadFixedSubGroup();
    this.loadNextCode();

    this.loading = false;
  }

  // =====================================================
  // LOAD METHODS
  // =====================================================

  private loadFixedSubGroup(): void {

    this.apiService.getFixedCustomerSubGroup().subscribe({
      next: (data: any) => {
        this.customer.accountSubGroupName = data?.accountSubGroupName ?? '';
        this.customer.subGroupCode = data?.subGroupCode ?? '';
      },
      error: () => {
        this.toast.error('Failed to load fixed subgroup.');
      }
    });
  }

  private loadNextCode(): void {

    this.apiService.getNextCustomerCode().subscribe({
      next: (code: string) => {
        this.customer.customerCode = code ?? '';
      },
      error: () => {
        this.toast.error('Failed to generate customer code.');
      }
    });
  }

  private loadCustomer(id: number): void {

    this.loading = true;

    this.apiService.getCustomerById(id).subscribe({
      next: (data: any) => {

        this.customer = {
          ...this.createEmptyCustomer(),
          ...data
        };

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load customer.');
      }
    });
  }

  // =====================================================
  // GETTERS
  // =====================================================

  get saveButtonLabel(): string {
    return this.mode === 'edit' ? 'Update' : 'Save';
  }

  get customerDisplayName(): string {

    const name = this.customer.customerName?.trim() || '';
    const phone = this.customer.primaryPhone?.trim() || '';

    if (!name && !phone) return '';
    if (name && phone) return `${name} - ${phone}`;

    return name || phone;
  }

  // =====================================================
  // SAVE
  // =====================================================

  onSave(): void {

    if (this.isViewMode) return;

    if (!this.customer.customerName?.trim()) {
      this.toast.error('Customer Name is required.');
      return;
    }

    const payload = {
      customerName: this.customer.customerName.trim(),
      primaryPhone: this.customer.primaryPhone?.trim() || null,
      secondaryPhone: this.customer.secondaryPhone?.trim() || null,
      email: this.customer.email?.trim() || null,
      address: this.customer.address?.trim() || null,
      remarks: this.customer.remarks?.trim() || null,
      status: this.customer.status || 'Active'
    };

    this.loading = true;

    if (this.mode === 'edit' && this.customerId) {

      this.apiService.updateCustomer(this.customerId, payload).subscribe({
        next: () => {
          this.loading = false;
          this.toast.success('Customer updated successfully.');
          this.router.navigate(['/customer']);
        },
        error: (err) => {
          this.loading = false;
          this.toast.error(err?.error?.message || 'Update failed.');
        }
      });

    } else {

      this.apiService.createCustomer(payload).subscribe({
        next: () => {
          this.loading = false;
          this.toast.success('Customer created successfully.');
          this.router.navigate(['/customer']);
        },
        error: (err) => {
          this.loading = false;
          this.toast.error(err?.error?.message || 'Creation failed.');
        }
      });

    }
  }

  // =====================================================
  // CLEAR
  // =====================================================

  onClear(): void {

    if (this.isViewMode) return;

    if (this.mode === 'edit' && this.customerId) {
      this.loadCustomer(this.customerId);
    } else {
      this.initializeAddMode();
    }
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  onBack(): void {
    this.router.navigate(['/customer']);
  }

  // =====================================================
  // EMPTY MODEL
  // =====================================================

  private createEmptyCustomer(): Customer {
    return {
      id: 0,
      customerCode: '',
      customerName: '',
      accountSubGroupName: null,
      subGroupCode: null,
      primaryPhone: null,
      secondaryPhone: null,
      email: null,
      address: null,
      remarks: null,
      status: 'Active',
      createdBy: '',
      createdDate: '',
      updatedBy: null,
      updatedDate: null
    };
  }
}