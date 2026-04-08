import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  summary: any = null;
  loading = true;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef   // ✅ add this
  ) {}

  ngOnInit(): void {
    this.loadDashboardSummary();
  }

  private loadDashboardSummary(): void {

    this.apiService.getDashboardSummary().subscribe({
      next: (data) => {
        console.log('Dashboard summary received:', data);

        this.summary = data;
        this.loading = false;

        this.cdr.detectChanges();   // ✅ FORCE UI UPDATE
      },
      error: (err) => {
        console.error('Dashboard API error:', err);

        this.error = 'Failed to load dashboard data';
        this.loading = false;

        this.cdr.detectChanges();   // ✅ FORCE UI UPDATE
      }
    });
  }
}
