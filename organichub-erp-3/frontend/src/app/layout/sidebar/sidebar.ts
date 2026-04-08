import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent implements OnInit, OnChanges {

  @Input() collapsed = false;

  /** Level-1 main menu */
  openMenu: string | null = null;

  /** Level-2 submenu (Reports only) */
  openSubMenu: string | null = null;

  constructor(private router: Router) {}

  /* =========================
     INIT
  ========================== */
  ngOnInit(): void {
    this.syncMenuWithRoute(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.syncMenuWithRoute(event.urlAfterRedirects);
      });
  }

  /* =========================
     ROUTE → SIDEBAR SYNC
  ========================== */
  private syncMenuWithRoute(url: string): void {

    this.openMenu = null;
    this.openSubMenu = null;

    /* =========================
       LEVEL-1 MENUS
    ========================== */
    if (url.startsWith('/dashboard')) {
      this.openMenu = null;
      return;
    }

    if (url.startsWith('/product')) {
      this.openMenu = 'product';
      return;
    }

    if (url.startsWith('/supplier') || url.startsWith('/customer')) {
      this.openMenu = 'client';
      return;
    }

    if (url.startsWith('/purchase')) {
      this.openMenu = 'purchase';
      return;
    }

    if (url.startsWith('/sales')) {
      this.openMenu = 'sales';
      return;
    }

    if (url.startsWith('/store-management')) {
      this.openMenu = 'store';
      return;
    }

    if (url.startsWith('/transaction')) {
      this.openMenu = 'transaction';
      return;
    }

    if (url.startsWith('/general-setup')) {
      this.openMenu = 'general';
      return;
    }

    if (
      url.startsWith('/account-class') ||
      url.startsWith('/account-group') ||
      url.startsWith('/account-subgroup') ||
      url.startsWith('/general-ledger') ||
      url.startsWith('/cash-account') ||
      url.startsWith('/bank-account') ||
      url.startsWith('/pos-account') ||
      url.startsWith('/mfs-account') ||
      url.startsWith('/bank-setup') ||
      url.startsWith('/card-setup') ||
      url.startsWith('/card-charges')
    ) {
      this.openMenu = 'accountSetup';
      return;
    }

    /* =========================
       REPORTS (LEVEL-2)
    ========================== */
    if (url.startsWith('/reports')) {

      this.openMenu = 'reports';

      /* FINANCIAL REPORTS */
      if (
        url.includes('cash-ledger') ||
        url.includes('bank-ledger') ||
        url.includes('mfs-ledger') ||
        url.includes('pos-ledger') ||
        url.includes('general-ledger')
      ) {
        this.openSubMenu = 'financialReports';
        return;
      }

      /* INVENTORY REPORTS */
      if (
        url.includes('product-ledger') ||
        url.includes('inventory-details')
      ) {
        this.openSubMenu = 'inventoryReports';
        return;
      }
    }
  }

  /* =========================
     USER TOGGLES
  ========================== */
  toggleMenu(key: string): void {
    this.openMenu = this.openMenu === key ? null : key;
    this.openSubMenu = null; // reset safely
  }

  toggleSubMenu(key: string): void {
    this.openSubMenu = this.openSubMenu === key ? null : key;
  }

  isOpen(key: string): boolean {
    return this.openMenu === key;
  }

  isSubOpen(key: string): boolean {
    return this.openSubMenu === key;
  }

  /* =========================
     COLLAPSE HANDLING
  ========================== */
  ngOnChanges(): void {
    if (this.collapsed) {
      this.openMenu = null;
      this.openSubMenu = null;
    }
  }
}
