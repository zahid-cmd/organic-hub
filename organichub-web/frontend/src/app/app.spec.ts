import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './layout/header/header';
import { CartDrawerComponent } from './layout/cart-drawer/cart-drawer';
import { FooterComponent } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    CartDrawerComponent,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {

  scrollPercent = 0;

  ngOnInit(): void {
    window.addEventListener('scroll', this.updateScroll, true);
  }

  updateScroll = (): void => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    this.scrollPercent = docHeight > 0
      ? (scrollTop / docHeight) * 100
      : 0;
  };
}
