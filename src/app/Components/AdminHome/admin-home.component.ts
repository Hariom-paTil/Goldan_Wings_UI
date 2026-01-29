import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminSessionService } from '../../Services/admin-session.service';
import { OrdersService, Order } from '../../Services/orders.service';
import { CakesService } from '../../Services/cakes.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss'],
})
export class AdminHomeComponent implements OnInit {
  currentSection: 'overview' | 'pop-orders' | 'add-cakes' = 'overview';
  orders: Order[] = [];
  loading = false;
  error: string | null = null;
  addCakeForm!: FormGroup;
  addCakeLoading = false;
  addCakeError: string | null = null;
  addCakeSuccess: string | null = null;
  selectedImageName: string | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  addCakeToastVisible = false;
  addCakeToastMessage = '';
  private addCakeToastTimer: any;

  constructor(
    private router: Router,
    private adminSession: AdminSessionService,
    private ordersService: OrdersService,
    private cakesService: CakesService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    // Check if we need to navigate to a specific section based on URL
    const url = this.router.url;
    if (url.includes('pop-orders')) {
      this.currentSection = 'pop-orders';
      this.loadOrders();
    } else if (url.includes('add-cakes')) {
      this.currentSection = 'add-cakes';
    }

    this.initAddCakeForm();
  }

  setSection(section: 'overview' | 'pop-orders' | 'add-cakes') {
    this.currentSection = section;
    if (section === 'pop-orders') {
      this.loadOrders();
    }
  }

  loadOrders() {
    this.loading = true;
    this.error = null;
    this.ordersService.getOrders().subscribe({
      next: (data: Order[]) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
      }
    });
  }

  calculateTotal(order: Order): number {
    return this.ordersService.calculateTotalAmount(order.cakes);
  }

  initAddCakeForm() {
    this.addCakeForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(60)]],
      flavor: ['', [Validators.required, Validators.maxLength(40)]],
      price: [null, [Validators.required, Validators.min(1)]],
      imageUrl: ['', [Validators.required]],
    });
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    const safeName = this.sanitizeFileName(file.name);
    this.selectedImageName = safeName;
    const imageUrl = `/assets/Img/${safeName}`;
    this.addCakeForm.patchValue({ imageUrl });

    const objectUrl = URL.createObjectURL(file);
    this.imagePreview = objectUrl;
  }

  onSubmitAddCake() {
    if (!this.addCakeForm) return;
    if (this.addCakeForm.invalid) {
      this.addCakeForm.markAllAsTouched();
      return;
    }

    const { name, flavor, price, imageUrl } = this.addCakeForm.value;

    this.addCakeLoading = true;
    this.addCakeError = null;
    this.addCakeSuccess = null;

    const submitCake = (finalImageUrl: string) => {
      const payload = {
        name: (name || '').trim(),
        flavor: (flavor || '').trim(),
        price: Number(price),
        imageUrl: (finalImageUrl || '').trim(),
      };

      this.cakesService.addCake(payload).subscribe({
        next: () => {
          this.addCakeLoading = false;
          this.addCakeSuccess = 'Cake added successfully.';
          this.showAddCakeToast('Cake added successfully.');
          this.resetAddCakeForm();
        },
        error: (err) => {
          console.error('Error adding cake:', err);
          this.addCakeLoading = false;
          this.addCakeError = 'Failed to add cake. Please try again.';
        }
      });
    };

    if (this.selectedFile) {
      this.cakesService.uploadImage(this.selectedFile).subscribe({
        next: (res) => {
          submitCake(res.path);
        },
        error: (err) => {
          console.error('Error uploading image:', err);
          this.addCakeLoading = false;
          this.addCakeError = 'Failed to upload image. Ensure upload server is running.';
        }
      });
    } else {
      submitCake(imageUrl);
    }
  }

  resetAddCakeForm() {
    this.addCakeForm.reset();
    this.addCakeError = null;
    this.addCakeSuccess = null;
    this.selectedImageName = null;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  private showAddCakeToast(message: string) {
    this.addCakeToastMessage = message;
    this.addCakeToastVisible = true;
    if (this.addCakeToastTimer) {
      clearTimeout(this.addCakeToastTimer);
    }
    this.addCakeToastTimer = setTimeout(() => {
      this.addCakeToastVisible = false;
      this.addCakeToastMessage = '';
    }, 2200);
  }

  private sanitizeFileName(name: string): string {
    return (name || '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .replace(/-+/g, '-');
  }

  logout() {
    this.adminSession.clear();
    this.router.navigate(['/about/G_W_AdminPanel']);
  }
}

