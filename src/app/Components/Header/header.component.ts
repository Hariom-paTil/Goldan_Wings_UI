import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SignupComponent } from '../Signup/signup.component';
import { OrderModalComponent } from '../OrderModal/order-modal.component';
import { CartModalComponent } from '../CartModal/cart-modal.component';
import { OrderConfirmComponent } from '../OrderConfirm/order-confirm.component';
import { AuthService, User } from '../../Services/auth.service';
import { Observable } from 'rxjs';
import { CartService } from '../../Services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, SignupComponent, OrderModalComponent, CartModalComponent, OrderConfirmComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  showSignup = false;
  showMenu = false;
  user$: Observable<User | null>;
  count$: Observable<number>;

  showOrder = false;
  showCart = false;

  showOrderConfirm = false;

  constructor(private auth: AuthService, private cart: CartService) {
    this.user$ = this.auth.user$;
    this.count$ = this.cart.count$;
  }

  openSignup() {
    this.showSignup = true;
  }

  closeSignup() {
    this.showSignup = false;
  }

  openOrder() {
    this.showOrder = true;
  }

  closeOrder() {
    this.showOrder = false;
  }

  openCart() {
    this.showCart = true;
  }

  closeCart() {
    this.showCart = false;
  }

  openOrderConfirm() {
    this.showOrderConfirm = true;
  }

  closeOrderConfirm() {
    this.showOrderConfirm = false;
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    this.showMenu = false;
    this.auth.logout();
  }
}

