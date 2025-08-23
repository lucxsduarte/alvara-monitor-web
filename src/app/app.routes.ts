import {Routes} from '@angular/router';
import {authGuard} from "./core/auth/auth.guard";
import {DashboardPage} from "./pages/dashboard/dashboard.page";
import {ListCompaniesComponent} from "./features/company/components/listar-companies/list-companies.component";
import {CreateCompanyComponent} from "./features/company/components/create-company/create-company.component";
import {LoginPage} from "./pages/login/login.page";
import {UserManagementPage} from "./pages/admin/user-management/user-management.page";
import {roleGuard} from "./core/auth/role.guard";
import {loginGuard} from "./core/auth/login.guard";
import {NotificationSettingsPage} from "./pages/admin/notification-settings/notification-settings.page";

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
        component: ListCompaniesComponent
      },
      {
        path: 'cadastrar',
        component: CreateCompanyComponent
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
      {
        path: 'notificacoes',
        component: NotificationSettingsPage
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
