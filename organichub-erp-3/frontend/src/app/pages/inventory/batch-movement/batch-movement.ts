import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PageSubHeaderComponent } from '../../../components/page-sub-header/page-sub-header';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../components/organic-toast/toast.service';

@Component({
  selector: 'app-batch-movement',
  standalone: true,
  imports: [CommonModule, PageSubHeaderComponent],
  templateUrl: './batch-movement.html',
  styleUrls: ['./batch-movement.css']
})
export class BatchMovement implements OnInit {

  batchId: number = 0;
  productId: number = 0;

  loading = false;

  // 🔷 Master Info
  master: any = {
    batchNo: '',
    batchDate: '',
    warehouse: '',
    source: '',
    product: '',
    unitCost: 0,
    qtyIn: 0,
    balance: 0
  };

  // 🔷 Ledger Data
  ledger: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      this.batchId = +params['batchId'];
      this.productId = +params['productId'];

      if (!this.batchId || !this.productId) {
        this.toast.error('Invalid batch/product');
        return;
      }

      this.loadMovement();
    });
  }

  // =====================================================
  // ✅ LOAD FROM API
  // =====================================================
  loadMovement(): void {

    this.loading = true;

    this.api.getBatchMovement(this.batchId, this.productId)
      .subscribe({

        next: (res: any) => {

          this.master = res?.master ?? this.master;
          this.ledger = res?.ledger ?? [];

          this.loading = false;
        },

        error: err => {

          console.error(err);
          this.toast.error('Failed to load movement');
          this.loading = false;

        }

      });
  }

  onBack() {
    this.router.navigate(['/store-management/batch-list']);
  }
}