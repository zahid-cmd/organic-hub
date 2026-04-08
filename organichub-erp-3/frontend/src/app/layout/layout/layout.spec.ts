import { Component, OnInit } from '@angular/core';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  RouterOutlet
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // ✅ REQUIRED FOR *ngIf

/* LAYOUT COMPONENTS */
import { HeaderComponent } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';
import { FooterComponent } from '../footer/footer';
import { Breadcrumb } from '../breadcrumb/breadcrumb';

/* MUST STAY */
import { PageHeaderComponent } from '../../components/page-header/page-header';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,        // ✅ THIS FIXES NG0303
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    Breadcrumb,
    PageHeaderComponent
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent implements OnInit {

  sidebarCollapsed = false;

  pageTitle = '';
  pageSubtitle = '';
  pageSubHeader = '';

  isDashboard = false;
  isPrintPage = false;
  hidePageHeader = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.loadRouteData());

    this.loadRouteData();
  }

  private loadRouteData(): void {
    let currentRoute = this.route;

    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    const snapshot = currentRoute.snapshot;
    const data = snapshot.data || {};
    const path = snapshot.routeConfig?.path ?? '';

    this.pageTitle = data['pageTitle'] ?? '';
    this.pageSubtitle = data['pageSubtitle'] ?? '';
    this.pageSubHeader = data['pageSubHeader'] ?? '';

    this.hidePageHeader = data['hidePageHeader'] === true;
    this.isDashboard = !path || path === 'dashboard';

    this.isPrintPage =
      path.includes('print') ||
      data['printLayout'] === true;
  }

  onSidebarToggle(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
