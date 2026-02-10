import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Components/Header/header.component';
import { FooterComponent } from './Components/Footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  openOrder() {
    console.log('Order clicked');
    // Implement scroll or routing logic here if needed
  }

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    // Restore previous session if present (safe for SSR inside the service)
    this.auth.restore();
  }
}
