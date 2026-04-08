import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mfs-ledger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mfs-ledger.html',
  styleUrls: ['./mfs-ledger.css']
})
export class MfsLedgerComponent {

  /* =========================
     LEDGER CONTEXT (DYNAMIC)
  ========================== */

  ledgerType: string = 'MFS';        // ✅ changed
  ledgerName: string = 'MFS Account';

  fromDate: string = '2026-01-01';
  toDate: string   = '2026-01-31';

  backendBaseUrl: string = 'http://localhost:3005';

  /* =========================
     PRINT ICON HANDLER
  ========================== */
  printPage(): void {
    this.openPrintPreview();
  }

  /* =========================
     OPEN BACKEND PRINT PAGE
  ========================== */
  openPrintPreview(): void {

    const printUrl =
      `${this.backendBaseUrl}/reports/general-ledger/ledger.html` +
      `?ledgerType=${encodeURIComponent(this.ledgerType)}` +
      `&ledgerName=${encodeURIComponent(this.ledgerName)}` +
      `&from=${this.fromDate}` +
      `&to=${this.toDate}`;

    window.open(printUrl, '_blank');
  }

}
