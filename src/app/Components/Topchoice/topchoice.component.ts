import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CakesService } from '../../Services/cakes.service';
import { Cake } from '../../Interfaces/cake.interface';
import { CartService } from '../../Services/cart.service';

@Component({
  selector: 'app-top-choice',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './topchoice.component.html',
  styleUrls: ['./topchoice.component.scss'],
})
export class TopchoiceComponent implements OnInit {
  cakes: Cake[] = [];
  fallbackImage = '/assets/Img/img-1.jpg';
  missingImages: Record<number, string> = {};

  constructor(private cakeService: CakesService, public cart: CartService) {}

  ngOnInit(): void {
    this.cakeService.getCakes(10).subscribe((data) => {
      this.cakes = data;
    });
  }

  onImgError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      const srcTried = target.src;
      const id = Number(target.getAttribute('data-cake-id'));
      if (!isNaN(id)) {
        this.missingImages[id] = srcTried;
      }
      console.warn('Cake image missing:', srcTried);
      target.src = this.fallbackImage;
      target.onerror = null;
    }
  }
}
