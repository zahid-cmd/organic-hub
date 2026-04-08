import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blank-layout',
  standalone: true,
  imports: [
    CommonModule,   // <-- REQUIRED for *ngIf, *ngFor
    RouterOutlet
  ],
  template: `
    <router-outlet></router-outlet>
  `
})
export class BlankLayoutComponent {}
