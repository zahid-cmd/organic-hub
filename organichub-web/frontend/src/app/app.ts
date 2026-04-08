import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  NgZone
} from '@angular/core';

import {
  Router,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs';

import { Header } from './layout/header/header';
import { CartDrawer } from './layout/cart-drawer/cart-drawer';
import { FooterComponent } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Header,
    CartDrawer,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements AfterViewInit {

  scrollPercent = 0;

  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLElement>;

  constructor(
    private router: Router,
    private zone: NgZone
  ) {}

  /* ===============================
     AFTER VIEW INIT
  =============================== */

  ngAfterViewInit(): void {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {

        // Force Angular zone stability after navigation
        this.zone.run(() => {

          const nav = this.router.getCurrentNavigation();
          const shouldScroll =
            nav?.extras?.state?.['scrollToCategories'];

          if (shouldScroll && this.scrollContainer) {

            setTimeout(() => {

              const section =
                document.getElementById('categories');

              if (section) {

                const offset =
                  section.offsetTop - 20;

                this.scrollContainer.nativeElement.scrollTo({
                  top: offset,
                  behavior: 'smooth'
                });

              }

            }, 50);

          }

        });

      });

  }

  /* ===============================
     HANDLE SCROLL
  =============================== */

  onScroll(container: HTMLElement): void {

    // Ensure change detection remains active
    this.zone.run(() => {

      const scrollTop = container.scrollTop;
      const maxScroll =
        container.scrollHeight - container.clientHeight;

      this.scrollPercent =
        maxScroll > 0
          ? (scrollTop / maxScroll) * 100
          : 0;

    });

  }

  /* ===============================
     SCROLL TO TOP
  =============================== */

  scrollToTop(): void {

    if (!this.scrollContainer) return;

    this.scrollContainer.nativeElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }

}