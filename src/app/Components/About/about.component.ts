import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TopchoiceComponent } from '../Topchoice/topchoice.component';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TopchoiceComponent, HttpClientModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  isOrderActive = false;
  isAdminModalActive = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.updateRouteState(this.router.url);

    // Track route changes so About can toggle sections and modals
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateRouteState(event.urlAfterRedirects);
      });
  }

  closeAdminModal(): void {
    if (this.isAdminModalActive) {
      this.router.navigate(['/about']);
    }
  }

  private updateRouteState(url: string): void {
    this.isOrderActive = url.includes('/about/order') || url.includes('/about/add-ons');
    this.isAdminModalActive = url.includes('/about/G_W_AdminPanel');
  }
}

