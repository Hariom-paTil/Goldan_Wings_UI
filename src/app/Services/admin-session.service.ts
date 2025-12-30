import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdminSessionService {
  private token: string | null = null;

  setToken(token: string): void {
    this.token = token;
  }

  clear(): void {
    this.token = null;
  }

  getToken(): string | null {
    return this.token;
  }

  hasToken(): boolean {
    return !!this.token;
  }
}
