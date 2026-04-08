import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [
    NgIf,
    NgFor
  ],
  templateUrl: './breadcrumb.html',
  styleUrls: ['./breadcrumb.css']
})
export class Breadcrumb {

  items: BreadcrumbItem[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.build());
  }

  private build(): void {
    let current = this.route;
    while (current.firstChild) {
      current = current.firstChild;
    }

    const bc = current.snapshot.data['breadcrumb'];

    // RESET
    this.items = [];

    // ✅ SAFE DEFAULT
    // Always start with Home
    this.items.push({ label: 'Home' });

    // ✅ STRING breadcrumb (old pages)
    if (typeof bc === 'string' && bc) {
      this.items.push({ label: bc });
      return;
    }

    // ✅ ARRAY breadcrumb (future-ready)
    if (Array.isArray(bc)) {
      bc.forEach((b: any) => {
        if (b?.label) {
          this.items.push({ label: b.label });
        }
      });
    }
  }
}
