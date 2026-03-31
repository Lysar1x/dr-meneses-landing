import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  openCalendly(evt?: Event): void {
    evt?.preventDefault();
    const url = 'https://calendly.com/jesus-meneses-ortopedista/citas';
    try {
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      // ignore
    }
    const w: any = window as any;
    if (w.Calendly) {
      try {
        if (typeof w.Calendly.initPopupWidget === 'function') {
          w.Calendly.initPopupWidget({ url });
        } else if (typeof w.Calendly.showPopupWidget === 'function') {
          w.Calendly.showPopupWidget(url);
        }
      } catch (e) {
        // ignore
      }
    }
  }
}