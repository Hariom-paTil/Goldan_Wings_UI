import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../Services/cart.service';
import { CustomCakeService } from '../../Services/custom-cake.service';
import { Cake } from '../../Interfaces/cake.interface';
import { AuthService } from '../../Services/auth.service';

type SizeOption = { label: string; inc: number };
type FlavorOption = { label: string; inc: number };
type FlowerOption = { label: string; inc: number };

@Component({
  selector: 'app-customize',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // Direct Order Form Fields
  showOrderForm = false;
  fullName = '';
  email = '';
  address = '';
  emailDisabled = false;

  // Dependencies
  constructor(
    private cart: CartService,
    private cakesApi: CustomCakeService,
    private http: HttpClient,
    private auth: AuthService
  ) { }

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

    // Auto-fill email if logged in
    this.auth.user$.subscribe(user => {
      if (user && user.email) {
        this.email = user.email;
        this.emailDisabled = true;
      }
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
    this.selectedFile = null; // Reset file
    this.detailOpen = true;
    this.showOrderForm = false;
  }

  openImageDetail(cake?: Cake) {
    this.selectedCake = cake || { id: 999001, name: 'Photo Cake Base', imageUrl: 'assets/Img/img-10.jpg', price: 24 };
    this.selectedSize = this.sizes[0];
    this.selectedFlavor = this.flavors[0];
    this.selectedFlower = this.flowers[0];
    this.note = '';
    this.imageMode = true;
    this.customImageUrl = '';
    this.selectedFile = null; // Reset file
    this.detailOpen = true;
    this.showOrderForm = false;
  }

  closeDetail() {
    this.detailOpen = false;
    this.showOrderForm = false;
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

  selectedFile: File | null = null;
  isSubmitting = false;

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.customImageUrl = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsDataURL(file);
  }

  // NOTE: addToCart removed as per requirement

  showDirectOrderForm() {
    if (!this.selectedCake) return;
    this.showOrderForm = true;
  }

  cancelOrderForm() {
    this.showOrderForm = false;
  }

  submitDirectOrder() {
    if (!this.fullName || !this.email || !this.address) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!this.selectedCake) return;

    this.isSubmitting = true;

    // 1. Upload Image (if needed) -> 2. Create User Info -> 3. Create Custom Order
    const processOrder = (finalImageUrl: string) => {

      // A. Add User Info to get an ID reference
      // Combine names for the single 'name' field
      const userPayload = {
        name: this.fullName.trim(),
        address: 0,
        email: this.email
      };

      this.cakesApi.addUserInfo(userPayload).subscribe({
        next: (res: any) => {
          let refId = res;
          try {
            // Handle potential JSON or raw string/number response
            // If it returns { "id": 123 } or similar
            const json = JSON.parse(res);
            if (json && (json.id || json.customCakeUserInfoId)) {
              refId = json.id || json.customCakeUserInfoId;
            } else if (typeof json === 'string' || typeof json === 'number') {
              refId = json;
            }
          } catch (e) { }

          // Ensure refId is a number
          const numericId = Number(refId);

          // B. Create Custom Order linked to User Info
          // Assuming orderID field is still used to link, but now it links to UserInfo
          const customPayload = {
            orderID: isNaN(numericId) ? 0 : numericId,
            customCakeOrder: this.imageMode ? 101 : 100, // Matching your updated note? No, the field is cakeIdentityID
            cakeIdentityID: this.imageMode ? 101 : 100,
            cakeName: this.selectedCake!.name,
            cakeSize: this.selectedSize.label,
            flowerDecoration: this.selectedFlower.label,
            notes: `Address: ${this.address}\n\n${this.note}`,
            imageURL: finalImageUrl // Send the image URL even for normal cakes (it will be the base cake image)
          };

          this.cakesApi.createCustomOrder(customPayload).subscribe({
            next: () => {
              this.isSubmitting = false;
              alert(`Custom Order Placed Successfully!`);
              this.closeDetail();
            },
            error: (err) => {
              this.isSubmitting = false;
              console.error('Custom Order Failed', err);

              let errorMsg = 'User details saved, but failed to save custom cake details.';

              if (err?.error?.errors) {
                // Extract validation errors
                const validationErrors = Object.entries(err.error.errors)
                  .map(([key, msgs]) => `${key}: ${(msgs as any[]).join(', ')}`)
                  .join('\n');
                errorMsg += `\n\nValidation Errors:\n${validationErrors}`;
              } else if (err?.error?.message) {
                errorMsg += `\n${err.error.message}`;
              }

              alert(errorMsg);
            }
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('User Info Save Failed', err);

          let msg = 'Failed to save user details.';
          if (err instanceof ProgressEvent || err?.status === 0) {
            msg = 'Cannot connect to server. Check CORS/API.';
          } else if (err?.error?.message) {
            msg = err.error.message;
          } else if (typeof err?.error === 'string') {
            msg = err.error;
          }
          alert(msg);
        }
      });
    };

    // Step 0: Upload Image if selected
    if (this.selectedFile) {
      this.cakesApi.uploadCustomImage(this.selectedFile).subscribe({
        next: (res) => {
          processOrder(res.path);
        },
        error: (err) => {
          this.isSubmitting = false;
          alert('Failed to upload image. Please try again.');
        }
      });
    } else {
      processOrder(this.customImageUrl || this.selectedCake.imageUrl);
    }
  }
}
