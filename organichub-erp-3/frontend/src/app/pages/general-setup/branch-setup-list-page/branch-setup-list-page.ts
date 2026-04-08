import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SearchArea } from '../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { ApiService } from '../../../services/api.service';
import { OrganicToast } from '../../../components/organic-toast/organic-toast';
import { ToastService } from '../../../components/organic-toast/toast.service';

interface Branch {
  id: number;
  branchCode: string;
  branchName: string;
  email: string;
  primaryPhone: string;
  status: string;
}

@Component({
  selector: 'app-branch-setup-list-page',
  standalone: true,
  imports: [
    CommonModule,
    SearchArea,
    PageSubHeaderComponent,
    PaginationComponent, // ✅ Added
    OrganicToast
  ],
  templateUrl: './branch-setup-list-page.html',
  styleUrls: ['./branch-setup-list-page.css']
})
export class BranchSetupListPageComponent implements OnInit {

  branches: Branch[] = [];

  // ==============================
  // PAGINATION STATE
  // ==============================
  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  // =====================================================
  // LOAD DATA
  // =====================================================
  loadBranches(): void {

    this.apiService.getBranches().subscribe({
      next: (data: Branch[]) => {
        this.branches = data ?? [];
        this.currentPage = 1;
      },
      error: () => {
        this.toast.error('Failed to load branches.');
      }
    });

  }

  // =====================================================
  // FILTER
  // =====================================================
  get filteredBranches(): Branch[] {

    const search = this.searchText.trim().toLowerCase();

    return this.branches.filter(b =>
      (
        (b.branchCode ?? '') +
        (b.branchName ?? '') +
        (b.email ?? '') +
        (b.primaryPhone ?? '')
      )
        .toLowerCase()
        .includes(search) &&
      (!this.statusFilter || b.status === this.statusFilter)
    );

  }

  // =====================================================
  // PAGINATION
  // =====================================================
  get totalRecords(): number {
    return this.filteredBranches.length;
  }

  get pagedBranches(): Branch[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredBranches.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  serial(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  // =====================================================
  // SEARCH / FILTER
  // =====================================================
  onSearch(value: string): void {
    this.searchText = value ?? '';
    this.currentPage = 1;
  }

  onStatusChange(value: string): void {
    this.statusFilter = value ?? '';
    this.currentPage = 1;
  }

  onClear(): void {
    this.searchText = '';
    this.statusFilter = '';
    this.currentPage = 1;
  }

  // =====================================================
  // PAGE ACTIONS
  // =====================================================
  onAdd(): void {
    this.router.navigate(['/general-setup/branch-setup/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onBack(): void {
    this.router.navigate(['/general-setup']);
  }

  // =====================================================
  // ROW ACTIONS
  // =====================================================
  onView(branch: Branch): void {
    this.router.navigate(['/general-setup/branch-setup/form'], {
      queryParams: { mode: 'view', id: branch.id }
    });
  }

  onEdit(branch: Branch): void {
    this.router.navigate(['/general-setup/branch-setup/form'], {
      queryParams: { mode: 'edit', id: branch.id }
    });
  }

  // =====================================================
  // DELETE
  // =====================================================
  onDelete(branch: Branch): void {

    this.toast.confirm(
      `Are you sure you want to delete "${branch.branchName}"?`,
      () => this.executeDelete(branch)
    );

  }

  private executeDelete(branch: Branch): void {

    this.apiService.deleteBranch(branch.id).subscribe({

      next: (res: any) => {

        const message =
          res?.message || 'Branch deleted successfully.';

        this.toast.success(message);

        this.branches =
          this.branches.filter(b => b.id !== branch.id);

      },

      error: (err) => {

        const message =
          err?.error?.message ||
          'Cannot delete branch. Related records exist.';

        this.toast.error(message);
      }

    });

  }

}