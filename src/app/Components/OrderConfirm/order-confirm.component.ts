import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../Services/cart.service';

@Component({
  selector: 'app-order-confirm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-confirm.component.html',
  styleUrls: ['./order-confirm.component.scss']
})
export class OrderConfirmComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  items: CartItem[] = [];
  total = 0;

  // form fields
  firstName = '';
  lastName = '';
  address = '';
  email = '';

  submitting = false;

  constructor(private cart: CartService) {}

  ngOnInit(): void {
    this.cart.items$.subscribe(items => {
      this.items = items;
      this.total = items.reduce((s, it) => s + (it.cake.price * it.quantity), 0);
    });
  }

  submitOrder() {
    if (!this.firstName || !this.lastName || !this.address || !this.email) {
      alert('Please fill all fields');
      return;
    }

    this.submitting = true;
    // Simulate order submission
    setTimeout(() => {
      this.submitting = false;
      alert(`Order confirmed! Total $${this.total.toFixed(2)}. We'll contact ${this.firstName} at ${this.email}.`);
      this.cart.clear();
      this.close.emit();
    }, 700);
  }

  closeModal() {
    this.close.emit();
  }
}