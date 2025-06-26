import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {NavbarComponent} from "./shared/layout/navbar/navbar.component";
import {PrimeNGConfig} from "primeng/api";
import {NgIf} from "@angular/common";
import {environment} from "./environments/environment";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    NgIf,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'alvara-monitor-web';

  private primengConfig = inject(PrimeNGConfig);
  private router = inject(Router);

  ngOnInit(): void {
    this.primengConfig.setTranslation({
      accept: 'Sim',
      reject: 'Cancelar'
    });

    console.log('Ambiente: ', environment.version)
  }

  get exibirNavbar() {
    return !this.router.url.includes('/login');
  }
}
