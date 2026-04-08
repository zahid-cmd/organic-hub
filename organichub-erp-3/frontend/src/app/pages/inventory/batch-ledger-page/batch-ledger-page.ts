import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';

import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';


interface BatchLedgerRow {

  date: string;
  source: string;

  qtyIn: number;
  qtyOut: number;

  balance: number;

  unitCost: number;

}


@Component({
  selector: 'app-batch-ledger-page',
  standalone: true,
  imports: [
    CommonModule,
    PageSubHeaderComponent
  ],
  templateUrl: './batch-ledger-page.html',
  styleUrls: ['./batch-ledger-page.css']
})
export class BatchLedgerPageComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {}

  batchId!: number;

  rows: BatchLedgerRow[] = [];

  loading = false;


  ngOnInit(): void {

    this.batchId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadLedger();

  }


  private loadLedger(): void {

    this.loading = true;

    this.api.getBatchLedger(this.batchId).subscribe({

      next: (data: any[]) => {

        this.rows = (data ?? [])
          .map(x => ({
            date: x.transactionDate,
            source: x.sourceNo,
            qtyIn: x.qtyIn,
            qtyOut: x.qtyOut,
            balance: x.runningBalance,
            unitCost: x.unitCost
          }))
          .sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        this.loading = false;

      },

      error: err => {

        console.error(err);
        this.toast.error('Failed to load batch ledger');

        this.loading = false;

      }

    });

  }


  onBack(): void {

    this.router.navigate(['/store-management/batch-list']);

  }

}