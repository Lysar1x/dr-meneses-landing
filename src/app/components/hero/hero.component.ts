import { Component, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  @ViewChild('imageSlider', { read: ElementRef }) imageSlider?: ElementRef<HTMLDivElement>;

  submitting = false;
  success = false;
  message = '';
  constructor(private cd: ChangeDetectorRef) {}

  openCalendly(): void {
    const url = 'https://calendly.com/jesus-meneses-ortopedista/30min';
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

  scrollSlider(direction: 'left' | 'right'): void {
    const slider = this.imageSlider?.nativeElement;
    if (!slider) {
      return;
    }

    const scrollAmount = slider.clientWidth;
    slider.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  ngAfterViewInit(): void {
    // Component initialization logic if needed
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