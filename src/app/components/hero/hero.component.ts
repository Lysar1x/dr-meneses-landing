import { Component, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import * as THREE from 'three';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  @ViewChild('imageSlider', { read: ElementRef }) imageSlider?: ElementRef<HTMLDivElement>;

  submitting = false;
  success = false;
  message = '';

  // Three.js properties
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private spheres: THREE.Mesh[] = [];
  private animationId?: number;

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
    this.initThreeJs();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  private initThreeJs(): void {
    const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create floating spheres
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0x003b72, transparent: true, opacity: 0.1 }),
      new THREE.MeshPhongMaterial({ color: 0x00529b, transparent: true, opacity: 0.15 }),
      new THREE.MeshPhongMaterial({ color: 0xd6e2ff, transparent: true, opacity: 0.2 }),
    ];

    for (let i = 0; i < 15; i++) {
      const material = materials[Math.floor(Math.random() * materials.length)];
      const sphere = new THREE.Mesh(sphereGeometry, material);
      
      const scale = Math.random() * 2 + 0.5;
      sphere.scale.set(scale, scale, scale);
      
      sphere.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20 - 10
      );
      
      // Add custom property for movement
      (sphere as any).velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.01
      );

      this.spheres.push(sphere);
      this.scene.add(sphere);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);

    this.camera.position.z = 15;

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);

      this.spheres.forEach(sphere => {
        sphere.position.add((sphere as any).velocity);
        
        // Bounce within bounds
        if (Math.abs(sphere.position.x) > 25) (sphere as any).velocity.x *= -1;
        if (Math.abs(sphere.position.y) > 20) (sphere as any).velocity.y *= -1;
        
        sphere.rotation.x += 0.002;
        sphere.rotation.y += 0.002;
      });

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    animate();
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