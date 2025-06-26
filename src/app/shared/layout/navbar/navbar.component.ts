import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {MenubarModule} from "primeng/menubar";
import {MenuItem, PrimeIcons} from "primeng/api";
import {SidebarModule} from "primeng/sidebar";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule, SidebarModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  items: MenuItem[] = [];

  ngOnInit() {
    this.setupMenu();
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
    ]
  }

  constructor() {
  }
}
