import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../Services/cart.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../Services/auth.service';
import { CelebrationComponent } from '../Celebration/celebration.component';

@Component({
  selector: 'app-order-confirm',
  standalone: true,
  imports: [CommonModule, FormsModule, CelebrationComponent],
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
  showCelebration = false;

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

    console.log('Submitting order:', payload);

    this.http.post(this.ordersUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'text'
    }).subscribe({
      next: (res: any) => {
        this.submitting = false;
        console.log('Order response:', res);
        
        // Show celebration effect
        this.showCelebration = true;
        this.cart.clear();
        
        // Close celebration after 5 seconds
        setTimeout(() => {
          this.showCelebration = false;
          this.close.emit();
        }, 5000);
      },
      error: (err) => {
        this.submitting = false;
        console.error('Order error:', err);
        
        let msg = 'Failed to place order';
        
        // Check for CORS/network errors
        if (err instanceof ProgressEvent || err?.status === 0 || err?.type === 'error') {
          msg = `CORS Error: Cannot connect to ${this.ordersUrl}\n\n` +
                'Possible solutions:\n' +
                '1. Ensure your backend server is running at https://localhost:7196\n' +
                '2. Check that CORS is enabled in your backend\n' +
                '3. Verify your SSL certificate is trusted\n\n' +
                'Backend should allow origin: http://localhost:63945';
        } else if (err?.status === 400 && err.error && err.error.errors) {
          const errs = err.error.errors;
          msg = 'Validation errors:\n' + Object.entries(errs)
            .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
        } else if (err?.error) {
          if (typeof err.error === 'string') {
            msg = err.error;
          } else if (err.error.message) {
            msg = err.error.message;
          } else if (err.error.title) {
            msg = err.error.title;
          }
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

  hideCelebration() {
    this.showCelebration = false;
    this.close.emit();
  }
}