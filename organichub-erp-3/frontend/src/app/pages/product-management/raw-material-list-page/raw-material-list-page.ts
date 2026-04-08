import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PaginationComponent } from '../../../components/pagination/pagination';
import { SearchArea } from '../../../components/search-area/search-area';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';

@Component({
  selector: 'app-raw-material-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    SearchArea,
    PageSubHeaderComponent
  ],
  templateUrl: './raw-material-list-page.html',
  styleUrls: ['./raw-material-list-page.css']
})
export class RawMaterialListPageComponent {

  rawMaterials = Array.from({ length: 40 }, (_, i) => ({
    materialCode: `RM-${1001 + i}`,
    materialName: `Raw Material ${i + 1}`,
    baseUnit: 'Gram',
    status: i % 2 === 0 ? 'Active' : 'Inactive'
  }));

  pageSize = 10;
  currentPage = 1;

  searchText = '';
  statusFilter = '';
  statusOptions = ['Active', 'Inactive'];

  constructor(private router: Router) {}

  get filteredRows() {
    return this.rawMaterials.filter(r =>
      (r.materialCode + r.materialName)
        .toLowerCase()
        .includes(this.searchText) &&
      (!this.statusFilter || r.status === this.statusFilter)
    );
  }

  get totalRecords() {
    return this.filteredRows.length;
  }

  get pagedRows() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  serial(i: number) {
    return (this.currentPage - 1) * this.pageSize + i + 1;
  }

  onSearch(value: string) {
    this.searchText = value.toLowerCase();
    this.currentPage = 1;
  }

  onStatusChange(value: string) {
    this.statusFilter = value;
    this.currentPage = 1;
  }

  onClear() {
    this.searchText = '';
    this.statusFilter = '';
    this.currentPage = 1;
  }

  onAdd() {
    this.router.navigate(['/product/raw-material/form'], {
      queryParams: { mode: 'add' }
    });
  }

  onView(i: number) {
    this.router.navigate(['/product/raw-material/form'], {
      queryParams: { mode: 'view', index: i }
    });
  }

  onEdit(i: number) {
    this.router.navigate(['/product/raw-material/form'], {
      queryParams: { mode: 'edit', index: i }
    });
  }

  onDelete(i: number) {
    console.log('Delete Raw Material', this.pagedRows[i]);
  }

  onBack() {
    this.router.navigate(['/dashboard']);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }
}
