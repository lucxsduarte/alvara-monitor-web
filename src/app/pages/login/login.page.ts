import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from "../../core/auth/auth.service";
import {Button} from "primeng/button";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  usuario: string = '';
  senha: string = '';
  erroLogin: string = '';
  isLoading = false;
  isProd = !environment.useMockData;

  private router = inject(Router);
  private authService = inject(AuthService);

  fazerLogin() {
    this.erroLogin = '';
    this.isLoading = true;

    this.authService.login({login: this.usuario, senha: this.senha}).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response) {
          void this.router.navigate(['/dashboard']);
        } else {
          this.erroLogin = 'Usuário e/ou senha inválidos';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.erroLogin = 'Ocorreu um erro ao tentar conectar. Tente novamente.';
        console.error('Erro na subscrição do login:', err);
      }
    });
  }

  irParaDemo(): void {
    window.open('https://demo-monitoramento-alvara.vercel.app', '_blank');
  }
}
