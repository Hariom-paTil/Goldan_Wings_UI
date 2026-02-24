import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../Services/cart.service';
import { CartTreatsComponent } from '../cart-treats/cart-treats.component';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, CartTreatsComponent],
  templateUrl: './cart-modal.component.html',
  styleUrls: ['./cart-modal.component.scss']
})
export class CartModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() checkout = new EventEmitter<void>();

  items: CartItem[] = [];
  cakes: CartItem[] = [];
  treats: CartItem[] = [];
  total = 0;

  constructor(private cart: CartService) { }

  ngOnInit(): void {
    this.cart.items$.subscribe(items => {
      this.items = items;
      this.cakes = items.filter(it => !it.cake.customData?.isAddOn);
      this.treats = items.filter(it => it.cake.customData?.isAddOn);
      this.total = items.reduce((s, it) => s + (it.cake.price * it.quantity), 0);
    });
  }

  inc(item: CartItem) {
    if (item.cake.id != null) this.cart.increaseQuantity(item.cake.id);
  }

  dec(item: CartItem) {
    if (item.cake.id != null) this.cart.decreaseQuantity(item.cake.id);
  }

  remove(item: CartItem) {
    if (item.cake.id != null) this.cart.remove(item.cake.id);
  }

  placeOrder() {
    // Emit checkout event; parent will open the order form modal
    this.checkout.emit();
    this.close.emit();
  }

  closeModal() {
    this.close.emit();
  }
}