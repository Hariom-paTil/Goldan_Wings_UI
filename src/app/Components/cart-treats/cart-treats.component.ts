import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem, CartService } from '../../Services/cart.service';

@Component({
  selector: 'app-cart-treats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-treats.component.html',
  styleUrl: './cart-treats.component.scss'
})
export class CartTreatsComponent {
  @Input() treats: CartItem[] = [];

  constructor(private cart: CartService) { }

  inc(item: CartItem) {
    if (item.cake.id != null) this.cart.increaseQuantity(item.cake.id);
  }

  dec(item: CartItem) {
    if (item.cake.id != null) this.cart.decreaseQuantity(item.cake.id);
  }

  remove(item: CartItem) {
    if (item.cake.id != null) this.cart.remove(item.cake.id);
  }
}
