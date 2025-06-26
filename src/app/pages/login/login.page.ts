import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {AuthService} from "../../core/auth/auth.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  usuario: string = '';
  senha: string = '';
  erroLogin: string = '';

  private router = inject(Router);
  private authService = inject(AuthService);

  fazerLogin() {
    this.erroLogin = '';

    this.authService.login({ name: this.usuario, password: this.senha }).subscribe((response) => {
      if (response) {
        this.router.navigate(['/dashboard']);
      } else {
        this.erroLogin = 'Usuário e/ou senha inválidos';
      }
    });
  }
}
