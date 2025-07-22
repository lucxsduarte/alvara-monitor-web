import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { MenuItem, PrimeIcons } from "primeng/api";
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { SidebarModule } from 'primeng/sidebar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ToolbarModule,
    ButtonModule,
    MenuModule,
    SidebarModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  empresaMenuItems: MenuItem[] = [];
  adminMenuItems: MenuItem[] = [];

  isLoggedIn = false;
  isAdmin = false;
  sidebarVisible = false;

  private authSubscription!: Subscription;
  private authService = inject(AuthService);

  ngOnInit() {
    this.setupMenus();

    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = this.authService.userHasRole('ROLE_ADMIN');
    });
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  setupMenus() {
    this.empresaMenuItems = [
      {
        label: 'Ver todas',
        icon: PrimeIcons.EYE,
        routerLink: '/empresas'
      },
      {
        label: 'Adicionar',
        icon: PrimeIcons.PLUS,
        routerLink: '/empresas/cadastrar'
      },
    ];

    this.adminMenuItems = [
      {
        label: 'Usuários',
        icon: PrimeIcons.USERS,
        routerLink: '/admin/usuarios'
      },
      {
        label: 'Notificações',
        icon: PrimeIcons.ENVELOPE,
        routerLink: '/admin/notificacoes'
      }
    ];
  }

  logout(): void {
    this.authService.logout();
  }
}
