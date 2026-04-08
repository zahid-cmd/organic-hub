import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule      // ✅ REQUIRED for routerLink
  ],
  templateUrl: './hero-slider.html',
  styleUrls: ['./hero-slider.css']
})
export class HeroSliderComponent implements OnInit, OnDestroy {

  slides = [
    { title: 'Organic Spices', tagline: 'Pure aroma. From source to soul.', image: 'assets/products/organic-spices.png' },
    { title: 'Organic Milk', tagline: 'Fresh from grass-fed farms.', image: 'assets/products/milk.png' },
    { title: 'Organic Oil', tagline: 'Cold-pressed purity.', image: 'assets/products/oil.png' },
    { title: 'Organic Rice', tagline: 'Naturally grown grains.', image: 'assets/products/rice.png' },
    { title: 'Organic Honey', tagline: 'Raw. Natural. Unfiltered.', image: 'assets/products/honey.png' },
    { title: 'Fresh Shrimps', tagline: 'Harvested fresh. Naturally raised.', image: 'assets/products/shrimps.png' }
  ];

  activeIndex = 0;
  progress = 0;
  isResetting = false;

  private timer?: number;
  private startTime = 0;

  private readonly SLIDE_DURATION = 6000;
  private readonly TICK = 50;

  constructor(private cdr: ChangeDetectorRef) {}

  /* =====================================
     INIT
  ===================================== */
  ngOnInit(): void {
    this.startAutoSlide();
  }

  /* =====================================
     CLEANUP
  ===================================== */
  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /* =====================================
     AUTO SLIDER
  ===================================== */
  private startAutoSlide(): void {

    if (this.timer) {
      clearInterval(this.timer);
    }

    this.progress = 0;
    this.startTime = Date.now();

    this.timer = window.setInterval(() => {

      const elapsed = Date.now() - this.startTime;

      this.progress = Math.min(
        (elapsed / this.SLIDE_DURATION) * 100,
        100
      );

      if (elapsed >= this.SLIDE_DURATION) {

        this.activeIndex++;

        // Loop back to first slide
        if (this.activeIndex >= this.slides.length) {

          setTimeout(() => {
            this.isResetting = true;
            this.activeIndex = 0;
            this.cdr.detectChanges();

            setTimeout(() => {
              this.isResetting = false;
            });
          }, 700);
        }

        this.progress = 0;
        this.startTime = Date.now();
      }

      this.cdr.detectChanges();

    }, this.TICK);
  }

  /* =====================================
     NEXT
  ===================================== */
  next(): void {
    this.activeIndex =
      (this.activeIndex + 1) % this.slides.length;

    this.startAutoSlide();
  }

  /* =====================================
     PREVIOUS
  ===================================== */
  prev(): void {
    this.activeIndex =
      (this.activeIndex - 1 + this.slides.length) % this.slides.length;

    this.startAutoSlide();
  }
}
