import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "./auth.service";
import {map, take, tap} from "rxjs";

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn().pipe(
    take(1),
    tap(loggedIn => {
      if (!loggedIn) {
        router.navigate(['/login']);
      }
    }),
    map(loggedIn => loggedIn),
  );
};
