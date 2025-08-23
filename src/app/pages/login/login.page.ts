import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from "../../core/auth/auth.service";
import {ButtonModule} from "primeng/button";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  username: string = '';
  password: string = '';
  loginError: string = '';
  isLoading = false;
  isProd = !environment.useMockData;

  private router = inject(Router);
  private authService = inject(AuthService);

  login() {
    this.loginError = '';
    this.isLoading = true;

    this.authService.login({login: this.username, password: this.password}).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response) {
          void this.router.navigate(['/dashboard']);
        } else {
          this.loginError = 'Usuário e/ou senha inválidos';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loginError = 'Ocorreu um erro ao tentar conectar. Tente novamente.';
        console.error('Erro na subscrição do login:', err);
      }
    });
  }

  goToDemo(): void {
    window.open('https://demo-monitoramento-alvara.vercel.app', '_blank');
  }
}
