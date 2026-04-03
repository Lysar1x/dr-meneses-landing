import { Component, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, HeroComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'dr-meneses-landing';

  ngAfterViewInit(): void {
    this.initSplineWithFallback();
  }

  private initSplineWithFallback(): void {
    const wrapper  = document.getElementById('spline-wrapper');
    const fallback = document.getElementById('spline-fallback');
    if (!wrapper || !fallback) return;

    const isMobile   = window.innerWidth < 768;
    const isLowEnd   = navigator.hardwareConcurrency <= 2;
    const testCanvas = document.createElement('canvas');
    const gl         = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    const noWebGL    = !gl;

    if (isMobile || isLowEnd || noWebGL) {
      wrapper.style.display  = 'none';
      fallback.style.display = 'block';
      return;
    }

    wrapper.style.display = 'block';
    const timeoutId = setTimeout(() => {
      wrapper.style.display  = 'none';
      fallback.style.display = 'block';
    }, 8000);

    const viewer = wrapper.querySelector('spline-viewer');
    if (viewer) {
      viewer.addEventListener('load', () => clearTimeout(timeoutId), { once: true });
    }
  }
}