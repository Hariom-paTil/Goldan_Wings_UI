import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminSessionService } from '../Services/admin-session.service';

// Protect admin home; if not logged in for this session, go back to login.
export const adminAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const session = inject(AdminSessionService);
  if (!session.hasToken()) {
    router.navigate(['/about/G_W_AdminPanel']);
    return false;
  }
  return true;
};
