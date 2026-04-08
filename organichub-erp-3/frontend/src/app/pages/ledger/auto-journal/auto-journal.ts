import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auto-journal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auto-journal.html',
  styleUrls: ['./auto-journal.css']
})
export class AutoJournalComponent {

  /* =========================
     REPORT CONTEXT
  ========================== */

  reportType: string = 'AUTO_JOURNAL';
  module: string = '';
  subModule: string = '';

  fromDate: string = '2026-01-01';
  toDate: string   = '2026-01-31';

  backendBaseUrl: string = 'http://localhost:3005';

  /* =========================
     PRINT HANDLER
  ========================== */
  printPage(): void {
    this.openPrintPreview();
  }

  openPrintPreview(): void {

    const printUrl =
      `${this.backendBaseUrl}/reports/auto-journal/journal.html` +
      `?module=${encodeURIComponent(this.module)}` +
      `&subModule=${encodeURIComponent(this.subModule)}` +
      `&from=${this.fromDate}` +
      `&to=${this.toDate}`;

    window.open(printUrl, '_blank');
  }

}