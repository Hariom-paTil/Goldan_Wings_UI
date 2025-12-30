import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface User {
  email: string;
  name?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _user$ = new BehaviorSubject<User | null>(null);
  readonly user$ = this._user$.asObservable();

 
  // Backend login endpoint (updated)
  private baseUrl = 'http://localhost:5003/api/Login/register';

  constructor(private http: HttpClient) {}


  login(email: string, password: string): Observable<string> {
    // API expects PasswordHash matching backend UserLoginInfo.PasswordHash
    const payload = {
      Email: email,
      PasswordHash: password,
    };

    return this.http.post<any>(this.baseUrl, payload).pipe(
      map(resp => this.normalizeResponse(resp)),
      tap((resp: any) => {
        // Always treat as success from API perspective
        // Store the user and token
        const serverUser = typeof resp === 'object' && resp !== null ? resp.user : null;
        const user: User = serverUser ?? { email };
        this._user$.next(user);
        try {
          if (typeof window !== 'undefined' && 'localStorage' in window) {
            window.localStorage.setItem('auth_user', JSON.stringify(user));
            if (resp?.token) {
              window.localStorage.setItem('auth_token', resp.token);
            }
          }
        } catch {}
      }),
      map((resp: any) => this.extractSuccessMessage(resp)),
      catchError(err => {
        // Check if the error response actually contains a success message
        const normalizedError = this.normalizeResponse(err?.error);
        const hasSuccessText = this.containsSuccess(normalizedError?.text) || 
                               this.containsSuccess(normalizedError?.message);
        
        if (hasSuccessText) {
          // Backend returned success message with error status code
          // Treat it as success - store user and return success message
          const email = payload.Email;
          const user: User = { email };
          this._user$.next(user);
          try {
            if (typeof window !== 'undefined' && 'localStorage' in window) {
              window.localStorage.setItem('auth_user', JSON.stringify(user));
            }
          } catch {}
          return throwError(() => ({ isActuallySuccess: true, message: this.extractSuccessMessage(normalizedError) }));
        }

        // Handle actual errors
        let message = 'Registration failed';
        if (err instanceof ProgressEvent || err?.type === 'error' || err?.status === 0) {
          message = 'Network error or CORS blocked — check server, browser console, and CORS settings.';
        } else if (err?.status === 400 && err?.error && err.error.errors) {
          // Aggregate model validation messages: { errors: { Field: ["msg"] } }
          const errs = err.error.errors;
          const msgs = Object.values(errs).flat().join(' ');
          message = msgs || 'Validation failed';
        } else if (err?.error) {
          const normalized = this.normalizeResponse(err.error);
          message = this.extractSuccessMessage(normalized) || 'Registration failed. Please try again.';
        } else if (err?.message) {
          message = err.message;
        }
        return throwError(() => new Error(message));
      })
    );
  }

  logout() {
    const storage = (typeof window !== 'undefined' && 'localStorage' in window) ? window.localStorage : null;
    if (storage) {
      storage.removeItem('auth_token');
      storage.removeItem('auth_user');
    }
    this._user$.next(null);
  }

  
  restore(): void {
    try {
      const storage = (typeof window !== 'undefined' && 'localStorage' in window) ? window.localStorage : null;
      if (storage) {
        const saved = storage.getItem('auth_user');
        if (saved) {
          try {
            const user = JSON.parse(saved) as User;
            this._user$.next(user);
          } catch {}
        }
      }
    } catch (e) {
      // ignore
    }
  }

  private normalizeResponse(resp: any): any {
    if (resp == null) {
      return {};
    }
    if (typeof resp === 'string') {
      const trimmed = resp.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          return parsed ?? {};
        } catch {
          return { message: resp, text: resp };
        }
      }
      return { message: resp, text: resp };
    }
    return resp;
  }

  private containsSuccess(value: unknown): boolean {
    return typeof value === 'string' && value.toLowerCase().includes('success');
  }

  private extractSuccessMessage(resp: any): string {
    if (resp == null) {
      return 'Signed in successfully';
    }
    if (typeof resp === 'string') {
      return resp;
    }
    if (typeof resp.message === 'string' && resp.message.trim()) {
      return resp.message;
    }
    if (typeof resp.text === 'string' && resp.text.trim()) {
      return resp.text;
    }
    if (typeof resp.statusDescription === 'string' && resp.statusDescription.trim()) {
      return resp.statusDescription;
    }
    return 'Signed in successfully';
  }
}
