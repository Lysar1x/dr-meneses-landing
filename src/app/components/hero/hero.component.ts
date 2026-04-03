import { Component, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements AfterViewInit {
  @ViewChild('imageSlider', { read: ElementRef }) imageSlider?: ElementRef<HTMLDivElement>;

  submitting = false;
  success = false;
  message = '';

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.initSplineWithFallback();
  }

  /**
   * Loads Spline only on capable desktop devices.
   * Shows a CSS gradient fallback on:
   *  - Mobile / small screens (< 768px)
   *  - Low-end devices (≤ 2 CPU cores)
   *  - Devices with no WebGL support
   *  - If Spline hasn't loaded after 8 seconds
   */
  private initSplineWithFallback(): void {
    const wrapper  = document.getElementById('spline-wrapper');
    const fallback = document.getElementById('spline-fallback');
    if (!wrapper || !fallback) return;

    const isMobile  = window.innerWidth < 768;
    const isLowEnd  = navigator.hardwareConcurrency <= 2;
    const testCanvas = document.createElement('canvas');
    const gl         = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    const noWebGL    = !gl;

    if (isMobile || isLowEnd || noWebGL) {
      // Skip Spline entirely — save battery and avoid lag
      wrapper.style.display  = 'none';
      fallback.style.display = 'block';
      return;
    }

    // Desktop capable device: show Spline, add timeout safety net
    wrapper.style.display = 'block';
    const timeoutId = setTimeout(() => {
      // Spline didn't render in 8s — switch to fallback
      wrapper.style.display  = 'none';
      fallback.style.display = 'block';
    }, 8000);

    // If spline-viewer loads successfully, cancel the timeout
    const viewer = wrapper.querySelector('spline-viewer');
    if (viewer) {
      viewer.addEventListener('load', () => clearTimeout(timeoutId), { once: true });
    }
  }

  openCalendly(): void {
    const url = 'https://calendly.com/jesus-meneses-ortopedista/citas';
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

  onSubmit(evt: Event) {
    evt.preventDefault();
    const form = evt.target as HTMLFormElement;
    const fd = new FormData(form);

    const name = (fd.get('name') as string) || '';
    const telefono = (fd.get('telefono') as string) || '';
    const motivo = (fd.get('motivo') as string) || '';
    const mensaje = (fd.get('mensaje') as string) || '';

    if (!name || !telefono || !mensaje) {
      this.message = 'Por favor completa todos los campos obligatorios.';
      this.success = false;
      return;
    }

    this.submitting = true;
    this.message = 'Redirigiendo a WhatsApp...';

    // WhatsApp Number (from footer)
    const phoneNumber = '522462443810';

    // Structured Message
    const textMessage = `Hola Dr. Meneses, tengo una duda rápida:\n*Nombre:* ${name}\n*Teléfono:* ${telefono}\n*Motivo:* ${motivo}\n*Mensaje:* ${mensaje}`;

    const encodedMessage = encodeURIComponent(textMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    try {
      window.open(whatsappUrl, '_blank', 'noopener');
      this.success = true;
      this.message = 'Se ha abierto WhatsApp para enviar tu duda.';
      form.reset();
    } catch (err) {
      this.success = false;
      this.message = 'No se pudo abrir WhatsApp automáticamente. Intenta de nuevo.';
    } finally {
      this.submitting = false;
    }
  }
}