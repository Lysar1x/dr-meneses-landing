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
    const textMessage = `Hola Dr. Meneses, tengo una duda rápida:
*Nombre:* ${name}
*Teléfono:* ${telefono}
*Motivo:* ${motivo}
*Mensaje:* ${mensaje}`;

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