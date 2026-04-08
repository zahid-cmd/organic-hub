import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-sub-header',
  standalone: true,
  imports: [CommonModule],   // ✅ Required for structural directives
  templateUrl: './page-sub-header.html',
  styleUrls: ['./page-sub-header.css'],
  encapsulation: ViewEncapsulation.None
})
export class PageSubHeaderComponent {
  @Input() title!: string;
}
