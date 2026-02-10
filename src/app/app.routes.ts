import { Routes } from '@angular/router';
import { AboutComponent } from './Components/About/about.component';
import { OrderComponent } from './Components/Order/order.component';
import { AdminLoginComponent } from './Components/AdminLogin/admin-login.component';
import { AdminHomeComponent } from './Components/AdminHome/admin-home.component';
import { adminAuthGuard } from './Guards/admin-auth.guard';
import { AddOnTreatsComponent } from './Components/AddOnTreats/add-on-treats.component';

export const routes: Routes = [
  {
    path: 'about',
    component: AboutComponent,
    children: [
      { path: 'order', component: OrderComponent },
      { path: 'add-ons', component: AddOnTreatsComponent },
      { path: 'G_W_AdminPanel', component: AdminLoginComponent },
      {
        path: 'G_W_AdminPanel/home',
        component: AdminHomeComponent,
        canActivate: [adminAuthGuard],
        data: { admin: true }
      }
    ],
  },
  { path: '', redirectTo: 'about', pathMatch: 'full' },
];
