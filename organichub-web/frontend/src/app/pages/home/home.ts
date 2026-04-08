import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { HeroSliderComponent } from '../../components/hero-slider/hero-slider';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeroSliderComponent
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {

    const shouldScroll = history.state?.scrollToCategories;

    if (shouldScroll) {

      // Immediately clear state so reload won't repeat it
      history.replaceState({}, document.title);

      setTimeout(() => {

        const section = document.getElementById('categories');

        section?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

      }, 150);

    }

  }

}
