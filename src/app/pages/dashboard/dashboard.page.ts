import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {CompanyService} from "../../features/company/services/company.service";
import {Company} from "../../features/company/models/company.model";
import {CardModule} from 'primeng/card';
import {DividerModule} from 'primeng/divider';
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {TooltipModule} from "primeng/tooltip";
import {TagModule} from "primeng/tag";
import {Router} from "@angular/router";
import { createDateFromYYYYMMDD } from '../../utils/date.utils';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ExpiringLicenseDTO, DashboardSummaryDTO} from "./models/dashboard.dto";

interface ExpiringLicense {
  company: Company;
  licenseType: string;
  dueDate: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    DividerModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    TagModule,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardPage implements OnInit {

  companies: Company[] = [];
  licensesExpiringIn30Days: ExpiringLicense[] = [];
  upcomingExpirations: ExpiringLicense[] = [];
  expiredLicenses: ExpiringLicense[] = [];
  totalCompanies = 0;
  totalExpiredLicenses = 0;

  private companyService = inject(CompanyService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private readonly dashboardApiUrl = `${environment.apiUrl}/dashboard/summary`;

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    if (environment.useMockData) {
      this.companyService.getCompanies().subscribe(data => {
        this.companies = data;
        this.totalCompanies = data.length;
        this.filterCompaniesWithUpcomingExpirations();
      });
    } else {
      this.http.get<DashboardSummaryDTO>(this.dashboardApiUrl).subscribe({
        next: (summary) => {
          this.totalCompanies = summary.totalCompanies;
          this.totalExpiredLicenses = summary.totalExpiredLicenses;

          const mapDtoToAlvaraVencendo = (dto: ExpiringLicenseDTO): ExpiringLicense => ({
            company: { id: dto.companyId, name: dto.companyName } as Company,
            licenseType: dto.licenseType,
            dueDate: createDateFromYYYYMMDD(dto.expirationDate)!
          });

          this.licensesExpiringIn30Days = (summary.licensesExpiringIn30Days || []).map(mapDtoToAlvaraVencendo);
          this.upcomingExpirations = (summary.upcomingExpirations || []).map(mapDtoToAlvaraVencendo);
        },
        error: (err) => {
          console.error('Erro ao carregar dados do dashboard:', err);
        }
      });
    }
  }

  private filterCompaniesWithUpcomingExpirations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    thirtyDaysFromNow.setHours(23, 59, 59, 999);

    let allExpirations: ExpiringLicense[] = [];
    this.companies.forEach(empresa => {
      allExpirations = allExpirations.concat(this.extractLicensesFromCompany(empresa));
    });

    const sortedExpirations = allExpirations.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    this.licensesExpiringIn30Days = sortedExpirations.filter(v => v.dueDate >= today && v.dueDate <= thirtyDaysFromNow);
    const alreadyListedIds = new Set(this.licensesExpiringIn30Days.map(v => `${v.company.id}-${v.licenseType}`));
    this.upcomingExpirations = sortedExpirations.filter(v => v.dueDate > thirtyDaysFromNow && !alreadyListedIds.has(`${v.company.id}-${v.licenseType}`)).slice(0, 3);
    this.expiredLicenses = allExpirations.filter(v => v.dueDate < today);
    this.totalExpiredLicenses = this.expiredLicenses.length;
  }

  private extractLicensesFromCompany(company: Company): ExpiringLicense[] {
    const licensesFromCompany: ExpiringLicense[] = [];
    if (company.expLicenseFiredept) { licensesFromCompany.push({ company: company, licenseType: 'Bombeiros', dueDate: createDateFromYYYYMMDD(company.expLicenseFiredept)! }); }
    if (company.expLicenseSurveillance) { licensesFromCompany.push({ company: company, licenseType: 'Vigilância Sanitária', dueDate: createDateFromYYYYMMDD(company.expLicenseSurveillance)! }); }
    if (company.expLicensePolice) { licensesFromCompany.push({ company: company, licenseType: 'Polícia Civil', dueDate: createDateFromYYYYMMDD(company.expLicensePolice)! }); }
    if (company.expLicenseOperating) { licensesFromCompany.push({ company: company, licenseType: 'Funcionamento', dueDate: createDateFromYYYYMMDD(company.expLicenseOperating)! }); }
    return licensesFromCompany;
  }

  calculateDaysUntilExpiration(dueDate: Date): number {
    const todayWithoutTime = new Date();
    todayWithoutTime.setHours(0, 0, 0, 0);

    const dueDateWithoutTime = new Date(dueDate);
    dueDateWithoutTime.setHours(0, 0, 0, 0);

    const remainingTime = dueDateWithoutTime.getTime() - todayWithoutTime.getTime();
    return Math.ceil(remainingTime / (1000 * 3600 * 24));
  }

  getExpirationText(vencimento: Date): string {
    const todayWithoutTime = new Date();
    todayWithoutTime.setHours(0, 0, 0, 0);

    const dueDateWithoutTime = new Date(vencimento);
    dueDateWithoutTime.setHours(0, 0, 0, 0);

    const remainingTime = dueDateWithoutTime.getTime() - todayWithoutTime.getTime();
    const remainingDays = Math.ceil(remainingTime / (1000 * 3600 * 24));

    if (remainingDays > 0) {
      return `${remainingDays} DIAS`;
    } else if (remainingDays === 0) {
      return 'HOJE';
    }
    else {
      return 'VENCIDO';
    }
  }

  getDaysBadgeColor(daysUntilExpiration: number): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' {
    if (daysUntilExpiration < 0) {
      return 'danger';
    } else if (daysUntilExpiration <= 10) {
      return 'warning';
    } else if (daysUntilExpiration <= 30) {
      return 'info';
    } else {
      return 'secondary';
    }
  }

  goToExpiredLicenses() {
    void this.router.navigate(['/empresas'], { queryParams: { filtro: 'vencidos' } });
  }

  goToCompany(companyId: number) {
    void this.router.navigate(['/empresas'], { queryParams: { filtro: 'empresa', id: companyId } });
  }
}
