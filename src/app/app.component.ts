import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './Components/Header/header.component';
import { FooterComponent } from './Components/Footer/footer.component';
import { AuthService } from './Services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Goldan_Wings';
  showHero = true;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    // Restore previous session if present (safe for SSR inside the service)
    this.auth.restore();

    // Initial check
    this.checkHeroVisibility(this.router.url);

    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkHeroVisibility(event.urlAfterRedirects);
    });
  }

  private checkHeroVisibility(url: string) {
    // Show hero only on exact root or /about path, specific exclusions can be added
    // If url is '/about', show hero. If '/about/add-ons', hide hero.
    // Handling simple logic:
    const path = url.split('?')[0]; // ignore params
    this.showHero = path === '/' || path === '/about';
  }

  openOrder() {
    console.log('Order clicked');
    // Implement scroll or routing logic here if needed
  }
}
