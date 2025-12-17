import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../Services/cart.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../Services/auth.service';

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
  emailDisabled = false;

  submitting = false;

  private ordersUrl = 'https://localhost:7196/api/Orders';

  constructor(private cart: CartService, private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    this.cart.items$.subscribe(items => {
      this.items = items;
      this.total = items.reduce((s, it) => s + (it.cake.price * it.quantity), 0);
    });

    // Prefill email if user is logged in
    this.auth.user$.subscribe(user => {
      if (user && user.email) {
        this.email = user.email;
        this.emailDisabled = true;
      }
    });
  }

  submitOrder() {
    if (!this.firstName || !this.lastName || !this.address || !this.email) {
      alert('Please fill all fields');
      return;
    }

    if (this.items.length === 0) {
      alert('No items in cart');
      return;
    }

    this.submitting = true;

    const payload = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      address: this.address,
      cakes: this.items.map(it => ({ cakeName: it.cake.name, price: it.cake.price }))
    };

    this.http.post(this.ordersUrl, payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        alert('Order confirmed! Thank you for your purchase.');
        this.cart.clear();
        this.close.emit();
      },
      error: (err) => {
        this.submitting = false;
        let msg = 'Failed to place order';
        if (err?.status === 400 && err.error && err.error.errors) {
          const errs = err.error.errors;
          msg = Object.values(errs).flat().join(' ');
        } else if (err?.error && err.error.message) {
          msg = err.error.message;
        } else if (err?.message) {
          msg = err.message;
        }
        alert(msg);
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}