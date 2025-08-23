import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import { Observable, of } from "rxjs";
import { Company } from "../models/company.model";
import { environment } from "../../../environments/environment";
import {addDaysAndFormat, createDateFromYYYYMMDD} from "../../../utils/date.utils";
import {CompanyStatusFilter} from "../models/enums/CompanyStatusFilter";

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly apiUrl = `${environment.apiUrl}/companies`;
  private http = inject(HttpClient);

  private baseCompaniesMock: Partial<Company>[] = [
    { id: 1, name: "Alpha Alimentos" },
    { id: 2, name: "Beta Construções" },
    { id: 3, name: "Gama Logística" },
    { id: 4, name: "Delta Saúde" },
    { id: 5, name: "Epsilon Varejo" },
    { id: 6, name: "Zeta Financeira" },
    { id: 7, name: "Eta Transportes" },
    { id: 8, name: "Theta Eventos" },
    { id: 9, name: "Iota Consultoria" },
    { id: 10, name: "Kappa Educacional" },
    { id: 11, name: "Lambda Moda" },
    { id: 12, name: "Mu Software" },
    { id: 13, name: "Nu Energia" },
    { id: 14, name: "Xi Agropecuária" },
    { id: 15, name: "Omicron Estética" },
    { id: 16, name: "Pi Engenharia" },
    { id: 17, name: "Rho Imobiliária" },
    { id: 18, name: "Sigma Hotelaria" },
    { id: 19, name: "Tau Restaurante" },
    { id: 20, name: "Upsilon Academia" }
  ];
  private companiesMockWithDates: Company[] | null = null;

  constructor() {
    if (environment.useMockData && !this.companiesMockWithDates) {
      this.companiesMockWithDates = this.generateDynamicMockData();
    }
  }

  getCompanies(name?: string, status?: CompanyStatusFilter): Observable<Company[]> {
    if (environment.useMockData) {
      let filteredCompanies = [...this.companiesMockWithDates!];

      if (name) {
        filteredCompanies = filteredCompanies.filter(e => e.name.toLowerCase().includes(name.toLowerCase()));
      }

      if (status === CompanyStatusFilter.EXPIRED) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filteredCompanies = filteredCompanies.filter(e => {
          const dueDates = [e.expLicenseFiredept, e.expLicenseOperating, e.expLicensePolice, e.expLicenseSurveillance];
          return dueDates.some(v => v && createDateFromYYYYMMDD(v)! < today);
        });
      }

      return of(filteredCompanies);
    } else {
      let params = new HttpParams();
      if (name) { params = params.set('nome', name); }
      if (status) { params = params.set('status', status); }
      return this.http.get<Company[]>(this.apiUrl, { params });
    }
  }

  getCompanyById(id: number): Observable<Company | undefined> {
    if (environment.useMockData) {
      const company = this.companiesMockWithDates!.find(e => e.id === id);
      return of(company);
    } else {
      return this.http.get<Company>(`${this.apiUrl}/${id}`);
    }
  }

  saveCompany(company: Omit<Company, 'id'>): Observable<Company> {
    if (environment.useMockData) {
      const newId = Math.max(...this.companiesMockWithDates!.map(e => e.id)) + 1;
      const newCompany = { ...company, id: newId } as Company;
      this.companiesMockWithDates!.push(newCompany);
      return of(newCompany);
    } else {
      return this.http.post<Company>(this.apiUrl, company);
    }
  }

  deleteCompany(id: number): Observable<void> {
    if (environment.useMockData) {
      this.companiesMockWithDates = this.companiesMockWithDates!.filter(emp => emp.id !== id);
      return of(void 0);
    } else {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
  }

  updateCompany(company: Company): Observable<Company> {
    if (environment.useMockData) {
      const index = this.companiesMockWithDates!.findIndex(e => e.id === company.id);
      if (index >= 0) {
        this.companiesMockWithDates![index] = company;
      }

      return of(company);
    } else {
      return this.http.put<Company>(`${this.apiUrl}/${company.id}`, company);
    }
  }

  private generateDynamicMockData(): Company[] {
    const today = new Date();
    const mockData: Company[] = [];

    // 1. Empresa com alvará vencido (ex: 5 dias atrás)
    mockData.push({
      ...this.baseCompaniesMock[0], // Alpha Alimentos
      expLicenseFiredept: addDaysAndFormat(today, -5),
      expLicenseOperating: addDaysAndFormat(today, 15),
      expLicensePolice: addDaysAndFormat(today, 60),
      expLicenseSurveillance: null
    } as Company);

    // 2. Empresa com alvará vencendo em breve (ex: 10 dias)
    mockData.push({
      ...this.baseCompaniesMock[1],
      expLicenseFiredept: addDaysAndFormat(today, 10),
      expLicenseOperating: addDaysAndFormat(today, -20),
      expLicensePolice: addDaysAndFormat(today, 90),
      expLicenseSurveillance: null
    } as Company);

    // 3. Empresa com alvará vencendo após 30 dias (ex: 45 dias)
    mockData.push({
      ...this.baseCompaniesMock[2],
      expLicenseFiredept: addDaysAndFormat(today, 45),
      expLicenseOperating: addDaysAndFormat(today, 120),
      expLicensePolice: null,
      expLicenseSurveillance: addDaysAndFormat(today, -10)
    } as Company);

    for (let i = 3; i < this.baseCompaniesMock.length; i++) {
      const baseCompany = this.baseCompaniesMock[i];
      const newCompany: Company = {
        id: baseCompany.id!,
        name: baseCompany.name!,
        expLicenseFiredept: Math.random() > 0.5 ? addDaysAndFormat(today, Math.floor(Math.random() * 180) - 30) : null,
        expLicenseOperating: Math.random() > 0.5 ? addDaysAndFormat(today, Math.floor(Math.random() * 180) - 30) : null,
        expLicensePolice: Math.random() > 0.5 ? addDaysAndFormat(today, Math.floor(Math.random() * 180) - 30) : null,
        expLicenseSurveillance: Math.random() > 0.5 ? addDaysAndFormat(today, Math.floor(Math.random() * 180) - 30) : null,
      };
      mockData.push(newCompany);
    }

    return mockData;
  }
}
