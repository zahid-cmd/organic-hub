import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cash-ledger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cash-ledger.html',
  styleUrls: ['./cash-ledger.css']
})
export class CashLedgerComponent {

  ledgerType: string = 'CASH';
  ledgerName: string = 'Cash In Hand – Sales Center – Mirpur';

  fromDate: string = '2026-01-01';
  toDate: string   = '2026-01-31';

  backendBaseUrl: string = 'http://localhost:3005';

  printPage(): void {
    const printUrl =
      `${this.backendBaseUrl}/reports/cash-ledger/ledger.html` +
      `?ledgerType=${encodeURIComponent(this.ledgerType)}` +
      `&ledgerName=${encodeURIComponent(this.ledgerName)}` +
      `&from=${this.fromDate}` +
      `&to=${this.toDate}`;

    window.open(printUrl, '_blank');
  }
}
