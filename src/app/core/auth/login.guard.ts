import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from './auth.service';
import {map, take} from 'rxjs';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn().pipe(
    take(1),
    map(isLoggedIn => {
      if (isLoggedIn) {
        void router.navigate(['/dashboard']);
        return false;
      }

      return true;
    })
  );
};
