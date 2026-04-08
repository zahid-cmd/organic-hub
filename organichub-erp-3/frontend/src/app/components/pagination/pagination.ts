import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css']
})
export class PaginationComponent {

  /* ===============================
     INPUTS (FROM PAGE)
  ================================ */
  @Input() totalRecords = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;

  /* ===============================
     OUTPUTS (TO PAGE)
  ================================ */
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  /* ===============================
     DERIVED VALUES
  ================================ */

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
  }

  get startRecord(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  /**
   * ✅ MAX 3 PAGE BUTTONS ONLY (SLIDING WINDOW)
   * 1 2 3
   * 2 3 4
   * 8 9 10
   */
  get pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 3) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current === 1) {
      return [1, 2, 3];
    }

    if (current === total) {
      return [total - 2, total - 1, total];
    }

    return [current - 1, current, current + 1];
  }

  /* ===============================
     EVENTS
  ================================ */

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  changePageSize(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(value);
    this.pageChange.emit(1); // reset to page 1
  }
}
