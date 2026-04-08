import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bank-ledger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bank-ledger.html',
  styleUrls: ['./bank-ledger.css']
})
export class BankLedgerComponent {

  /* =========================
     LEDGER CONTEXT (DYNAMIC)
  ========================== */

  ledgerType: string = 'BANK';      // BANK | CASH | MFS | POS | GENERAL
  ledgerName: string = 'Bank Account';

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
