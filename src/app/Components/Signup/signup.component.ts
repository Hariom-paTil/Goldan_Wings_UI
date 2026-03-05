import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnDestroy {
  @Output() close = new EventEmitter<void>();

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = false;
  error: string | null = null;
  success = false;
  successMessage: string | null = null;
  mode: 'login' | 'signup' = 'signup';
  private autoCloseTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService) { }

  setMode(newMode: 'login' | 'signup') {
    this.mode = newMode;
    this.error = null;
    this.success = false;
    this.successMessage = null;
    this.form.reset();
  }

  submit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.value as { email: string; password: string };
    this.loading = true;
    this.error = null;
    this.success = false;
    this.successMessage = null;

    const authCall = this.mode === 'login'
      ? this.auth.loginUser(email, password)
      : this.auth.registerUser(email, password);

    authCall.subscribe({
      next: (message: string) => {
        this.loading = false;
        this.success = true;
        this.successMessage = message || (this.mode === 'login' ? 'Logged in successfully' : 'User registered successfully');
        this.form.reset();
        this.scheduleAutoClose();
      },
      error: (err: any) => {
        this.loading = false;

        // Check if it's actually a success disguised as an error
        if (err?.isActuallySuccess) {
          this.success = true;
          this.successMessage = err.message || (this.mode === 'login' ? 'Logged in successfully' : 'User registered successfully');
          this.form.reset();
          this.scheduleAutoClose();
          return;
        }

        this.success = false;
        // Show helpful message for network/CORS failures (ProgressEvent) and server messages
        if (err instanceof ProgressEvent || err?.type === 'error' || err?.status === 0) {
          this.error = 'Network error or CORS blocked — check the browser console and server.';
        } else {
          this.error = err?.message || err?.error?.message || (this.mode === 'login' ? 'Login failed. Please try again.' : 'Registration failed. Please try again.');
        }
      },
    });
  }

  cancel() {
    this.clearAutoClose();
    this.close.emit();
  }

  ngOnDestroy(): void {
    this.clearAutoClose();
  }

  private scheduleAutoClose() {
    this.clearAutoClose();
    this.autoCloseTimer = setTimeout(() => this.close.emit(), 1200);
  }

  private clearAutoClose() {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
  }
}
