import {Routes} from '@angular/router';
import {authGuard} from "./core/auth/auth.guard";
import {DashboardPage} from "./pages/dashboard/dashboard.page";
import {ListarEmpresasComponent} from "./features/empresa/components/listar-empresa/listar-empresas.component";
import {CadastrarEmpresaComponent} from "./features/empresa/components/cadastrar-empresa/cadastrar-empresa.component";
import {LoginPage} from "./pages/login/login.page";

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'dashboard',
    component: DashboardPage,
    canActivate: [authGuard]
  },
  {
    path: 'empresas',
    component: ListarEmpresasComponent,
    canActivate: [authGuard]
  },
  {
    path: 'empresas/cadastrar',
    component: CadastrarEmpresaComponent,
    canActivate: [authGuard]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/dashboard'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
