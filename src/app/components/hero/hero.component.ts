import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  submitting = false;
  success = false;
  message = '';
  calendlyLoaded = false;
  constructor(private cd: ChangeDetectorRef) {}

  openCalendly(): void {
    const url = 'https://calendly.com/dr-jesus-meneses/valoracion';
    try {
      window.open(url, '_blank', 'noopener');
    } catch (e) {
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
      }
    }
  }

  ngAfterViewInit(): void {
    // Try several times to detect if the Calendly widget has initialized.
    const setLoaded = () => {
      // update in next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.calendlyLoaded = true;
        try { this.cd.detectChanges(); } catch {}
      }, 0);
    };

    const check = () => {
      const w: any = window as any;
      const widgetEl = document.querySelector('.calendly-inline-widget');
      const iframe = widgetEl ? widgetEl.querySelector('iframe') : null;
      // diagnostic logs to help detect why the widget may not appear
      try {
        // eslint-disable-next-line no-console
        console.debug('[hero] Calendly check', { hasWidget: !!widgetEl, hasIframe: !!iframe, hasCalendly: !!w.Calendly });
      } catch (e) {}
      if (w.Calendly || iframe) {
        setLoaded();
      }
    };

    // check immediately and a few times later in case script is still loading
    setTimeout(check, 0);
    setTimeout(check, 800);
    setTimeout(check, 1600);
  }

  async onSubmit(evt: Event) {
    evt.preventDefault();
    const form = evt.target as HTMLFormElement;
    const fd = new FormData(form);
    const payload: any = {
      name: (fd.get('name') as string) || '',
      telefono: (fd.get('telefono') as string) || '',
      motivo: (fd.get('motivo') as string) || '',
      mensaje: (fd.get('mensaje') as string) || '',
      correo: (fd.get('correo') as string) || '',
    };

    if (!payload.name || !payload.correo || !payload.mensaje) {
      this.message = 'Por favor completa nombre, correo y mensaje.';
      this.success = false;
      return;
    }

    this.submitting = true;
    this.message = '';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        this.success = true;
        this.message = 'Consulta enviada. Gracias — te contactaremos pronto.';
        form.reset();
      } else {
        this.success = false;
        this.message = data?.error || 'Error al enviar la consulta.';
      }
    } catch (err) {
      this.success = false;
      this.message = 'Error de red al enviar la consulta.';
    } finally {
      this.submitting = false;
    }
  }
}