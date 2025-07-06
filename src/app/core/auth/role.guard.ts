import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from './auth.service';
import {map, take} from 'rxjs';

export const roleGuard = (requiredRole: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
      take(1),
      map(user => {
        const hasPermission = user?.roles.includes(requiredRole) ?? false;

        if (hasPermission) {
          return true;
        }

        console.error('Acesso negado.');
        void router.navigate(['/dashboard']);
        return false;
      })
    );
  };
};
