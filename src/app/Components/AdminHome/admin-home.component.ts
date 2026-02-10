import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminSessionService } from '../../Services/admin-session.service';
import { OrdersService, Order } from '../../Services/orders.service';
import { CakesService } from '../../Services/cakes.service';
import { CustomCakeService } from '../../Services/custom-cake.service';
import { TreatsService } from '../../Services/treats.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss'],
})
export class AdminHomeComponent implements OnInit {
  currentSection: 'overview' | 'pop-orders' | 'add-cakes' | 'add-custom-cakes' | 'add-treats' = 'overview';
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

  // Custom CAke
  addCustomCakeForm!: FormGroup;
  addCustomCakeLoading = false;
  addCustomCakeError: string | null = null;
  addCustomCakeSuccess: string | null = null;
  customCakeImagePreview: string | null = null;

  // Add Treats
  addTreatForm!: FormGroup;
  addTreatLoading = false;
  addTreatError: string | null = null;
  addTreatSuccess: string | null = null;
  treatImagePreview: string | null = null;
  selectedTreatFile: File | null = null;

  constructor(
    private router: Router,
    private adminSession: AdminSessionService,
    private ordersService: OrdersService,
    private cakesService: CakesService,
    private customCakeService: CustomCakeService,
    private treatsService: TreatsService,
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
    this.initAddCakeForm();
    this.initAddCustomCakeForm();
    this.initAddTreatForm();
  }

  setSection(section: 'overview' | 'pop-orders' | 'add-cakes' | 'add-custom-cakes' | 'add-treats') {
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

  // --- Custom Cake Logic ---

  initAddCustomCakeForm() {
    this.addCustomCakeForm = this.formBuilder.group({
      cakeId: [100, [Validators.required]], // 100 for Regular, 101 for Photo
      cakeName: ['', [Validators.required, Validators.maxLength(60)]],
      cakeCommonSize: ['1 Kg', [Validators.required]],
      flower: [null], // Optional
      imageUrl: [null, [Validators.required]], // Compulsory for all types
    });
  }

  onCustomCakeImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Use existing upload logic from cake service or just display preview if only URL is needed
    // Usually we need to upload it first. For now, let's just preview.
    const objectUrl = URL.createObjectURL(file);
    this.customCakeImagePreview = objectUrl;

    // If you need to actually upload:
    this.cakesService.uploadImage(file, 'assets/CustomCakeImage').subscribe({
      next: (res) => {
        this.addCustomCakeForm.patchValue({ imageUrl: res.path }); // Adjust path if needed
      },
      error: (err) => console.error('Upload failed', err)
    });
  }

  onSubmitAddCustomCake() {
    if (this.addCustomCakeForm.invalid) {
      this.addCustomCakeForm.markAllAsTouched();
      return;
    }

    this.addCustomCakeLoading = true;
    this.addCustomCakeError = null;
    this.addCustomCakeSuccess = null;

    const formValue = this.addCustomCakeForm.value;

    // Send payload directly - imageUrl is now compulsory for both types
    const payload = { ...formValue };

    this.customCakeService.addCustomCake(payload).subscribe({
      next: (res) => {
        this.addCustomCakeLoading = false;
        this.addCustomCakeSuccess = 'Custom cake added successfully!';

        // Reset form
        this.addCustomCakeForm.reset();
        this.addCustomCakeForm.patchValue({
          cakeId: 100,
          cakeName: '',
          cakeCommonSize: '1 Kg',
          flower: null,
          imageUrl: null
        });

        this.customCakeImagePreview = null;
        this.showAddCakeToast('Custom Cake added!');
      },
      error: (err) => {
        this.addCustomCakeLoading = false;
        this.addCustomCakeError = 'Failed to add custom cake.';
        console.error(err);
      }
    });
  }

  // --- Add Treat Logic ---

  initAddTreatForm() {
    this.addTreatForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(60)]],
      category: ['Chocolates', [Validators.required]],
      price: [null, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required]],
      imageUrl: ['', [Validators.required]],
      isPopular: [false]
    });
  }

  onTreatImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedTreatFile = file;
    const objectUrl = URL.createObjectURL(file);
    this.treatImagePreview = objectUrl;

    // Upload immediately or wait for submit? Consistent with others -> separate upload or on submit.
    // Let's reuse cakesService upload for now since it points to the upload server.
    // folder: 'assets/TreatSectionImg'

    this.cakesService.uploadImage(file, 'assets/TreatSectionImg').subscribe({
      next: (res) => {
        this.addTreatForm.patchValue({ imageUrl: res.path });
      },
      error: (err) => {
        console.error('Treat image upload failed', err);
        this.addTreatError = 'Failed to upload image.';
      }
    });
  }

  onSubmitAddTreat() {
    if (this.addTreatForm.invalid) {
      this.addTreatForm.markAllAsTouched();
      return;
    }

    this.addTreatLoading = true;
    this.addTreatError = null;
    this.addTreatSuccess = null;

    const { name, category, price, description, imageUrl, isPopular } = this.addTreatForm.value;

    const payload = {
      name,
      category,
      price,
      description,
      imageUrl,
      isPopular: !!isPopular,
      createdAt: new Date().toISOString()
    };

    this.treatsService.addTreat(payload).subscribe({
      next: () => {
        this.addTreatLoading = false;
        this.addTreatSuccess = 'Treat item added successfully!';
        this.showAddCakeToast('Treat added!');
        this.resetAddTreatForm();
      },
      error: (err) => {
        console.error(err);
        this.addTreatLoading = false;
        this.addTreatError = 'Failed to add treat.';
      }
    });
  }

  resetAddTreatForm() {
    this.addTreatForm.reset({
      category: 'Chocolates',
      isPopular: false
    });
    this.treatImagePreview = null;
    this.selectedTreatFile = null;
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

