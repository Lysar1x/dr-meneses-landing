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

  // Only fires when the GPU truly loses the WebGL context (rare).
  // A simple tab switch does NOT trigger this — Spline resumes its rAF loop
  // automatically when the tab becomes visible again.
  private contextLostHandler = (e: Event) => {
    e.preventDefault();
    setTimeout(() => this.mountSpline(), 600);
  };

  // On tab return: only reload if the canvas/app no longer exists.
  // Otherwise Spline resumes on its own — don't interfere.
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
    // Defer until after Angular renders the rest of the page (critical for FCP)
    setTimeout(() => this.mountSpline(), 0);
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.destroySpline();
  }

  /** Detects if this device can handle Spline without lagging */
  private shouldLoadSpline(): boolean {
    const isMobile   = window.innerWidth < 768;
    const isLowEnd   = navigator.hardwareConcurrency <= 2;
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    return !isMobile && !isLowEnd && !!gl;
  }

  /**
   * Creates a canvas + Application and loads the scene.
   * Called once on init, and only again if the WebGL context is lost.
   */
  private async mountSpline(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    const wrapper = document.getElementById('spline-wrapper');
    if (!wrapper) { this.isLoading = false; return; }

    // Clean up previous instance if any
    this.destroySpline();

    // Fresh canvas — cap pixel ratio to 1.5 to reduce GPU load on HiDPI screens
    this.canvas = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width  = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.cssText = `width:100vw;height:100vh;display:block;`;
    this.canvas.addEventListener('webglcontextlost', this.contextLostHandler);
    wrapper.appendChild(this.canvas);

    this.splineApp = new Application(this.canvas);

    // Failsafe: show fallback if scene takes > 12s
    const timeoutId = setTimeout(() => {
      this.isLoading = false;
      if (!this.canvas) return; // already loaded
      this.showFallback();
    }, 12000);

    try {
      await this.splineApp.load(SPLINE_URL);
      clearTimeout(timeoutId);
    } catch {
      clearTimeout(timeoutId);
      this.showFallback();
    } finally {
      this.isLoading = false;
    }
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
    const wrapper  = document.getElementById('spline-wrapper');
    const fallback = document.getElementById('spline-fallback');
    if (wrapper)  wrapper.style.display  = 'none';
    if (fallback) fallback.style.display = 'block';
  }
}