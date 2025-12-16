import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CakeService } from '../../Services/cake.service';
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

  constructor(private cakeService: CakeService, private cart: CartService) {}

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

  closeModal() {
    this.close.emit();
  }
}
