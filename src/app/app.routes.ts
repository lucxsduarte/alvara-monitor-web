import {Routes} from '@angular/router';
import {authGuard} from "./core/auth/auth.guard";
import {DashboardPage} from "./pages/dashboard/dashboard.page";
import {ListarEmpresasComponent} from "./features/empresa/components/listar-empresa/listar-empresas.component";
import {CadastrarEmpresaComponent} from "./features/empresa/components/cadastrar-empresa/cadastrar-empresa.component";
import {LoginPage} from "./pages/login/login.page";
import {UserManagementPage} from "./pages/admin/user-management/user-management.page";
import {roleGuard} from "./core/auth/role.guard";
import {loginGuard} from "./core/auth/login.guard";

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
    canActivate: [loginGuard]
  },
  {
    path: 'dashboard',
    component: DashboardPage,
    canActivate: [authGuard]
  },
  {
    path: 'empresas',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ListarEmpresasComponent
      },
      {
        path: 'cadastrar',
        component: CadastrarEmpresaComponent
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('ROLE_ADMIN')],
    children: [
      {
        path: 'usuarios',
        component: UserManagementPage
      },
    ]
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
