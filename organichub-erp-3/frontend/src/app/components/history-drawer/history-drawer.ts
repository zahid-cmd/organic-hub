import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-history-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-drawer.html',
  styleUrls: ['./history-drawer.css']
})
export class HistoryDrawerComponent implements OnInit, OnDestroy {

  @Input() title: string = 'History';
  @Input() subtitle: string = '';
  @Input() history: any[] = [];
  @Input() loading: boolean = false;

  @Output() close = new EventEmitter<void>();

  ngOnInit() {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  getPriceDifference(index: number): number {
    if (!this.history || index === this.history.length - 1) return 0;
    return this.history[index].newPrice - this.history[index + 1].newPrice;
  }

  onClose(): void {
    this.close.emit();
  }

}