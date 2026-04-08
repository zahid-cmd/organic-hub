import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../components/page-sub-header/page-sub-header';

@Component({
  selector: 'app-standard-form-page',
  standalone: true,
  imports: [
    CommonModule,
    PageSubHeaderComponent
  ],
  templateUrl: './standard-form-page.html',
  styleUrls: ['./standard-form-page.css']
})
export class StandardFormPageComponent implements OnInit {

  /* MODE FLAGS */
  mode: 'view' | 'edit' | 'add' = 'add';
  isViewMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'] || 'add';
      this.isViewMode = this.mode === 'view';
    });
  }

  /* ===============================
     HEADER ACTIONS
  ================================ */

  onClear(): void {
    if (this.isViewMode) return;

    const inputs = document.querySelectorAll<HTMLInputElement>(
      '.form-body input'
    );

    inputs.forEach(input => {
      input.value = '';
    });
  }

  onBack(): void {
    this.router.navigate(['/demo/standard-list']);
  }
}
