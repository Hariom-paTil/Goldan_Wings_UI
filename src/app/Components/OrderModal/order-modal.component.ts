import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CakesService } from '../../Services/cakes.service';
import { Cake } from '../../Interfaces/cake.interface';
import { CartService } from '../../Services/cart.service';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-modal.component.html',
  styleUrls: ['./order-modal.component.scss']
})
export class OrderModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  cakes: Cake[] = [];
  loading = true;
  error: string | null = null;
  fallbackImage = '/assets/Img/img-1.jpg';
  missingImages: Record<number, string> = {};

  constructor(private cakeService: CakesService, private cart: CartService) {}

  ngOnInit(): void {
    this.cakeService.getCakes(20).subscribe({
      next: (data) => {
        this.cakes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = (err && err.message) || 'Failed to load cakes';
        this.loading = false;
      }
    });
  }

  addToCart(cake: Cake) {
    this.cart.add(cake);
  }

  onImgError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      const srcTried = target.src;
      const id = Number(target.getAttribute('data-cake-id'));
      if (!isNaN(id)) {
        this.missingImages[id] = srcTried;
      }
      console.warn('Cake image missing:', srcTried);
      target.src = this.fallbackImage;
      target.onerror = null;
    }
  }

  closeModal() {
    this.close.emit();
  }
}
