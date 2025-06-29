import {APP_INITIALIZER, ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {provideAnimations} from "@angular/platform-browser/animations";
import {MessageService, PrimeNGConfig} from "primeng/api";
import {AuthService} from "./core/auth/auth.service";
import {jwtInterceptor} from "./core/auth/jwt.interceptor";

export function authInitializer(authService: AuthService): () => void {
  return () => authService.loadUserFromToken();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimations(),
    MessageService,
    PrimeNGConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: authInitializer,
      deps: [AuthService],
      multi: true
    }
  ]
};
