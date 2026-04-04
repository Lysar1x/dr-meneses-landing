import { Component, AfterViewInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { Application } from '@splinetool/runtime';

const SPLINE_URL = 'https://prod.spline.design/JJ-Ledh8wuQb6Bk5/scene.splinecode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, HeroComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'dr-meneses-landing';

  private splineApp?: Application;
  private canvas?: HTMLCanvasElement;
  private isLoading = false;
  private splineEnabled = false;

  private contextLostHandler = (e: Event) => {
    e.preventDefault();
    setTimeout(() => this.mountSpline(), 600);
  };

  private visibilityHandler = () => {
    if (document.visibilityState !== 'visible') return;
    if (!this.canvas || !this.splineApp) {
      setTimeout(() => this.mountSpline(), 300);
    }
  };

  ngAfterViewInit(): void {
    this.splineEnabled = this.shouldLoadSpline();
    if (!this.splineEnabled) {
      this.showFallback();
      return;
    }
    setTimeout(() => this.mountSpline(), 0);
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.destroySpline();
  }

  private shouldLoadSpline(): boolean {
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency <= 2;
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    return !isMobile && !isLowEnd && !!gl;
  }

  private async mountSpline(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    const wrapper = document.getElementById('spline-wrapper');
    if (!wrapper) { this.isLoading = false; return; }

    this.destroySpline();

    this.canvas = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(window.innerWidth * dpr);
    this.canvas.height = Math.round(window.innerHeight * dpr);
    this.canvas.style.cssText = 'width:100vw;height:100vh;display:block;';
    this.canvas.addEventListener('webglcontextlost', this.contextLostHandler);
    wrapper.appendChild(this.canvas);

    this.splineApp = new Application(this.canvas);

    const timeoutId = setTimeout(() => {
      this.isLoading = false;
      if (!this.canvas) return;
      this.showFallback();
    }, 12000);

    try {
      await this.splineApp.load(SPLINE_URL);
      clearTimeout(timeoutId);
      this.removeWatermark();
    } catch {
      clearTimeout(timeoutId);
      this.showFallback();
    } finally {
      this.isLoading = false;
    }
  }

  private removeWatermark(): void {
    const nuke = () => {
      Array.from(document.body.children).forEach(child => {
        if (child.tagName !== 'IFRAME') return;
        const iframe = child as HTMLIFrameElement;
        const src = iframe.src || iframe.getAttribute('src') || '';

        const isCalendly = src.includes('calendly.com');
        const isSplineWatermark = !isCalendly;
        if (isSplineWatermark) {
          document.body.removeChild(child);
        }
      });
    };

    nuke();
    const interval = setInterval(nuke, 500);
    setTimeout(() => clearInterval(interval), 20000);
  }

  private destroySpline(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('webglcontextlost', this.contextLostHandler);
      const wrapper = document.getElementById('spline-wrapper');
      if (wrapper?.contains(this.canvas)) wrapper.removeChild(this.canvas);
      this.canvas = undefined;
    }
    this.splineApp = undefined;
  }

  private showFallback(): void {
    const wrapper = document.getElementById('spline-wrapper');
    const fallback = document.getElementById('spline-fallback');
    if (wrapper) wrapper.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
  }
}