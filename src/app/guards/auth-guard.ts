import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

export const authGuard = () => {
  const apiService = inject(ApiService);
  const router = inject(Router);

  if (apiService.isLoggedIn()) {
    return true; // ¡Adelante, pase!
  } else {
    // ¡Alto! No está logueado, mandarlo al login
    router.navigate(['/login']);
    return false;
  }
};