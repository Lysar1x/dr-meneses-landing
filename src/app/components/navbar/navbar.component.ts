import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  activeSection = 'home';

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const sections = ['home', 'formacion-academica', 'services', 'contact'];

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
          }
        });
      },
      {
        // Fire when a section covers at least 30% of the viewport
        threshold: 0.3,
        rootMargin: '-60px 0px 0px 0px' // offset for fixed navbar height
      }
    );

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) this.observer!.observe(el);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  isActive(section: string): boolean {
    return this.activeSection === section;
  }

  openCalendly(evt?: Event): void {
    evt?.preventDefault();
    const url = 'https://calendly.com/jesus-meneses-ortopedista/citas';
    try {
      window.open(url, '_blank', 'noopener');
    } catch (e) {}
    const w: any = window as any;
    if (w.Calendly) {
      try {
        if (typeof w.Calendly.initPopupWidget === 'function') {
          w.Calendly.initPopupWidget({ url });
        } else if (typeof w.Calendly.showPopupWidget === 'function') {
          w.Calendly.showPopupWidget(url);
        }
      } catch (e) {}
    }
  }
}