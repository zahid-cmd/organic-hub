import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-area',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-area.html',
  styleUrls: ['./search-area.css']
})
export class SearchArea {

  @Input() searchText: string = '';
  @Input() status: string = '';
  @Input() statusOptions: string[] = [];

  @Output() searchChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string>();

  onSearch(value: string): void {
    this.searchChange.emit(value);
  }

  onStatusChange(value: string): void {
    this.statusChange.emit(value);
  }

  get hasStatusFilter(): boolean {
    return Array.isArray(this.statusOptions) && this.statusOptions.length > 0;
  }
}
