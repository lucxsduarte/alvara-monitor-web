import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {MenubarModule} from "primeng/menubar";
import {MenuItem, PrimeIcons} from "primeng/api";
import {SidebarModule} from "primeng/sidebar";
import {Subscription} from "rxjs";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule, SidebarModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authSubscription!: Subscription;
  private authService = inject(AuthService);

  items: MenuItem[] = [];

  ngOnInit() {
    this.authSubscription = this.authService.isLoggedIn().subscribe(() => {
      this.setupMenu();
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  setupMenu() {
    this.items = [
      {
        label: 'Home',
        icon: PrimeIcons.HOME,
        routerLink: '/dashboard'
      },
      {
        label: 'Empresas',
        icon: PrimeIcons.BUILDING,
        items: [
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
        ]
      },
    ];

    if (this.authService.userHasRole('ROLE_ADMIN')) {
      this.items.push({
        label: 'Admin',
        icon: PrimeIcons.COG,
        items: [
          {
            label: 'Gerenciar Usuários',
            icon: PrimeIcons.USERS,
            routerLink: '/admin/usuarios'
          }
        ]
      });
    }
  }
}
