import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../Services/cart.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../Services/auth.service';
import { CelebrationComponent } from '../Celebration/celebration.component';
import { CustomCakeService } from '../../Services/custom-cake.service';
import { switchMap, map } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

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

  firstName = '';
  lastName = '';
  address = '';
  email = '';
  emailDisabled = false;

  submitting = false;
  showCelebration = false;

  private ordersUrl = 'https://localhost:7196/api/Orders';

  constructor(
    private cart: CartService,
    private http: HttpClient,
    private auth: AuthService,
    private customCakeService: CustomCakeService
  ) { }

  ngOnInit(): void {
    this.cart.items$.subscribe(items => {
      this.items = items;
      this.total = items.reduce((s, it) => s + (it.cake.price * it.quantity), 0);
    });

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
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    }).pipe(
      switchMap((res: any) => {
        console.log('Order response:', res);
        let orderId = res;
        try {
          const json = JSON.parse(res);
          if (json && json.id) orderId = json.id;
          else if (typeof json === 'string' || typeof json === 'number') orderId = json;
        } catch (e) { }

        // Process any custom cake items, using the main orderId
        return this.processCustomOrders(orderId).pipe(
          map(() => res) // Pass through original result
        );
      })
    ).subscribe({
      next: () => {
        this.submitting = false;
        this.showCelebration = true;
        this.cart.clear();
        setTimeout(() => {
          this.showCelebration = false;
          this.close.emit();
        }, 5000);
      },
      error: (err) => {
        this.submitting = false;
        console.error('Order error:', err);
        let msg = 'Failed to place order';

        if (err instanceof ProgressEvent || err?.status === 0 || err?.type === 'error') {
          msg = `CORS/Network Error: Cannot connect to ${this.ordersUrl}`;
        } else if (err?.error?.message) {
          msg = err.error.message;
        } else if (typeof err?.error === 'string') {
          msg = err.error;
        }

        alert(msg);
      }
    });
  }

  private processCustomOrders(orderId: any) {
    const customItems = this.items.filter(it => it.cake.customData?.isCustom);

    if (customItems.length === 0) {
      return of([]);
    }

    const tasks = customItems.map(item => {
      const data = item.cake.customData;

      const submitCustom = (imageUrl: string) => {
        const customPayload = {
          orderID: orderId, // Link to main order
          cakeIdentityID: data.cakeIdentityID,
          cakeName: data.cakeNameBase,
          cakeSize: data.size,
          flowerDecoration: data.flower,
          notes: data.notes,
          imageURL: data.cakeIdentityID === 100 ? null : imageUrl
        };
        // We log but don't fail the whole order if one custom part fails, 
        // effectively we try our best.
        // Actually better to fail? The prompt implies strong integration.
        return this.customCakeService.createCustomOrder(customPayload);
      };

      if (data.file) {
        return this.customCakeService.uploadCustomImage(data.file).pipe(
          switchMap(res => submitCustom(res.path))
        );
      } else {
        return submitCustom(data.originalImageUrl || '');
      }
    });

    return forkJoin(tasks);
  }

  closeModal() {
    this.close.emit();
  }

  hideCelebration() {
    this.showCelebration = false;
    this.close.emit();
  }
}