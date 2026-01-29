import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SignupComponent } from '../Signup/signup.component';
import { OrderModalComponent } from '../OrderModal/order-modal.component';
import { CartModalComponent } from '../CartModal/cart-modal.component';
import { OrderConfirmComponent } from '../OrderConfirm/order-confirm.component';
import { AuthService, User } from '../../Services/auth.service';
import { Observable } from 'rxjs';
import { CartService } from '../../Services/cart.service';
import { CustomizeComponent } from '../Customize/customize.component';
import { AdminSessionService } from '../../Services/admin-session.service';
import { HelpComponent } from '../Help/help.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, SignupComponent, OrderModalComponent, CartModalComponent, OrderConfirmComponent, CustomizeComponent, HelpComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  showSignup = false;
  showMenu = false;
  user$: Observable<User | null>;
  count$: Observable<number>;

  showOrder = false;
  showCart = false;

  showOrderConfirm = false;
  showCustomize = false;
  showHelp = false;

  isAdminLoggedIn = false;

  constructor(private auth: AuthService, private cart: CartService, private adminSession: AdminSessionService, private router: Router) {
    this.user$ = this.auth.user$;
    this.count$ = this.cart.count$;
  }

  ngOnInit() {
    this.isAdminLoggedIn = this.adminSession.hasToken();
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

  openCustomize() {
    this.showCustomize = true;
  }

  closeCustomize() {
    this.showCustomize = false;
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

  openHelp() {
    this.showHelp = true;
  }

  closeHelp() {
    this.showHelp = false;
  }

  logout() {
    this.showMenu = false;
    this.auth.logout();
  }

  adminLogout() {
    this.adminSession.clear();
    this.isAdminLoggedIn = false;
    this.router.navigate(['/about/G_W_AdminPanel']);
  }

  navigateToPopOrders() {
    this.router.navigate(['/about/G_W_AdminPanel/home/pop-orders']);
  }

  navigateToAddCakes() {
    this.router.navigate(['/about/G_W_AdminPanel/home/add-cakes']);
  }
}

