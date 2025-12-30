import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminLoginService } from '../../Services/admin-login.service';
import { AdminSessionService } from '../../Services/admin-session.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = false;
  error: string | null = null;
  success = false;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private adminLoginService: AdminLoginService,
    private adminSession: AdminSessionService
  ) {}

  submit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value as {
      email: string;
      password: string;
    };

    this.loading = true;
    this.error = null;
    this.success = false;
    this.successMessage = null;

    const payload = {
      email: email,
      password: password,
    };
    this.adminLoginService.login(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        console.log('Admin login response:', res);

        // Treat as success
        this.success = true;
        this.successMessage = 'Admin login successful! Redirecting...';

        // Store admin token only in memory for this session
        const adminToken = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.adminSession.setToken(adminToken);

        // Redirect to admin home modal after 0.8 seconds
        setTimeout(() => {
          this.router.navigate(['/about/G_W_AdminPanel/home']);
        }, 800);
      },
      error: (err: any) => {
        this.loading = false;
        this.success = false;

        let msg = 'Admin login failed';

        if (err instanceof ProgressEvent || err?.status === 0 || err?.type === 'error') {
          msg = 'Cannot connect to server. Please try again.';
        } else if (err?.status === 401 || err?.status === 400) {
          msg = 'Invalid email or password.';
        } else if (err?.error) {
          if (typeof err.error === 'string') {
            msg = err.error;
          } else if (err.error.message) {
            msg = err.error.message;
          }
        }

        this.error = msg;
      },
    });
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
