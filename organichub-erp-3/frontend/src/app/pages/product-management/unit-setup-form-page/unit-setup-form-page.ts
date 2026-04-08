import {
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { ApiService } from '../../../services/api.service';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';

interface UnitModel {
  id: number;
  unitCode: string;
  unitName: string;
  status: string;
  remarks: string | null;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

@Component({
  selector: 'app-unit-setup-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent,
    OrganicToast
  ],
  templateUrl: './unit-setup-form-page.html',
  styleUrls: ['./unit-setup-form-page.css']
})
export class UnitSetupFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  unitId: number | null = null;
  loading = false;

  unit: UnitModel = this.createEmptyUnit();

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

      this.mode = params['mode'] || 'add';
      this.isViewMode = this.mode === 'view';
      this.unitId = params['id'] ? +params['id'] : null;

      if (this.unitId && this.mode !== 'add') {
        this.loadUnit(this.unitId);
      } else {
        this.unit = this.createEmptyUnit();
      }

    });
  }

  // =====================================================
  // LOAD UNIT
  // =====================================================

  private loadUnit(id: number): void {

    this.loading = true;

    this.apiService.getUnitById(id).subscribe({
      next: (data) => {
        this.unit = { ...data };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load unit.');
      }
    });
  }

  // =====================================================
  // SAVE / UPDATE
  // =====================================================

  onSave(): void {

    if (this.isViewMode) return;

    if (!this.unit.unitCode?.trim() || !this.unit.unitName?.trim()) {
      this.toast.error('Unit Code and Unit Name are required.');
      return;
    }

    const payload = {
      unitCode: this.unit.unitCode.trim(),
      unitName: this.unit.unitName.trim(),
      status: this.unit.status || 'Active',
      remarks: this.unit.remarks?.trim() || null
    };

    if (this.mode === 'edit' && this.unitId) {
      this.updateUnit(payload);
    } else {
      this.createUnit(payload);
    }
  }

  private createUnit(payload: any): void {

    this.apiService.createUnit(payload).subscribe({
      next: () => {
        this.toast.success('Unit created successfully.');
        this.redirectAfterDelay();
      },
      error: () => {
        this.toast.error('Failed to create unit.');
      }
    });
  }

  private updateUnit(payload: any): void {

    if (!this.unitId) return;

    this.apiService.updateUnit(this.unitId, payload).subscribe({
      next: () => {
        this.toast.success('Unit updated successfully.');
        this.redirectAfterDelay();
      },
      error: () => {
        this.toast.error('Failed to update unit.');
      }
    });
  }

  // =====================================================
  // CLEAR
  // =====================================================

  onClear(): void {

    if (this.isViewMode) return;

    this.unit.unitCode = '';
    this.unit.unitName = '';
    this.unit.status = 'Active';
    this.unit.remarks = null;
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  onBack(): void {
    this.router.navigate(['/product/unit-setup']);
  }

  private redirectAfterDelay(): void {
    setTimeout(() => {
      this.router.navigate(['/product/unit-setup']);
    }, 1200);
  }

  // =====================================================
  // EMPTY MODEL
  // =====================================================

  private createEmptyUnit(): UnitModel {
    return {
      id: 0,
      unitCode: '',
      unitName: '',
      status: 'Active',
      remarks: null,
      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: ''
    };
  }

}
