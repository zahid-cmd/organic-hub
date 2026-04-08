import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';


@Component({
  selector: 'app-raw-material-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent
  ],
  templateUrl: './raw-material-form-page.html',
  styleUrls: ['./raw-material-form-page.css']
})
export class RawMaterialFormPageComponent implements OnInit {

  mode: 'add' | 'edit' | 'view' = 'add';
  isViewMode = false;
  recordIndex: number | null = null;

  raw = {
    materialCode: '',
    materialName: '',
    baseUnit: 'Gram',
    status: 'Active',
    remarks: '',
    createdBy: '',
    createdDate: '',
    updatedBy: '',
    updatedDate: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'] || 'add';
      this.isViewMode = this.mode === 'view';
      this.recordIndex =
        params['index'] !== undefined ? Number(params['index']) : null;

      if (this.mode !== 'add') {
        this.raw = {
          materialCode: 'RM-1001',
          materialName: 'Sample Raw Material',
          baseUnit: 'Gram',
          status: 'Active',
          remarks: 'Loaded record',
          createdBy: 'System',
          createdDate: '2024-01-01',
          updatedBy: 'Admin',
          updatedDate: '2024-06-01'
        };
      }
    });
  }

  onClear(): void {
    if (this.isViewMode) return;

    this.raw = {
      materialCode: '',
      materialName: '',
      baseUnit: 'Gram',
      status: 'Active',
      remarks: '',
      createdBy: '',
      createdDate: '',
      updatedBy: '',
      updatedDate: ''
    };
  }

  onSave(): void {
    if (this.isViewMode) return;
    console.log('Saved Raw Material:', this.raw);
    this.router.navigate(['/product/raw-material']);
  }

  onBack(): void {
    this.router.navigate(['/product/raw-material']);
  }
}
