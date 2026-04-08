import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pos-ledger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos-ledger.html',
  styleUrls: ['./pos-ledger.css']
})
export class PosLedgerComponent {

  /* =========================
     LEDGER CONTEXT
  ========================== */

  ledgerType: string = 'POS';
  ledgerName: string = 'POS Ledger';

  fromDate: string = '2026-01-01';
  toDate: string   = '2026-01-31';

  backendBaseUrl: string = 'http://localhost:3005';

  /* =========================
     PRINT
  ========================== */
  printPage(): void {
    this.openPrintPreview();
  }

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
