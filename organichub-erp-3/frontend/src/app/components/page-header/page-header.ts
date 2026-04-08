import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  templateUrl: './page-header.html',
  styleUrls: ['./page-header.css']
})
export class PageHeaderComponent {

  @Input() title = '';
  @Input() subtitle = '';

  /** Controls Add / Clear / Back buttons */
  @Input() showActions = true;

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
