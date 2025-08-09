import { inject, Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import { Observable, of } from "rxjs";
import { Empresa } from "../models/empresa.model";
import { environment } from "../../../environments/environment";
import {addDaysAndFormat, createDateFromYYYYMMDD} from "../../../utils/date.utils";
import {FiltroStatusEmpresa} from "../models/enums/FiltroStatusEmpresa";

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private readonly apiUrl = `${environment.apiUrl}/companies`;
  private http = inject(HttpClient);

  private empresasBaseMock: Partial<Empresa>[] = [
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
  private empresasMockComDatas: Empresa[] | null = null;

  constructor() {
    if (environment.useMockData && !this.empresasMockComDatas) {
      this.empresasMockComDatas = this.generateDynamicMockData();
    }
  }

  buscarEmpresas(nome?: string, status?: FiltroStatusEmpresa): Observable<Empresa[]> {
    if (environment.useMockData) {
      let empresasFiltradas = [...this.empresasMockComDatas!];

      if (nome) {
        empresasFiltradas = empresasFiltradas.filter(e => e.name.toLowerCase().includes(nome.toLowerCase()));
      }

      if (status === FiltroStatusEmpresa.VENCIDOS) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        empresasFiltradas = empresasFiltradas.filter(e => {
          const vencimentos = [e.expLicenseFiredept, e.expLicenseOperating, e.expLicensePolice, e.expLicenseSurveillance];
          return vencimentos.some(v => v && createDateFromYYYYMMDD(v)! < hoje);
        });
      }

      return of(empresasFiltradas);
    } else {
      let params = new HttpParams();
      if (nome) { params = params.set('nome', nome); }
      if (status) { params = params.set('status', status); }
      return this.http.get<Empresa[]>(this.apiUrl, { params });
    }
  }

  buscarEmpresaPorId(id: number): Observable<Empresa | undefined> {
    if (environment.useMockData) {
      const empresa = this.empresasMockComDatas!.find(e => e.id === id);
      return of(empresa);
    } else {
      return this.http.get<Empresa>(`${this.apiUrl}/${id}`);
    }
  }

  salvarEmpresa(empresa: Omit<Empresa, 'id'>): Observable<Empresa> {
    if (environment.useMockData) {
      const novoId = Math.max(...this.empresasMockComDatas!.map(e => e.id)) + 1;
      const novaEmpresa = { ...empresa, id: novoId } as Empresa;
      this.empresasMockComDatas!.push(novaEmpresa);
      return of(novaEmpresa);
    } else {
      return this.http.post<Empresa>(this.apiUrl, empresa);
    }
  }

  deletarEmpresa(id: number): Observable<void> {
    if (environment.useMockData) {
      this.empresasMockComDatas = this.empresasMockComDatas!.filter(emp => emp.id !== id);
      return of(void 0);
    } else {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
  }

  atualizarEmpresa(empresa: Empresa): Observable<Empresa> {
    if (environment.useMockData) {
      const index = this.empresasMockComDatas!.findIndex(e => e.id === empresa.id);
      if (index >= 0) {
        this.empresasMockComDatas![index] = empresa;
      }

      return of(empresa);
    } else {
      return this.http.put<Empresa>(`${this.apiUrl}/${empresa.id}`, empresa);
    }
  }

  private generateDynamicMockData(): Empresa[] {
    const hoje = new Date();
    const mockData: Empresa[] = [];

    // 1. Empresa com alvará vencido (ex: 5 dias atrás)
    mockData.push({
      ...this.empresasBaseMock[0], // Alpha Alimentos
      expLicenseFiredept: addDaysAndFormat(hoje, -5),
      expLicenseOperating: addDaysAndFormat(hoje, 15),
      expLicensePolice: addDaysAndFormat(hoje, 60),
      expLicenseSurveillance: null
    } as Empresa);

    // 2. Empresa com alvará vencendo em breve (ex: 10 dias)
    mockData.push({
      ...this.empresasBaseMock[1],
      expLicenseFiredept: addDaysAndFormat(hoje, 10),
      expLicenseOperating: addDaysAndFormat(hoje, -20),
      expLicensePolice: addDaysAndFormat(hoje, 90),
      expLicenseSurveillance: null
    } as Empresa);

    // 3. Empresa com alvará vencendo após 30 dias (ex: 45 dias)
    mockData.push({
      ...this.empresasBaseMock[2],
      expLicenseFiredept: addDaysAndFormat(hoje, 45),
      expLicenseOperating: addDaysAndFormat(hoje, 120),
      expLicensePolice: null,
      expLicenseSurveillance: addDaysAndFormat(hoje, -10)
    } as Empresa);

    for (let i = 3; i < this.empresasBaseMock.length; i++) {
      const baseEmpresa = this.empresasBaseMock[i];
      const newEmpresa: Empresa = {
        id: baseEmpresa.id!,
        name: baseEmpresa.name!,
        expLicenseFiredept: Math.random() > 0.5 ? addDaysAndFormat(hoje, Math.floor(Math.random() * 180) - 30) : null,
        expLicenseOperating: Math.random() > 0.5 ? addDaysAndFormat(hoje, Math.floor(Math.random() * 180) - 30) : null,
        expLicensePolice: Math.random() > 0.5 ? addDaysAndFormat(hoje, Math.floor(Math.random() * 180) - 30) : null,
        expLicenseSurveillance: Math.random() > 0.5 ? addDaysAndFormat(hoje, Math.floor(Math.random() * 180) - 30) : null,
      };
      mockData.push(newEmpresa);
    }

    return mockData;
  }
}
