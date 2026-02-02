import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CartService } from '../../Services/cart.service';
import { CustomCakeService } from '../../Services/custom-cake.service';
import { Cake } from '../../Interfaces/cake.interface';

type SizeOption = { label: string; inc: number };
type FlavorOption = { label: string; inc: number };
type FlowerOption = { label: string; inc: number };

@Component({
  selector: 'app-customize',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.scss']
})
export class CustomizeComponent {
  @Output() close = new EventEmitter<void>();

  cakes: Cake[] = [];
  imageCakes: Cake[] = [];

  sizes: SizeOption[] = [
    { label: '6"', inc: 0 },
    { label: '8"', inc: 5 },
    { label: '10"', inc: 10 },
    { label: '12"', inc: 16 },
  ];

  flavors: FlavorOption[] = [
    { label: 'Vanilla', inc: 0 },
    { label: 'Chocolate', inc: 2 },
    { label: 'Strawberry', inc: 2 },
    { label: 'Butterscotch', inc: 3 },
    { label: 'Black Forest', inc: 3 },
    { label: 'Red Velvet', inc: 4 },
  ];

  flowers: FlowerOption[] = [
    { label: 'None', inc: 0 },
    { label: 'Rose', inc: 3 },
    { label: 'Lily', inc: 4 },
    { label: 'Tulip', inc: 2 },
  ];

  detailOpen = false;
  selectedCake?: Cake;
  selectedSize: SizeOption = this.sizes[0];
  selectedFlavor: FlavorOption = this.flavors[0];
  selectedFlower: FlowerOption = this.flowers[0];
  note = '';
  imageMode = false;
  imagePriceInc = 6;
  customImageUrl = '';
  loadingCustom = true;
  errorCustom: string | null = null;

  constructor(private cart: CartService, private cakesApi: CustomCakeService) { }

  ngOnInit() {
    this.loadingCustom = true;
    this.errorCustom = null;
    this.cakesApi.getSeparatedCakes().subscribe({
      next: (res) => {
        this.cakes = res.normalCakes;
        this.imageCakes = res.imageCakes;
        this.loadingCustom = false;
      },
      error: (err) => {
        this.loadingCustom = false;
        this.errorCustom =
          (err?.message || err?.error?.message || 'Failed to load custom cakes') +
          ' • check server/CORS.';
      },
    });
  }

  openDetail(cake: Cake) {
    this.selectedCake = cake;
    this.selectedSize = this.sizes[0];
    this.selectedFlavor = this.flavors[0];
    this.selectedFlower = this.flowers[0];
    this.note = '';
    this.imageMode = false;
    this.customImageUrl = '';
    this.detailOpen = true;
  }

  openImageDetail(cake?: Cake) {
    this.selectedCake = cake || { id: 999001, name: 'Photo Cake Base', imageUrl: 'assets/Img/img-10.jpg', price: 24 };
    this.selectedSize = this.sizes[0];
    this.selectedFlavor = this.flavors[0];
    this.selectedFlower = this.flowers[0];
    this.note = '';
    this.imageMode = true;
    this.customImageUrl = '';
    this.detailOpen = true;
  }

  closeDetail() {
    this.detailOpen = false;
  }

  get totalPrice(): number {
    if (!this.selectedCake) return 0;
    return (
      this.selectedCake.price +
      (this.selectedSize?.inc ?? 0) +
      (this.selectedFlavor?.inc ?? 0) +
      (this.selectedFlower?.inc ?? 0) +
      (this.imageMode ? this.imagePriceInc : 0)
    );
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.customImageUrl = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsDataURL(file);
  }

  addToCart() {
    if (!this.selectedCake) return;
    const customized: Cake = {
      id: Math.floor(Math.random() * 1000000),
      name: `${this.selectedCake.name} • ${this.selectedSize.label}`,
      flavor: this.selectedFlavor.label,
      imageUrl: this.customImageUrl || this.selectedCake.imageUrl,
      price: this.totalPrice,
    };
    this.cart.add(customized);
    alert('Added customized cake to cart');
    this.detailOpen = false;
  }
}
