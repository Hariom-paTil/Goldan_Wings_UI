import { Routes } from '@angular/router';
import { AboutComponent } from './Components/About/about.component';
import { OrderComponent } from './Components/Order/order.component';

export const routes: Routes = [
  {
    path: 'about',
    component: AboutComponent,
    children: [{ path: 'order', component: OrderComponent }],
  },
  { path: '', redirectTo: 'about', pathMatch: 'full' },
];
